import os

# Télémétrie Gradio / Hub (évite appels HF inutiles en usage local).
os.environ.setdefault("GRADIO_ANALYTICS_ENABLED", "false")

import time
import pdb
import re

import gradio as gr
import numpy as np
import sys
import subprocess

from huggingface_hub import snapshot_download
import requests

import argparse
import os
from omegaconf import OmegaConf
import numpy as np
import cv2
import torch
import glob
import pickle
from tqdm import tqdm
import copy
from argparse import Namespace
import shutil
import gdown
import imageio
import ffmpeg
from moviepy.editor import *
from transformers import WhisperModel

ProjectDir = os.path.abspath(os.path.dirname(__file__))
CheckpointsDir = os.path.join(ProjectDir, "models")


def _filepath_from_gradio_media(val):
    """Normalize Gradio 5 outputs: FileData (.path), str/Path, VideoData (.video), dict."""
    if val is None:
        return None
    if isinstance(val, str):
        s = val.strip()
        return s or None
    if isinstance(val, (list, tuple)):
        if not val:
            return None
        return _filepath_from_gradio_media(val[0])
    # gr.Video : modèle VideoData { video: FileData }
    v_nested = getattr(val, "video", None)
    if v_nested is not None and v_nested is not val:
        got = _filepath_from_gradio_media(v_nested)
        if got:
            return got
    p = getattr(val, "path", None)
    if isinstance(p, str) and p.strip():
        return p.strip()
    if isinstance(val, dict):
        for k in ("path", "video", "name"):
            v = val.get(k)
            if isinstance(v, str) and v.strip():
                return v.strip()
        return None
    if hasattr(val, "__fspath__"):
        try:
            s = os.fspath(val)
        except TypeError:
            return None
        s = str(s).strip()
        return s or None
    return None


@torch.no_grad()
def debug_inpainting(video_path, bbox_shift, extra_margin=10, parsing_mode="jaw", 
                    left_cheek_width=90, right_cheek_width=90):
    """Debug inpainting parameters, only process the first frame"""
    video_path = _filepath_from_gradio_media(video_path)
    if not video_path:
        raise gr.Error("Chargez une vidéo ou une image de référence avant de tester l'inpainting.")
    if not os.path.isfile(video_path):
        raise gr.Error("Référence invalide : fichier introuvable.")
    # Set default parameters
    args_dict = {
        "result_dir": './results/debug', 
        "fps": 25, 
        "batch_size": 1, 
        "output_vid_name": '', 
        "use_saved_coord": False,
        "audio_padding_length_left": 2,
        "audio_padding_length_right": 2,
        "version": "v15",
        "extra_margin": extra_margin,
        "parsing_mode": parsing_mode,
        "left_cheek_width": left_cheek_width,
        "right_cheek_width": right_cheek_width
    }
    args = Namespace(**args_dict)

    # Create debug directory
    os.makedirs(args.result_dir, exist_ok=True)
    
    # Read first frame
    if get_file_type(video_path) == "video":
        reader = imageio.get_reader(video_path)
        first_frame = reader.get_data(0)
        reader.close()
    else:
        first_frame = cv2.imread(video_path)
        first_frame = cv2.cvtColor(first_frame, cv2.COLOR_BGR2RGB)
    
    # Save first frame
    debug_frame_path = os.path.join(args.result_dir, "debug_frame.png")
    cv2.imwrite(debug_frame_path, cv2.cvtColor(first_frame, cv2.COLOR_RGB2BGR))
    
    # Get face coordinates
    coord_list, frame_list = get_landmark_and_bbox([debug_frame_path], bbox_shift)
    bbox = coord_list[0]
    frame = frame_list[0]
    
    if bbox == coord_placeholder:
        return None, "No face detected, please adjust bbox_shift parameter"
    
    # Initialize face parser
    fp = FaceParsing(
        left_cheek_width=args.left_cheek_width,
        right_cheek_width=args.right_cheek_width
    )
    
    # Process first frame
    x1, y1, x2, y2 = bbox
    y2 = y2 + args.extra_margin
    y2 = min(y2, frame.shape[0])
    crop_frame = frame[y1:y2, x1:x2]
    crop_frame = cv2.resize(crop_frame,(256,256),interpolation = cv2.INTER_LANCZOS4)
    
    # Generate random audio features
    random_audio = torch.randn(1, 50, 384, device=device, dtype=weight_dtype)
    audio_feature = pe(random_audio)
    
    # Get latents
    latents = vae.get_latents_for_unet(crop_frame)
    latents = latents.to(dtype=weight_dtype)
    
    # Generate prediction results
    pred_latents = unet.model(latents, timesteps, encoder_hidden_states=audio_feature).sample
    recon = vae.decode_latents(pred_latents)
    
    # Inpaint back to original image
    res_frame = recon[0]
    res_frame = cv2.resize(res_frame.astype(np.uint8),(x2-x1,y2-y1))
    combine_frame = get_image(frame, res_frame, [x1, y1, x2, y2], mode=args.parsing_mode, fp=fp)
    
    # Save results (no need to convert color space again since get_image already returns RGB format)
    debug_result_path = os.path.join(args.result_dir, "debug_result.png")
    cv2.imwrite(debug_result_path, combine_frame)
    
    # Create information text
    info_text = f"Parameter information:\n" + \
                f"bbox_shift: {bbox_shift}\n" + \
                f"extra_margin: {extra_margin}\n" + \
                f"parsing_mode: {parsing_mode}\n" + \
                f"left_cheek_width: {left_cheek_width}\n" + \
                f"right_cheek_width: {right_cheek_width}\n" + \
                f"Detected face coordinates: [{x1}, {y1}, {x2}, {y2}]"
    
    # get_image returns BGR numpy; Gradio Image expects RGB
    return cv2.cvtColor(combine_frame, cv2.COLOR_BGR2RGB), info_text

def print_directory_contents(path):
    for child in os.listdir(path):
        child_path = os.path.join(path, child)
        if os.path.isdir(child_path):
            print(child_path)

def download_model():
    # 检查必需的模型文件是否存在
    # (clefs uniques : en Python les cles dupliquees ecrasent les precedentes)
    required_models = {
        "MuseTalk UNet": f"{CheckpointsDir}/musetalkV15/unet.pth",
        "MuseTalk config": f"{CheckpointsDir}/musetalkV15/musetalk.json",
        "SD VAE": f"{CheckpointsDir}/sd-vae/config.json",
        "Whisper": f"{CheckpointsDir}/whisper/config.json",
        "DWPose": f"{CheckpointsDir}/dwpose/dw-ll_ucoco_384.pth",
        "SyncNet": f"{CheckpointsDir}/syncnet/latentsync_syncnet.pt",
        "Face Parse": f"{CheckpointsDir}/face-parse-bisent/79999_iter.pth",
        "ResNet": f"{CheckpointsDir}/face-parse-bisent/resnet18-5c106cde.pth"
    }
    
    missing_models = []
    for model_name, model_path in required_models.items():
        if not os.path.exists(model_path):
            missing_models.append(model_name)
    
    if missing_models:
        # 全用英文
        print("The following required model files are missing:")
        for model in missing_models:
            print(f"- {model}")
        print("\nPlease run the download script to download the missing models:")
        if sys.platform == "win32":
            print("Windows: Run download_weights.bat")
        else:
            print("Linux/Mac: Run ./download_weights.sh")
        sys.exit(1)
    else:
        print("All required model files exist.")




download_model()  # for huggingface deployment.

from musetalk.utils.blending import get_image
from musetalk.utils.face_parsing import FaceParsing
from musetalk.utils.audio_processor import AudioProcessor
from musetalk.utils.utils import get_file_type, get_video_fps, datagen, load_all_model
from musetalk.utils.preprocessing import get_landmark_and_bbox, read_imgs, coord_placeholder, get_bbox_range


def fast_check_ffmpeg(exe_path=None):
    """Accept full path (e.g. imageio_ffmpeg's ffmpeg-win-x86_64-v7.1.exe — not named ffmpeg.exe)."""
    candidates = []
    if exe_path:
        candidates.append(exe_path)
    w = shutil.which("ffmpeg")
    if w:
        candidates.append(w)
    for p in candidates:
        try:
            subprocess.run(
                [p, "-version"],
                capture_output=True,
                check=True,
                timeout=30,
            )
            return True
        except Exception:
            continue
    return False


def _catch_gradio_inference_errors(fn):
    """Évite les exceptions brutes (Gradio « Erreur » opaque) et ne laisse jamais le process mourir silencieusement."""
    import functools
    import traceback

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except gr.Error:
            raise
        except Exception as e:
            traceback.print_exc()
            msg = str(e).strip() or type(e).__name__
            if len(msg) > 900:
                msg = msg[:900] + "…"
            raise gr.Error(
                "Échec de la génération MuseTalk. "
                f"Détail : {msg} — Voir le terminal du serveur pour la trace complète."
            ) from e

    return wrapper


def _normalize_reference_video_for_musetalk(video: str) -> str:
    """
    Convertit la vidéo de référence en H.264 25 fps sans piste audio (idempotent si déjà outputxxx_*).
    Même logique que check_video : utilisé aussi au clic « Générer » pour éviter les courses avec l’événement change.
    """
    video = (video or "").strip()
    if not video:
        raise gr.Error("Chemin vidéo vide.")
    _dir, file_name = os.path.split(os.path.normpath(video))
    if file_name.startswith("outputxxx_"):
        return os.path.abspath(video)

    base = os.path.splitext(file_name)[0]
    out_name = f"outputxxx_{base}.mp4"
    os.makedirs("./results", exist_ok=True)
    os.makedirs("./results/output", exist_ok=True)
    os.makedirs("./results/input", exist_ok=True)
    output_video = os.path.abspath(os.path.join("./results/input", out_name))

    ffmpeg_exe = FFMPEG_EXE_CACHED or resolve_ffmpeg_executable()
    if not ffmpeg_exe:
        raise gr.Error(
            "ffmpeg not found. From gradio-apps/musetalk run: pip install \"imageio[ffmpeg]\" "
            "(installs imageio-ffmpeg), or add FFmpeg to PATH, or start with:\n"
            "--ffmpeg_path \"C:\\\\path\\\\to\\\\bin\"  or  --ffmpeg_path \"C:\\\\path\\\\to\\\\ffmpeg.exe\""
        )

    src = os.path.normpath(os.path.abspath(video))
    cmd = [
        ffmpeg_exe,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        src,
        "-r",
        "25",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-movflags",
        "+faststart",
        "-an",
        output_video,
    ]
    try:
        subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
    except subprocess.CalledProcessError as e:
        tail = (e.stderr or e.stdout or str(e))[-1200:]
        raise gr.Error(f"Video conversion failed (ffmpeg). {tail}") from e

    if not os.path.isfile(output_video) or os.path.getsize(output_video) == 0:
        raise gr.Error("Video conversion produced an empty or missing file.")

    return output_video


@_catch_gradio_inference_errors
@torch.no_grad()
def inference(audio_path, video_path, bbox_shift, extra_margin=10, parsing_mode="jaw",
              left_cheek_width=90, right_cheek_width=90):
    # Set default parameters, aligned with inference.py
    args_dict = {
        "result_dir": './results/output', 
        "fps": 25, 
        "batch_size": 8, 
        "output_vid_name": '', 
        "use_saved_coord": False,
        "audio_padding_length_left": 2,
        "audio_padding_length_right": 2,
        "version": "v15",  # Fixed use v15 version
        "extra_margin": extra_margin,
        "parsing_mode": parsing_mode,
        "left_cheek_width": left_cheek_width,
        "right_cheek_width": right_cheek_width
    }
    args = Namespace(**args_dict)

    video_path = _filepath_from_gradio_media(video_path)
    audio_path = _filepath_from_gradio_media(audio_path)
    if not video_path:
        raise gr.Error("Référence vidéo manquante. Chargez une vidéo ou une image.")
    if not audio_path:
        raise gr.Error("Piste audio manquante. Chargez un fichier audio avant Générer.")
    if not os.path.isfile(audio_path):
        raise gr.Error("Fichier audio introuvable ou invalide.")
    if not (os.path.isfile(video_path) or os.path.isdir(video_path)):
        raise gr.Error("Référence vidéo/image introuvable ou invalide.")

    # Normalisation 25 fps (même traitement que check_video) : ne pas dépendre seulement de l’événement change.
    if get_file_type(video_path) == "video":
        _vn = os.path.basename(os.path.normpath(video_path))
        if not _vn.startswith("outputxxx_"):
            video_path = _normalize_reference_video_for_musetalk(video_path)

    if not fast_check_ffmpeg(resolve_ffmpeg_executable()):
        print("Warning: Unable to run ffmpeg; video steps may fail")

    print(f"[MuseTalk] inference video={video_path!r} audio={audio_path!r}", flush=True)

    input_basename = os.path.basename(video_path).split('.')[0]
    audio_basename = os.path.basename(audio_path).split('.')[0]
    output_basename = f"{input_basename}_{audio_basename}"
    
    # Create temporary directory
    temp_dir = os.path.join(args.result_dir, f"{args.version}")
    os.makedirs(temp_dir, exist_ok=True)
    
    # Set result save path
    result_img_save_path = os.path.join(temp_dir, output_basename)
    crop_coord_save_path = os.path.join(args.result_dir, "../", input_basename+".pkl")
    os.makedirs(result_img_save_path, exist_ok=True)

    if args.output_vid_name == "":
        output_vid_name = os.path.abspath(os.path.join(temp_dir, output_basename + ".mp4"))
    else:
        output_vid_name = os.path.abspath(os.path.join(temp_dir, args.output_vid_name))
        
    ############################################## extract frames from source video ##############################################
    if get_file_type(video_path) == "video":
        save_dir_full = os.path.join(temp_dir, input_basename)
        os.makedirs(save_dir_full, exist_ok=True)
        # Read video
        reader = imageio.get_reader(video_path)

        # Save images
        for i, im in enumerate(reader):
            imageio.imwrite(f"{save_dir_full}/{i:08d}.png", im)
        input_img_list = sorted(glob.glob(os.path.join(save_dir_full, '*.[jpJP][pnPN]*[gG]')))
        fps = get_video_fps(video_path)
    elif os.path.isfile(video_path) and get_file_type(video_path) == "image":
        input_img_list = [video_path]
        fps = args.fps
    else:  # folder of numbered images
        if not os.path.isdir(video_path):
            raise gr.Error(
                "Référence invalide : utilisez une vidéo, une image fichier, ou un dossier d'images numérotées."
            )
        input_img_list = glob.glob(os.path.join(video_path, '*.[jpJP][pnPN]*[gG]'))
        input_img_list = sorted(input_img_list, key=lambda x: int(os.path.splitext(os.path.basename(x))[0]))
        fps = args.fps
        
    ############################################## extract audio feature ##############################################
    # Extract audio features
    _audio_feats = audio_processor.get_audio_feature(audio_path)
    if _audio_feats is None:
        raise gr.Error("Impossible de lire la piste audio (fichier absent ou chemin invalide).")
    whisper_input_features, librosa_length = _audio_feats
    whisper_chunks = audio_processor.get_whisper_chunk(
        whisper_input_features, 
        device, 
        weight_dtype, 
        whisper, 
        librosa_length,
        fps=fps,
        audio_padding_length_left=args.audio_padding_length_left,
        audio_padding_length_right=args.audio_padding_length_right,
    )
        
    ############################################## preprocess input image  ##############################################
    if os.path.exists(crop_coord_save_path) and args.use_saved_coord:
        print("using extracted coordinates")
        with open(crop_coord_save_path,'rb') as f:
            coord_list = pickle.load(f)
        frame_list = read_imgs(input_img_list)
    else:
        print("extracting landmarks...time consuming")
        coord_list, frame_list = get_landmark_and_bbox(input_img_list, bbox_shift)
        with open(crop_coord_save_path, 'wb') as f:
            pickle.dump(coord_list, f)
    bbox_shift_text = get_bbox_range(input_img_list, bbox_shift)
    
    # Initialize face parser
    fp = FaceParsing(
        left_cheek_width=args.left_cheek_width,
        right_cheek_width=args.right_cheek_width
    )
    
    i = 0
    input_latent_list = []
    for bbox, frame in zip(coord_list, frame_list):
        if bbox == coord_placeholder:
            continue
        x1, y1, x2, y2 = bbox
        y2 = y2 + args.extra_margin
        y2 = min(y2, frame.shape[0])
        crop_frame = frame[y1:y2, x1:x2]
        crop_frame = cv2.resize(crop_frame,(256,256),interpolation = cv2.INTER_LANCZOS4)
        latents = vae.get_latents_for_unet(crop_frame)
        input_latent_list.append(latents)

    # to smooth the first and the last frame
    frame_list_cycle = frame_list + frame_list[::-1]
    coord_list_cycle = coord_list + coord_list[::-1]
    input_latent_list_cycle = input_latent_list + input_latent_list[::-1]

    if len(input_latent_list_cycle) == 0:
        raise gr.Error(
            "No face detected in the reference video (all frames). "
            "Try another clip, adjust BBox_shift, or use a clearer frontal face."
        )

    ############################################## inference batch by batch ##############################################
    print("start inference")
    video_num = len(whisper_chunks)
    batch_size = args.batch_size
    gen = datagen(
        whisper_chunks=whisper_chunks,
        vae_encode_latents=input_latent_list_cycle,
        batch_size=batch_size,
        delay_frame=0,
        device=device,
    )
    res_frame_list = []
    for i, (whisper_batch,latent_batch) in enumerate(tqdm(gen,total=int(np.ceil(float(video_num)/batch_size)))):
        audio_feature_batch = pe(whisper_batch)
        # Ensure latent_batch is consistent with model weight type
        latent_batch = latent_batch.to(dtype=weight_dtype)
        
        pred_latents = unet.model(latent_batch, timesteps, encoder_hidden_states=audio_feature_batch).sample
        recon = vae.decode_latents(pred_latents)
        for res_frame in recon:
            res_frame_list.append(res_frame)
            
    ############################################## pad to full image ##############################################
    print("pad talking image to original video")
    for i, res_frame in enumerate(tqdm(res_frame_list)):
        bbox = coord_list_cycle[i%(len(coord_list_cycle))]
        ori_frame = copy.deepcopy(frame_list_cycle[i%(len(frame_list_cycle))])
        x1, y1, x2, y2 = bbox
        y2 = y2 + args.extra_margin
        y2 = min(y2, frame.shape[0])
        try:
            res_frame = cv2.resize(res_frame.astype(np.uint8),(x2-x1,y2-y1))
        except:
            continue
        
        # Use v15 version blending
        combine_frame = get_image(ori_frame, res_frame, [x1, y1, x2, y2], mode=args.parsing_mode, fp=fp)
            
        cv2.imwrite(f"{result_img_save_path}/{str(i).zfill(8)}.png",combine_frame)
        
    # Frame rate
    fps = 25
    # Silent video before mux (absolute path: avoids cwd issues and Windows file locking on relative temp.mp4)
    temp_mp4 = os.path.abspath(os.path.join(ProjectDir, "_musetalk_silent_temp.mp4"))

    # Read images
    def is_valid_image(file):
        pattern = re.compile(r'\d{8}\.png')
        return pattern.match(file)

    images = []
    files = [file for file in os.listdir(result_img_save_path) if is_valid_image(file)]
    files.sort(key=lambda x: int(x.split('.')[0]))

    for file in files:
        filename = os.path.join(result_img_save_path, file)
        images.append(imageio.imread(filename))

    if not images:
        raise gr.Error(
            "No rendered frames were saved (e.g. all face composites failed). "
            "Check the reference video and BBox_shift / parsing settings."
        )

    # Save video
    imageio.mimwrite(temp_mp4, images, "FFMPEG", fps=fps, codec="libx264", pixelformat="yuv420p")

    if not os.path.isfile(temp_mp4):
        raise gr.Error(f"Failed to write intermediate video: {temp_mp4}")
    if not audio_path or not os.path.isfile(audio_path):
        raise gr.Error(f"Audio file missing or invalid: {audio_path}")

    # Mux with audio: close all MoviePy clips before deleting temp file (required on Windows).
    video_clip = None
    audio_clip = None
    v_sub = None
    a_sub = None
    final_clip = None
    try:
        video_clip = VideoFileClip(temp_mp4)
        audio_clip = AudioFileClip(audio_path)
        dur = min(float(video_clip.duration), float(audio_clip.duration))
        if dur <= 0:
            raise gr.Error("Output duration is zero after mux step.")
        v_sub = video_clip.subclip(0, dur)
        a_sub = audio_clip.subclip(0, dur)
        final_clip = v_sub.set_audio(a_sub)
        final_clip.write_videofile(
            output_vid_name,
            codec="libx264",
            audio_codec="aac",
            fps=25,
            verbose=False,
            logger=None,
        )
    finally:
        for clip in (final_clip, v_sub, a_sub, video_clip, audio_clip):
            if clip is not None:
                try:
                    clip.close()
                except Exception:
                    pass

    try:
        os.remove(temp_mp4)
    except OSError as e:
        print(f"Warning: could not remove temp video {temp_mp4}: {e}")

    print(f"result is save to {output_vid_name}")
    return output_vid_name, bbox_shift_text



# load model weights
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
vae, unet, pe = load_all_model(
    unet_model_path="./models/musetalkV15/unet.pth", 
    vae_type="sd-vae",
    unet_config="./models/musetalkV15/musetalk.json",
    device=device
)

# Parse command line arguments
parser = argparse.ArgumentParser()
parser.add_argument(
    "--ffmpeg_path",
    type=str,
    default=r"ffmpeg-master-latest-win64-gpl-shared\bin",
    help="Folder containing ffmpeg (e.g. ...\\bin) or full path to ffmpeg.exe",
)
parser.add_argument("--ip", type=str, default="0.0.0.0", help="IP to bind (0.0.0.0 = toutes interfaces, aligné scripts IA Home)")
parser.add_argument("--port", type=int, default=7886, help="Port IA Home MuseTalk (localhost:7886)")
parser.add_argument("--share", action="store_true", help="Create a public link")
parser.add_argument(
    "--use_float16",
    action="store_true",
    help="Float16 sur GPU CUDA uniquement (ignoré sur CPU : non supporté par PyTorch pour les convolutions).",
)
args = parser.parse_args()

# Gradio enregistre server_name dans la config (URLs / redirects). Avec 0.0.0.0, le client peut
# recevoir des 307 incohérents (localhost ↔ 127.0.0.1). Uvicorn bind toujours sur args.ip.
_gradio_public = os.environ.get("MUSETALK_PUBLIC_HOST", "").strip()
if _gradio_public:
    _mount_server_name = _gradio_public
elif args.ip in ("0.0.0.0", "::", "::0", ""):
    _mount_server_name = "localhost"
else:
    _mount_server_name = args.ip


def resolve_ffmpeg_executable():
    """imageio-ffmpeg (pip) first, then PATH, then --ffmpeg_path."""
    try:
        import imageio_ffmpeg

        bundled = imageio_ffmpeg.get_ffmpeg_exe()
        if bundled and os.path.isfile(bundled):
            return os.path.abspath(bundled)
    except Exception:
        pass
    w = shutil.which("ffmpeg")
    if w:
        return w
    raw = (args.ffmpeg_path or "").strip()
    if raw:
        if os.path.isfile(raw):
            return os.path.abspath(raw)
        bin_dir = raw
        if not os.path.isabs(bin_dir):
            bin_dir = os.path.abspath(os.path.join(ProjectDir, bin_dir))
        for name in ("ffmpeg.exe", "ffmpeg"):
            p = os.path.join(bin_dir, name)
            if os.path.isfile(p):
                return p
    return None


path_separator = ";" if sys.platform == "win32" else ":"
_ffmpeg_resolved = resolve_ffmpeg_executable()
if _ffmpeg_resolved:
    _ffmpeg_dir = os.path.dirname(os.path.abspath(_ffmpeg_resolved))
    if _ffmpeg_dir:
        os.environ["PATH"] = _ffmpeg_dir + path_separator + os.environ.get("PATH", "")
    print(f"ffmpeg: {_ffmpeg_resolved}")
else:
    _fallback = args.ffmpeg_path.strip() if args.ffmpeg_path else ""
    if _fallback:
        if not os.path.isabs(_fallback):
            _fallback = os.path.abspath(os.path.join(ProjectDir, _fallback))
        os.environ["PATH"] = _fallback + path_separator + os.environ.get("PATH", "")
        print(f"Prepended to PATH (ffmpeg not verified): {_fallback}")

if not fast_check_ffmpeg(_ffmpeg_resolved):
    print(
        "Warning: ffmpeg not runnable. Install FFmpeg, pip install imageio-ffmpeg, "
        "or pass --ffmpeg_path to a folder with ffmpeg.exe"
    )

# Cached path for Gradio callbacks (same process as this module)
FFMPEG_EXE_CACHED = resolve_ffmpeg_executable()

# imageio + MoviePy spawn ffmpeg by name unless given an explicit binary (Windows pip uses
# ffmpeg-win-x86_64-v7.1.exe, not ffmpeg.exe on PATH).
if _ffmpeg_resolved:
    os.environ["IMAGEIO_FFMPEG_EXE"] = _ffmpeg_resolved
    try:
        import moviepy.config as _moviepy_config

        _moviepy_config.FFMPEG_BINARY = _ffmpeg_resolved
    except Exception:
        pass

# Set data type : float16 uniquement sur CUDA. Sur CPU, PyTorch lève
# "slow_conv2d_cpu not implemented for 'Half'" si on passe les poids en half.
if args.use_float16 and device.type == "cuda":
    pe = pe.half()
    vae.vae = vae.vae.half()
    unet.model = unet.model.half()
    weight_dtype = torch.float16
else:
    if args.use_float16 and device.type != "cuda":
        print(
            "Notice: --use_float16 ignoré sans GPU CUDA "
            "(le CPU PyTorch n'implémente pas les convolutions en float16). Poids en float32."
        )
    weight_dtype = torch.float32

# Move models to specified device
pe = pe.to(device)
vae.vae = vae.vae.to(device)
unet.model = unet.model.to(device)

timesteps = torch.tensor([0], device=device)

# Initialize audio processor and Whisper model
audio_processor = AudioProcessor(feature_extractor_path="./models/whisper")
whisper = WhisperModel.from_pretrained("./models/whisper")
whisper = whisper.to(device=device, dtype=weight_dtype).eval()
whisper.requires_grad_(False)


def check_video(video):
    """
    Normalize reference video to 25 FPS H.264 MP4 for MuseTalk and for browser preview.
    Uses ffmpeg (stream) instead of loading all frames into RAM — long uploads no longer OOM/timeout.
    """
    video = _filepath_from_gradio_media(video)
    if not video or not isinstance(video, str):
        return None
    if get_file_type(video) != "video":
        return video
    try:
        return _normalize_reference_video_for_musetalk(video)
    except gr.Error:
        raise




css = """#input_img {max-width: 1024px !important} #output_vid {max-width: 1024px; max-height: 576px}"""
# Sur certains navigateurs Windows, la pile Gradio (ui-sans-serif, system-ui) peut déclencher
# des GET vers /static/fonts/ui-sans-serif/*.woff2 (inexistant → erreurs console). On force
# une pile explicite + IBM Plex (fichiers présents sous /static/fonts/IBMPlexSans/).
css += """
[class^="gradio-container"] {
  --font: "IBM Plex Sans", "Segoe UI", Roboto, Arial, sans-serif !important;
  --font-sans: "IBM Plex Sans", "Segoe UI", Roboto, Arial, sans-serif !important;
  --font-mono: "IBM Plex Mono", Consolas, "Courier New", monospace !important;
}
"""
# Hors Hugging Face Spaces, Gradio peut appeler postMessage(..., "https://huggingface.co") vers
# cette fenêtre (localhost / musetalk.iahome.fr) → erreur console ; idem supports_zerogpu_headers.
_MUSE_HEAD = """
<script>
(function () {
  try {
    if (window.location && /huggingface\\.co/i.test(String(window.location.hostname || ""))) return;
    if (Window.prototype.__musetalkPmWrapped) return;
    Window.prototype.__musetalkPmWrapped = 1;
    var opm = Window.prototype.postMessage;
    Window.prototype.postMessage = function (message, targetOrigin, transfer) {
      try {
        if (typeof targetOrigin === "string" && /huggingface\\.co/i.test(targetOrigin)) {
          var ao = "";
          try {
            ao = this && this.location && this.location.origin ? String(this.location.origin) : "";
          } catch (e) {}
          if (!ao || /huggingface\\.co/i.test(ao)) {
            try {
              if (this === window && window.location && window.location.origin) {
                ao = String(window.location.origin);
              }
            } catch (e2) {}
          }
          if (ao && !/huggingface\\.co/i.test(ao)) {
            targetOrigin = ao;
          } else {
            targetOrigin = "*";
          }
        }
      } catch (e) {}
      return arguments.length >= 3
        ? opm.call(this, message, targetOrigin, transfer)
        : opm.call(this, message, targetOrigin);
    };
  } catch (e) {}
})();
(function () {
  try { delete window.supports_zerogpu_headers; } catch (e) {}
  try {
    Object.defineProperty(window, "supports_zerogpu_headers", {
      configurable: true,
      enumerable: true,
      get: function () { return false; },
      set: function () {},
    });
  } catch (e) {}
})();
</script>
"""

with gr.Blocks(
    css=css,
    head=_MUSE_HEAD,
    js="""
function () {
  try {
    if (window.location && /huggingface\\.co/i.test(String(window.location.hostname || ""))) return;
    if (Window.prototype.__musetalkPmWrapped) return;
    Window.prototype.__musetalkPmWrapped = 1;
    var opm = Window.prototype.postMessage;
    Window.prototype.postMessage = function (message, targetOrigin, transfer) {
      try {
        if (typeof targetOrigin === "string" && /huggingface\\.co/i.test(targetOrigin)) {
          var ao = "";
          try {
            ao = this && this.location && this.location.origin ? String(this.location.origin) : "";
          } catch (e) {}
          if (!ao || /huggingface\\.co/i.test(ao)) {
            try {
              if (this === window && window.location && window.location.origin) {
                ao = String(window.location.origin);
              }
            } catch (e2) {}
          }
          if (ao && !/huggingface\\.co/i.test(ao)) {
            targetOrigin = ao;
          } else {
            targetOrigin = "*";
          }
        }
      } catch (e) {}
      return arguments.length >= 3
        ? opm.call(this, message, targetOrigin, transfer)
        : opm.call(this, message, targetOrigin);
    };
  } catch (e) {}
  try { delete window.supports_zerogpu_headers; } catch (e) {}
  try {
    Object.defineProperty(window, "supports_zerogpu_headers", {
      configurable: true,
      enumerable: true,
      get: function () { return false; },
      set: function () {},
    });
  } catch (e) {}
}
""",
    analytics_enabled=False,
) as demo:
    gr.Markdown(
        """<div align='center'> <h1>MuseTalk: Real-Time High-Fidelity Video Dubbing via Spatio-Temporal Sampling</h1> \
                    <h2 style='font-weight: 450; font-size: 1rem; margin: 0rem'>\
                    </br>\
                    Yue Zhang <sup>*</sup>,\
                    Zhizhou Zhong <sup>*</sup>,\
                    Minhao Liu<sup>*</sup>,\
                    Zhaokang Chen,\
                    Bin Wu<sup>†</sup>,\
                    Yubin Zeng,\
                    Chao Zhang,\
                    Yingjie He,\
                    Junxin Huang,\
                    Wenjiang Zhou <br>\
                    (<sup>*</sup>Equal Contribution, <sup>†</sup>Corresponding Author, benbinwu@tencent.com)\
                    Lyra Lab, Tencent Music Entertainment\
                </h2> \
                <a style='font-size:18px;color: #000000' href='https://github.com/TMElyralab/MuseTalk'>[Github Repo]</a>\
                <a style='font-size:18px;color: #000000' href='https://github.com/TMElyralab/MuseTalk'>[Huggingface]</a>\
                <a style='font-size:18px;color: #000000' href='https://arxiv.org/abs/2410.10122'> [Technical report] </a>"""
    )

    with gr.Row():
        with gr.Column():
            audio = gr.Audio(label="Drving Audio",type="filepath")
            video = gr.Video(label="Reference Video",sources=['upload'])
            bbox_shift = gr.Number(label="BBox_shift value, px", value=0)
            extra_margin = gr.Slider(label="Extra Margin", minimum=0, maximum=40, value=10, step=1)
            parsing_mode = gr.Radio(label="Parsing Mode", choices=["jaw", "raw"], value="jaw")
            left_cheek_width = gr.Slider(label="Left Cheek Width", minimum=20, maximum=160, value=90, step=5)
            right_cheek_width = gr.Slider(label="Right Cheek Width", minimum=20, maximum=160, value=90, step=5)
            bbox_shift_scale = gr.Textbox(label="'left_cheek_width' and 'right_cheek_width' parameters determine the range of left and right cheeks editing when parsing model is 'jaw'. The 'extra_margin' parameter determines the movement range of the jaw. Users can freely adjust these three parameters to obtain better inpainting results.")

            with gr.Row():
                debug_btn = gr.Button("1. Test Inpainting ")
                btn = gr.Button("2. Generate")
        with gr.Column():
            debug_image = gr.Image(label="Test Inpainting Result (First Frame)")
            debug_info = gr.Textbox(label="Parameter Information", lines=5)
            out1 = gr.Video()
    
    video.change(
        fn=check_video, inputs=[video], outputs=[video]
    )
    btn.click(
        fn=inference,
        inputs=[
            audio,
            video,
            bbox_shift,
            extra_margin,
            parsing_mode,
            left_cheek_width,
            right_cheek_width
        ],
        outputs=[out1, bbox_shift_scale],
        show_progress="full",
    )
    debug_btn.click(
        fn=debug_inpainting,
        inputs=[
            video,
            bbox_shift,
            extra_margin,
            parsing_mode,
            left_cheek_width,
            right_cheek_width
        ],
        outputs=[debug_image, debug_info]
    )

# Solve asynchronous IO issues on Windows
if sys.platform == 'win32':
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# --- Production : FastAPI + gate jeton (musetalk.iahome.fr) + Gradio sur /
# Localhost reste ouvert sans jeton (voir iahome_token_gate.gate_disabled_for_request).
# Lien utilisateur : unified-redirect / compte → ?token=… → cookie HttpOnly → accès Gradio.
demo.queue(default_concurrency_limit=1)

from fastapi import FastAPI
import uvicorn
from gradio import mount_gradio_app
import gradio.routes as _gradio_routes

# Gradio mount path="/" → configure_app définit souvent root_path="/". Alors Starlette
# get_route_path(scope) vaut "" pour une requête "/", redirect_slashes ajoute "/" et
# renvoie Location http://host:7886/ → boucle 307 dans le navigateur.
_orig_configure_app = _gradio_routes.App.configure_app


def _configure_app_fix_root_path(self, blocks):
    _orig_configure_app(self, blocks)
    if (getattr(self, "root_path", None) or "") == "/" and (
        getattr(blocks, "custom_mount_path", None) or ""
    ) == "/":
        self.root_path = ""
        blocks.root_path = ""


_gradio_routes.App.configure_app = _configure_app_fix_root_path  # type: ignore[method-assign]

from iahome_token_gate import (
    FixRedirectLocationDoubleSlashMiddleware,
    MuseTalkAsgiRequestFixMiddleware,
    MuseTalkGradioHtmlShimMiddleware,
    MuseTalkIahomeGateMiddleware,
    make_auth_dependency,
)

# Évite des 307 incohérents au niveau du routeur parent (slash / sous-routes).
_fastapi = FastAPI(redirect_slashes=False)


@_fastapi.get("/healthz")
@_fastapi.head("/healthz")
async def _healthz():
    """Sonde Traefik / load balancer (sans auth Gradio)."""
    return {"status": "ok"}


# Dernier add_middleware = le plus externe (exécuté en premier sur la requête).
# Une seule couche gate (cookie + redirect 401) au lieu de deux BaseHTTPMiddleware : évite des
# NS_ERROR_NET_RESET / « Connection errored out » sur /gradio_api/queue/data (SSE).
_fastapi.add_middleware(FixRedirectLocationDoubleSlashMiddleware)
_fastapi.add_middleware(MuseTalkAsgiRequestFixMiddleware)
# Réécrit le HTML Gradio (shim). Désactivable si problème de navigation : MUSETALK_DISABLE_HTML_SHIM=1
if os.environ.get("MUSETALK_DISABLE_HTML_SHIM", "").lower() not in ("1", "true", "yes"):
    _fastapi.add_middleware(MuseTalkGradioHtmlShimMiddleware)
_fastapi.add_middleware(MuseTalkIahomeGateMiddleware)

app = mount_gradio_app(
    _fastapi,
    demo,
    path="/",
    server_name=_mount_server_name,
    server_port=args.port,
    auth_dependency=make_auth_dependency(),
    app_kwargs={"redirect_slashes": False},
)

# Traefik / reverse-proxy : activer avec MUSETALK_TRUST_PROXY=1 (défaut off : en local, des
# X-Forwarded-* fantômes (VPN, proxy) peuvent casser cookies / URLs sur http://localhost:7886).
if os.environ.get("MUSETALK_TRUST_PROXY", "").lower() in ("1", "true", "yes"):
    try:
        from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

        app = ProxyHeadersMiddleware(app, trusted_hosts="*")
    except ImportError:
        pass

if __name__ == "__main__":
    _fwd = os.environ.get("UVICORN_FORWARDED_ALLOW_IPS", "*")
    uvicorn.run(
        app,
        host=args.ip,
        port=args.port,
        log_level="info",
        forwarded_allow_ips=_fwd,
        timeout_keep_alive=120,
    )

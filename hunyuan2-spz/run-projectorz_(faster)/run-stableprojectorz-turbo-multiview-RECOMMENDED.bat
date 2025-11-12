@echo off
cd /d "%~dp0.\..\tools"
call spz-internal.bat --model_path tencent/Hunyuan3D-2mv --subfolder hunyuan3d-dit-v2-mv-turbo --texgen_model_path tencent/Hunyuan3D-2 --low_vram_mode --enable_flashvdm --port 8888 --host 0.0.0.0
@echo off
cd /d "%~dp0.\..\tools"
call spz-internal.bat --model_path tencent/Hunyuan3D-2mv --subfolder hunyuan3d-dit-v2-mv --texgen_model_path tencent/Hunyuan3D-2 --low_vram_mode

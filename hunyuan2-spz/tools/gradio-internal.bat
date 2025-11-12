@echo off
call environment.bat


echo _
echo Current Python: %PYTHON%
echo Virtual Env: %VIRTUAL_ENV%
echo _


rem wrapping in quotation marks in case if path has spaces
cd /d "%~dp0.\..\code"


if not exist hunyuan_init_done.txt (
	
	echo Performing first-time installation. Please wait:
	
	%PYTHON% -m pip install --upgrade pip
    %PYTHON% install.py
	
	if %ERRORLEVEL% == 0 (
		rem If all is good, we will eventually create a file which will know us we ran correctly.
		rem Next time we do this _gradio.bat, the presence of this file will let us skip pip install in this _gradio.bat
		echo Script ran successfully. Creating init_completed flag file.
		echo initComplete > hunyuan_init_done.txt
	)
)

rem To catch any issues users might have due to misactivated venv:
echo Current Python: %PYTHON%
echo Virtual Env: %VIRTUAL_ENV%
echo Starting the server, please wait...

rem Notice the %* at the end of  gradio_app.py  will forward the arguments into  gradio_app.py
rem For example  _gradio.bat --model_path tencent/Hunyuan3D-2mv    will do  gradio_app.py --model_path tencent/Hunyuan3D-2mv
%PYTHON% .\gradio_app.py %*

if %ERRORLEVEL% neq 0 (
	echo Something went wrong, consider removing code/hunyuan_init_done.txt and the venv folder to re-initialize from scratch
)

pause

rem Igor Aherne 2025
rem https://github.com/IgorAherne/Hunyuan3D-2-stable-projectorz
rem
rem https://stableprojectorz.com
rem Discord: https://discord.gg/aWbnX2qan2
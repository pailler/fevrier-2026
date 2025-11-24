@echo off
echo ============================================================
echo   Ajout de Stability Matrix et Hunyuan3D-2 au demarrage
echo ============================================================
echo.

REM ============================================================
REM Configuration Stability Matrix
REM ============================================================
set "STABILITY_MATRIX_PATH=%USERPROFILE%\Documents\StabilityMatrix-win-x64\StabilityMatrix.exe"
set "STABILITY_MATRIX_SHORTCUT=Stability Matrix - Auto Start.lnk"

REM ============================================================
REM Configuration Hunyuan3D-2
REM ============================================================
set "HUNYUAN_SCRIPT_PATH=%USERPROFILE%\Documents\iahome\v16_hunyuan2-stableprojectorz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
set "HUNYUAN_SHORTCUT=Hunyuan3D-2 - Auto Start.lnk"

REM ============================================================
REM Chemin du dossier de demarrage Windows
REM ============================================================
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo Dossier de demarrage: %STARTUP_FOLDER%
echo.

REM ============================================================
REM Ajouter Stability Matrix
REM ============================================================
echo [1/2] Ajout de Stability Matrix...
if not exist "%STABILITY_MATRIX_PATH%" (
    echo    Erreur: Impossible de trouver StabilityMatrix.exe
    echo    Chemin recherche: %STABILITY_MATRIX_PATH%
    echo    Stability Matrix ne sera pas ajoute au demarrage
) else (
    set "STABILITY_SHORTCUT_PATH=%STARTUP_FOLDER%\%STABILITY_MATRIX_SHORTCUT%"
    powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STABILITY_SHORTCUT_PATH%'); $Shortcut.TargetPath = '%STABILITY_MATRIX_PATH%'; $Shortcut.WorkingDirectory = '%USERPROFILE%\Documents\StabilityMatrix-win-x64'; $Shortcut.Description = 'Demarrage automatique de Stability Matrix'; $Shortcut.Save()" >nul 2>&1
    if %ERRORLEVEL% == 0 (
        echo    OK - Stability Matrix ajoute avec succes
    ) else (
        echo    Erreur lors de la creation du raccourci pour Stability Matrix
    )
)

echo.

REM ============================================================
REM Ajouter Hunyuan3D-2
REM ============================================================
echo [2/2] Ajout de Hunyuan3D-2...
if not exist "%HUNYUAN_SCRIPT_PATH%" (
    echo    Erreur: Impossible de trouver le fichier .bat
    echo    Chemin recherche: %HUNYUAN_SCRIPT_PATH%
    echo    Hunyuan3D-2 ne sera pas ajoute au demarrage
) else (
    set "HUNYUAN_SHORTCUT_PATH=%STARTUP_FOLDER%\%HUNYUAN_SHORTCUT%"
    powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%HUNYUAN_SHORTCUT_PATH%'); $Shortcut.TargetPath = '%HUNYUAN_SCRIPT_PATH%'; $Shortcut.WorkingDirectory = '%USERPROFILE%\Documents\iahome\v16_hunyuan2-stableprojectorz\run-browser_(slower)'; $Shortcut.Description = 'Demarrage automatique de Hunyuan3D-2'; $Shortcut.Save()" >nul 2>&1
    if %ERRORLEVEL% == 0 (
        echo    OK - Hunyuan3D-2 ajoute avec succes
    ) else (
        echo    Erreur lors de la creation du raccourci pour Hunyuan3D-2
    )
)

echo.
echo ============================================================
echo   Configuration terminee!
echo ============================================================
echo.
echo Les applications se lanceront automatiquement au prochain
echo demarrage de Windows.
echo.
echo Pour desactiver le demarrage automatique:
echo   1. Appuyez sur Win+R
echo   2. Tapez: shell:startup
echo   3. Supprimez les raccourcis correspondants
echo.
pause













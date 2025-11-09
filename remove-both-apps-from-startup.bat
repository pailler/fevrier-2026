@echo off
echo ================================================================
echo   Retrait de Stability Matrix et Hunyuan3D-2 du demarrage
echo ================================================================
echo.

REM ============================================================
REM Configuration
REM ============================================================
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STABILITY_MATRIX_SHORTCUT=Stability Matrix - Auto Start.lnk"
set "HUNYUAN_SHORTCUT=Hunyuan3D-2 - Auto Start.lnk"

set "STABILITY_SHORTCUT_PATH=%STARTUP_FOLDER%\%STABILITY_MATRIX_SHORTCUT%"
set "HUNYUAN_SHORTCUT_PATH=%STARTUP_FOLDER%\%HUNYUAN_SHORTCUT%"

REM ============================================================
REM Retirer Stability Matrix
REM ============================================================
echo [1/2] Retrait de Stability Matrix...
if exist "%STABILITY_SHORTCUT_PATH%" (
    del "%STABILITY_SHORTCUT_PATH%" >nul 2>&1
    if %ERRORLEVEL% == 0 (
        echo    OK - Stability Matrix retire du demarrage
    ) else (
        echo    Erreur lors de la suppression du raccourci
    )
) else (
    echo    Le raccourci n'existe pas (deja retire ou jamais ajoute)
)

echo.

REM ============================================================
REM Retirer Hunyuan3D-2
REM ============================================================
echo [2/2] Retrait de Hunyuan3D-2...
if exist "%HUNYUAN_SHORTCUT_PATH%" (
    del "%HUNYUAN_SHORTCUT_PATH%" >nul 2>&1
    if %ERRORLEVEL% == 0 (
        echo    OK - Hunyuan3D-2 retire du demarrage
    ) else (
        echo    Erreur lors de la suppression du raccourci
    )
) else (
    echo    Le raccourci n'existe pas (deja retire ou jamais ajoute)
)

echo.
echo ============================================================
echo   Configuration terminee!
echo ============================================================
echo.
echo Les applications ne se lanceront plus automatiquement
echo au demarrage de Windows.
echo.
pause


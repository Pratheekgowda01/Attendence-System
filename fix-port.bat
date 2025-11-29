@echo off
echo.
echo ========================================
echo   Port 5000 Fixer
echo ========================================
echo.
echo Finding and killing process on port 5000...
echo.

REM Check if port 5000 is in use
netstat -ano | findstr :5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo Found process using port 5000:
    netstat -ano | findstr :5000
    echo.
    
    REM Get the PID from the last column
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
        echo Killing process %%a...
        taskkill /PID %%a /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo Process %%a killed successfully!
        ) else (
            echo Could not kill process %%a. It may require admin rights.
        )
    )
    echo.
    echo Port 5000 should now be free.
) else (
    echo Port 5000 is already free!
)

echo.
pause


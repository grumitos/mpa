@echo off
rem MPA: sistema de gestion escolar con Django y Angular, servido en local desde un solo puerto.
rem La primera vez prepara el entorno (venv y dependencias), crea .env y se detiene para completarlo.
rem Uso: run.bat [puerto] [--rebuild]   p. ej.: run.bat 8080
setlocal
cd /d "%~dp0"
set "PYTHONUTF8=1"
set "MIN_PYTHON=3.10"
set "MIN_NODE=20"
set "VENV_PY=venv\Scripts\python.exe"
set "PORT=8000"
set "REBUILD="
set "SHOW_HELP="
set "ARG_ERROR="
set "EXIT_CODE=0"

rem Con doble clic (cmd /c "...\run.bat") se hace una pausa final si algo falla; si todo sale bien,
rem la app se abre en el navegador y esta ventana es el servidor.
set "DOUBLE_CLICK="
echo %cmdcmdline% | "%SystemRoot%\System32\find.exe" /i "%~nx0" >nul && set "DOUBLE_CLICK=1"

call :parse_args %*
if defined ARG_ERROR (
    echo ERROR: argumento no valido: %ARG_ERROR%
    call :usage
    set "EXIT_CODE=2"
    goto :finish
)
if defined SHOW_HELP (
    call :usage
    goto :finish
)

if not exist "%VENV_PY%" (
    call :find_python || goto :failed
    call :create_venv || goto :failed
)
"%VENV_PY%" -c "import django, rest_framework, corsheaders, whitenoise, dotenv" >nul 2>&1 || (
    call :install_dependencies || goto :failed
)
if not exist ".env" (
    call :create_env
    goto :failed
)
call :check_env || goto :failed
call :prepare_backend || goto :failed
call :build_frontend || goto :failed
call :check_port || goto :failed
call :open_browser_when_ready

echo Sirviendo en http://localhost:%PORT%/ (cierra esta ventana o pulsa Ctrl+C para detenerlo).
"%VENV_PY%" backend\manage.py runserver 127.0.0.1:%PORT% --noreload
set "EXIT_CODE=%ERRORLEVEL%"
rem Ctrl+C no es un fallo: Windows lo informa como 0xC000013A.
if "%EXIT_CODE%"=="-1073741510" set "EXIT_CODE=0"
goto :finish

:parse_args
rem Acepta un puerto numerico, --rebuild y --help; cualquier otra cosa queda en ARG_ERROR.
if "%~1"=="" exit /b 0
if /i "%~1"=="--rebuild" (
    set "REBUILD=1"
) else if /i "%~1"=="--help" (
    set "SHOW_HELP=1"
) else if /i "%~1"=="-h" (
    set "SHOW_HELP=1"
) else if /i "%~1"=="/?" (
    set "SHOW_HELP=1"
) else (
    echo %~1| "%SystemRoot%\System32\findstr.exe" /r /x "[0-9][0-9]*" >nul && (
        set "PORT=%~1"
    ) || (
        if not defined ARG_ERROR set "ARG_ERROR=%~1"
    )
)
shift
goto :parse_args

:usage
echo Uso: run.bat [puerto] [--rebuild]
echo   puerto     puerto local donde se sirve la app (por defecto 8000)
echo   --rebuild  vuelve a compilar el frontend, p. ej. tras cambiar src\environments\
exit /b 0

:find_python
rem Deja en PY_CMD un Python %MIN_PYTHON% o superior: primero python y, si no, el lanzador py.
for %%P in ("python" "py -3") do (
    %%~P -c "import sys; sys.exit(sys.version_info < (%MIN_PYTHON:.=, %))" >nul 2>&1 && (
        set "PY_CMD=%%~P"
        exit /b 0
    )
)
echo ERROR: se necesita Python %MIN_PYTHON% o superior en el PATH.
exit /b 1

:create_venv
echo Creando el entorno virtual...
%PY_CMD% -m venv venv
exit /b %ERRORLEVEL%

:install_dependencies
echo Instalando dependencias del backend...
"%VENV_PY%" -m pip install -r backend\requirements.txt
exit /b %ERRORLEVEL%

:create_env
rem Se detiene siempre: el administrador necesita una contrasena propia antes de crear la base de datos.
copy /y ".env.example" ".env" >nul || (
    echo ERROR: no se pudo crear .env a partir de .env.example.
    exit /b 1
)
echo Se creo .env: completa DJANGO_SUPERUSER_PASSWORD con la contrasena del administrador
echo y vuelve a ejecutar run.bat.
exit /b 1

:check_env
rem Nunca se continua con la contrasena de ejemplo.
"%SystemRoot%\System32\findstr.exe" /b /c:"DJANGO_SUPERUSER_PASSWORD=tu_clave_aqui" ".env" >nul && (
    echo ERROR: completa DJANGO_SUPERUSER_PASSWORD en .env: sigue con el valor de ejemplo.
    exit /b 1
)
exit /b 0

:prepare_backend
echo Preparando la base de datos...
"%VENV_PY%" backend\manage.py migrate --noinput --verbosity 0 || exit /b 1
"%VENV_PY%" backend\manage.py create_superuser_auto || exit /b 1
exit /b 0

:build_frontend
rem Compila el frontend una sola vez; --rebuild lo compila de nuevo.
if defined REBUILD if exist "frontend\dist" rmdir /s /q "frontend\dist"
if exist "frontend\dist\mpa\browser\index.html" exit /b 0
call :find_node || exit /b 1
pushd frontend
rem node_modules\.package-lock.json lo escribe npm al terminar: sin el, la instalacion quedo a medias.
if not exist "node_modules\.package-lock.json" (
    echo Instalando dependencias del frontend...
    call npm ci --no-audit --no-fund || (
        popd
        exit /b 1
    )
)
echo Compilando el frontend (tarda un par de minutos la primera vez)...
call npm run build || (
    popd
    exit /b 1
)
popd
exit /b 0

:find_node
rem Comprueba que haya un Node %MIN_NODE% o superior en el PATH.
node -e "process.exit(+process.versions.node.split('.')[0] >= %MIN_NODE% ? 0 : 1)" >nul 2>&1 && exit /b 0
echo ERROR: se necesita Node.js %MIN_NODE% o superior en el PATH (https://nodejs.org).
exit /b 1

:check_port
rem Se comprueba antes de arrancar para dar un mensaje claro si el puerto esta ocupado.
powershell -NoProfile -Command "if (Get-NetTCPConnection -State Listen -LocalPort %PORT% -ErrorAction SilentlyContinue) { exit 1 }" && exit /b 0
echo ERROR: el puerto %PORT% ya esta en uso. Cierra la otra instancia o usa otro: run.bat 8080
exit /b 1

:open_browser_when_ready
rem Abre el navegador en segundo plano en cuanto el servidor responde (espera hasta 15 s).
start "" /b powershell -NoProfile -Command "$u='http://localhost:%PORT%/'; for ($i = 0; $i -lt 50; $i++) { try { $null = Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 $u; & '%VENV_PY%' -m webbrowser $u; break } catch { Start-Sleep -Milliseconds 300 } }"
exit /b 0

:failed
set "EXIT_CODE=1"

:finish
if defined DOUBLE_CLICK if not "%EXIT_CODE%"=="0" pause
exit /b %EXIT_CODE%

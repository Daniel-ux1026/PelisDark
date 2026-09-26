# PelisDark 2.0

Catalogo de peliculas y series con **React, Spring Boot, SQL Server y un chatbot OpenAI en Streamlit**. La estetica toma como referencia la navegacion de plataformas de streaming, con identidad propia.

> Estado: aplicacion funcional de desarrollo, no un servicio comercial terminado. La web local ya utiliza SQL Server real, con la base PelisDark y el usuario limitado pelisdark_app. Los tres escenarios de navegador pasaron tambien contra SQL Server. El correo se captura en Mailpit; las llamadas reales a OpenAI y las entregas a un buzon externo siguen pendientes.

## Que incluye

- Inicio con contenido destacado, peliculas, series, trailers, busqueda y filtros por genero y ano.
- Catalogo inicial de 21 titulos reales de 2020 a 2026, con caratulas y sinopsis.
- Trailers en YouTube. Cuando falta un video identificado, se ofrece una busqueda explicita.
- Registro, inicio de sesion con contrasena y codigo por correo, cierre de sesion y cambio de contrasena.
- Hasta cinco perfiles por cuenta: crear, editar, elegir color, cambiar y eliminar.
- Lista y puntuacion de 1 a 5 independientes por perfil, guardadas en la base de datos.
- Configuracion del perfil para mostrar u ocultar sinopsis.
- Chatbot centrado en cine, series y PelisDark, con historial limitado y manejo de errores.
- Diseno adaptable y navegacion por teclado, con ventanas de dialogo accesibles.
- GitHub Actions: compilacion, pruebas y despliegue simulado.

**No incluye reproduccion de peliculas completas, licencias de streaming, pagos ni integracion oficial con Netflix, Disney+ o Paramount+.** No se muestra un reproductor simulado como si fuera contenido real.

## Carpeta del proyecto

```text
C:\Users\DARNEXDAN\Documents\CodexProyects\PelisDark
```

```text
frontend/                     React + Vite
backend/                      Java 21 + Spring Boot + Spring Security
backend/src/main/resources/   Esquema SQL y catalogo compartido
chatbot/                      Streamlit y cliente OpenAI
database/initialize.sql       Creacion de base y usuario de aplicacion
scripts/                      Arranque, importacion y staging
deploy/                       Ejemplo de proxy HTTPS
docs/                         Seguridad y fuentes del catalogo
.env.example                  Plantilla de configuracion sin secretos
compose.yaml                  SQL Server y Mailpit locales
.github/workflows/            Integracion continua
```

La antigua maqueta sigue en `index.html`, `css/` y `js/` para conservar el trabajo anterior. **La version nueva no se abre haciendo doble clic en ese HTML: se inicia con `npm run dev`.** Los archivos del informe academico no fueron modificados.

## Iniciar y detener con doble clic (Windows)

En esta computadora ya estan instaladas las dependencias y configurada la base de datos:

1. Haz doble clic en **Iniciar-PelisDark.bat**, en la carpeta principal del proyecto.
2. Espera los mensajes de inicio. Se abren el backend, React, Streamlit y Mailpit cuando el correo esta configurado localmente; luego se abre la web en el navegador.
3. Puedes cerrar la ventana del archivo BAT: los servicios siguen activos en segundo plano.
4. Para detenerlos, haz doble clic en **Detener-PelisDark.bat**.

La parada cierra solamente los procesos iniciados por estos archivos. **No detiene SQL Server**, porque la instancia puede ser utilizada por otras aplicaciones; tampoco borra la base, perfiles o listas. Si SQL Server esta detenido al iniciar, se intenta arrancar el servicio local MSSQLSERVER. Si Windows exige permisos, inicia el servicio desde Servicios de Windows o ejecuta el BAT de inicio como administrador. En ese caso, usa los mismos permisos al detener.

Ejecutar el inicio dos veces no duplica los servicios. Si un puerto esta ocupado por un proceso externo, se informa del conflicto sin cerrarlo. Si falla el arranque, se detienen los componentes nuevos de ese intento; los que ya estaban administrados y activos se conservan. El correo SMTP externo configurado en `.env` no se inicia ni se detiene desde estos archivos.

Los registros estan en `.local/backend.log`, `.local/frontend.log`, `.local/chatbot.log`, `.local/mailpit.log` y sus archivos `-error.log`. El archivo privado `.local/services.json` registra los procesos administrados. No lo borres mientras esten activos. Tras reiniciar Windows, los registros obsoletos no se utilizan para cerrar procesos nuevos.

El inicio utiliza el JAR ya compilado; despues de modificar Java, detiene la web y ejecuta `mvn -f backend/pom.xml package` antes de volver a iniciarla. No instala herramientas ni dependencias automaticamente. Para otra computadora, completa primero los pasos de preparacion de este README. El chatbot arranca sin clave, pero solo puede responder despues de configurar `OPENAI_API_KEY` y reiniciar los servicios.

Para iniciar sin abrir el navegador: `Iniciar-PelisDark.bat -NoBrowser`. Para ejecuciones automatizadas, la variable de entorno `PELISDARK_NO_PAUSE=1` omite la pausa final de ambos archivos.

## Requisitos

- Node.js 24 y npm.
- Java 21 y Maven 3.9 o superior.
- Python 3.12 para el chatbot.
- SQL Server con autenticacion SQL y conexion TCP/IP, o Docker Desktop para crear una instancia local.
- Una clave de OpenAI con acceso al modelo elegido y saldo/cuota disponible, solo para obtener respuestas reales.
- Un servidor SMTP para recibir codigos. Mailpit sirve para pruebas locales sin enviar correos a Internet.

## Paso 1. Preparar la configuracion

Abre PowerShell en la carpeta del proyecto:

```powershell
cd "$env:USERPROFILE\Documents\CodexProyects\PelisDark"
```

En esta computadora ya se creo un archivo `.env` sin credenciales. En una nueva copia del repositorio, crealo desde la plantilla:

```powershell
Copy-Item .env.example .env
```

No ejecutes esa copia sobre un `.env` que ya tenga tus claves. Edita el archivo:

```powershell
notepad .env
```

### Aqui va tu API key de OpenAI

Busca esta linea de **PelisDark/.env**:

```dotenv
OPENAI_API_KEY=
```

Escribe tu clave despues del signo igual, sin comillas. No la pegues en React, en el README, en GitHub ni en el chat. El archivo esta excluido de Git. El nombre del modelo se configura por separado:

```dotenv
OPENAI_MODEL=gpt-4.1-mini
```

El modelo es configurable: utiliza uno disponible en tu proyecto OpenAI. La aplicacion no consume la API hasta que envias una pregunta. Referencias oficiales: [crear una API key](https://platform.openai.com/api-keys), [guia del SDK](https://developers.openai.com/api/docs/quickstart). El uso de la API tiene su propia facturacion; revisa presupuesto y limites antes de habilitar acceso publico.

No se necesita una clave de OpenAI para navegar por el catalogo, crear perfiles o ejecutar las pruebas automatizadas.

## Paso 2. Base de datos SQL Server y correo local

### Opcion recomendada: Docker Desktop

1. Abre Docker Desktop y espera a que el motor este iniciado.
2. En `.env`, completa `SQL_SA_PASSWORD` y `DB_PASSWORD` con **dos contrasenas diferentes**. No uses ejemplos publicados. Para el script incluido, DB_PASSWORD debe tener entre 16 y 64 caracteres, con mayusculas, minusculas, numeros y simbolos de este conjunto: `!@#%^*_=+.-`.
3. Ejecuta:

```powershell
docker compose up -d
docker compose ps
```

Espera a que SQL Server aparezca como saludable. Despues:

```powershell
.\scripts\Initialize-Database.ps1
```

Este script utiliza `sqlcmd`, crea la base PelisDark, sus seis tablas y el usuario `pelisdark_app`. La aplicacion utiliza ese usuario, **no sa**. No borra tablas existentes. Si cambias DB_PASSWORD despues de crear el login, actualiza tambien la contrasena del login en SQL Server; volver a ejecutar la inicializacion no la cambia.

La edicion Developer de SQL Server es para desarrollo. La base se conserva en el volumen Docker `sql-data`. No ejecutes `docker compose down -v` si quieres conservar los datos.

### Si utilizas tu SQL Server instalado

En esta computadora la conexion local ya esta preparada. Para el uso normal, ejecuta `scripts/Start-Backend.ps1` sin `-Preview`; no hace falta volver a inicializar la base ni configurar Docker.

El script `scripts/Connect-LocalSqlServer.ps1` prepara la instancia local en el puerto 1433, solicita la contrasena administrativa de forma oculta y genera una credencial fuerte para la aplicacion si todavia no existe. Guarda solamente la configuracion de la aplicacion en `.env`, no la contrasena de `sa`. No cambia las contrasenas de logins existentes. Si se pierde `.env`, un administrador debera restablecer y sincronizar la credencial de `pelisdark_app` antes de reutilizar la configuracion.

Inicia el servicio desde el administrador de servicios de Windows, con los permisos necesarios. Habilita TCP/IP y autenticacion SQL en la instancia elegida, y reinicia el servicio si su configuracion lo requiere. El script usa por defecto `localhost,1433`; puedes cambiarlo:

```powershell
.\scripts\Initialize-Database.ps1 -Server "localhost,1433"
```

Ajusta tambien DB_URL en `.env`. No abras el puerto 1433 a Internet. El puerto local 1433 no debe estar ocupado por otra instancia al iniciar Docker.

Para desarrollo local con certificado autofirmado:

```dotenv
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=PelisDark;encrypt=true;trustServerCertificate=true
DB_USER=pelisdark_app
DB_PASSWORD=tu_valor_privado
COOKIE_SECURE=false
```

En produccion, usa certificado valido, `trustServerCertificate=false`, HTTPS y `COOKIE_SECURE=true`.

### Como recibir el codigo durante las pruebas

Con Mailpit en funcionamiento, abre [la bandeja local](http://localhost:8025). Los codigos llegan alli aunque registres una direccion como `prueba@example.test`. **No llegan a Gmail ni a Outlook en este modo.**

En esta computadora se dejo tambien una copia portable verificada de Mailpit dentro de `.local/mailpit/`. Si Docker no esta en uso, puedes iniciarla asi:

```powershell
.\.local\mailpit\mailpit.exe --listen 127.0.0.1:8025 --smtp 127.0.0.1:1025 --disable-version-check
```

No inicies a la vez dos servidores en esos puertos. La copia portable no se sube al repositorio. Descarga oficial para otras computadoras: [Mailpit](https://github.com/axllent/mailpit/releases).

Para recibir correos reales, configura los valores que entregue tu proveedor:

```dotenv
SMTP_HOST=servidor_de_tu_proveedor
SMTP_PORT=587
SMTP_USER=tu_usuario_smtp
SMTP_PASSWORD=tu_credencial_smtp
SMTP_AUTH=true
SMTP_TLS=true
MAIL_FROM=remitente_verificado@tu-dominio.com
```

El remitente y el dominio deben estar autorizados por el proveedor. No uses la contrasena normal de tu correo cuando el proveedor requiera una contrasena de aplicacion o credencial SMTP.

## Paso 3. Iniciar Spring Boot

En una terminal de PowerShell, desde PelisDark:

```powershell
.\scripts\Start-Backend.ps1
```

El script lee `.env` y usa SQL Server. La API queda en [localhost:8080/api/health](http://localhost:8080/api/health).

### Vista previa sin SQL Server

Para revisar la interfaz mientras preparas SQL Server:

```powershell
.\scripts\Start-Backend.ps1 -Preview
```

Este modo utiliza **H2 en memoria**, no SQL Server. No evita el codigo por correo: Mailpit o SMTP siguen siendo necesarios. Los datos de cuenta, perfiles y listas se borran al reiniciar. No debe publicarse en Internet. No ejecutes ambos modos simultaneamente en el puerto 8080.

Si PowerShell bloquea scripts, puedes invocar solo el script del proyecto sin cambiar la politica global:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Start-Backend.ps1 -Preview
```

## Paso 4. Iniciar React

En una segunda terminal:

```powershell
cd "$env:USERPROFILE\Documents\CodexProyects\PelisDark"
npm ci --prefix frontend
npm run dev
```

Abre [PelisDark](http://localhost:5173). El proxy de Vite comunica React con Spring Boot; no hace falta desactivar CORS ni CSRF. Si el puerto esta ocupado, utiliza la URL alternativa que indique Vite.

Para probar el flujo completo:

1. Pulsa Entrar y despues Crear una cuenta.
2. Usa un correo y una contrasena de 12 a 64 caracteres.
3. Consulta el codigo en Mailpit o en tu buzon real, segun la configuracion SMTP.
4. Introduce el codigo de seis digitos.
5. Abre una pelicula, anadela a Mi lista y puntuala.
6. Abre el avatar, crea un segundo perfil y comprueba que tiene su propia lista.
7. En Configuracion puedes cambiar la preferencia de sinopsis o la contrasena.
8. Cierra sesion. Un nuevo inicio de sesion pedira contrasena y otro codigo.

El codigo caduca en diez minutos y permite cinco intentos. Para pedir otro, vuelve al formulario de acceso; espera al menos un minuto desde el envio anterior.

## Paso 5. Iniciar el chatbot Streamlit

En esta computadora el entorno `.venv` ya esta instalado. En otra computadora, primero ejecuta `py -3.12 -m venv .venv`. Luego:

```powershell
.\.venv\Scripts\python.exe -m pip install -r chatbot/requirements.txt
.\.venv\Scripts\python.exe -m streamlit run chatbot/app.py --server.address 127.0.0.1 --server.headless true --browser.gatherUsageStats false
```

Abre [el asistente](http://localhost:8501) o pulsa el icono de conversacion de PelisDark. Reinicia Streamlit despues de cambiar la clave en `.env`.

El chatbot conoce las funciones implementadas y el archivo del catalogo. No puede leer tus datos personales, cambiar listas ni acceder a contrasenas. No envia el historial de tu cuenta a OpenAI. Envia las preguntas de la conversacion y el contexto del catalogo. Se usa `store=False`; esto no equivale a prometer ausencia absoluta de retencion por parte del proveedor.

La llamada real no se verifico porque no se proporciono una API key. Las pruebas usan un cliente simulado y no generan cargos.

## Catalogo 2020-2026

El archivo fuente es `backend/src/main/resources/catalog.json`. Spring Boot lo incorpora a la base al arrancar. Se pueden ampliar los resultados con un token de lectura de TMDB:

```powershell
npm run catalog:sync
```

Primero configura TMDB_TOKEN en `.env`. El script incluye peliculas y series, caratulas y trailers oficiales cuando el proveedor los devuelve. Reinicia los servicios y revisa editorialmente los resultados. No se ejecuto la sincronizacion remota sin tus credenciales. Fuentes y detalles: [docs/CATALOG.md](docs/CATALOG.md).

## Pruebas y compilacion

Desde la raiz:

```powershell
npm run build
npm test
mvn -f backend/pom.xml package
.\.venv\Scripts\python.exe -m unittest discover -s chatbot
```

Si Maven intenta guardar su repositorio en una ubicacion sin permisos:

```powershell
mvn "-Dmaven.repo.local=$PWD/.m2/repository" -f backend/pom.xml package
```

Con React, Spring Boot preview, Mailpit y Streamlit ya iniciados:

```powershell
npm --prefix frontend exec -- playwright install chromium
npm run test:e2e
```

Resultados locales: ocho pruebas de API/seguridad, cinco pruebas de filtros y enlaces, tres pruebas Python y tres escenarios Playwright. Playwright cubre registro SMTP, listas, puntuaciones, aislamiento entre perfiles, logout y pantallas de 360, 390, 768, 1440 y 1920 pixeles. Las capturas locales estan en `.local/qa/`.

Los tres escenarios Playwright se repitieron satisfactoriamente con la API conectada a SQL Server local. Se comprobaron las seis tablas y la ausencia de permisos de administrador en `pelisdark_app`. Las ocho pruebas de API aisladas y GitHub Actions siguen usando H2; la automatizacion contra SQL Server en CI sigue pendiente.

La auditoria npm no reporto vulnerabilidades en la comprobacion local. Esto no certifica ausencia de vulnerabilidades en toda la aplicacion. No se realizo una auditoria completa de dependencias Java/Python ni una prueba de penetracion.

## GitHub Actions

El workflow conserva las tres etapas de la tarea:

```text
Compilar React y Java
         |
         v
Pruebas React + API + chatbot + navegador + npm audit
         |
         v
Copiar artefactos a staging y publicarlos como artefacto de GitHub
```

Un fallo detiene los pasos siguientes. Se usan H2 y Mailpit en CI: no necesitas proporcionar secretos reales para ejecutar las pruebas. **El pipeline no prueba SQL Server ni hace un despliegue publico.** Tampoco ha sido ejecutado en GitHub con estos nuevos cambios, que todavia no se han subido.

Para simularlo localmente despues de compilar ambos componentes:

```powershell
npm run deploy:simulate
```

Staging contiene React compilado, el JAR de Java y el chatbot; no copia claves, cuentas de prueba ni archivos `.env`. Publicar solamente React en GitHub Pages no ejecutaria Java, SQL Server ni Streamlit.

## Chatbot integrado

El icono de la cabecera y el boton flotante abren el asistente en la esquina inferior derecha, sin otra pestana. El panel se adapta al celular y conserva la conversacion al minimizarlo; recargar puede reiniciar la sesion. Streamlit sigue disponible de forma independiente para las pruebas academicas.

La web incrusta Streamlit con `embed=true&compact=true`. Inicia ambos servicios con `Iniciar-PelisDark.bat`. `OPENAI_API_KEY` se configura solamente en el `.env` privado del servidor. `VITE_CHATBOT_URL` permite configurar la direccion publica de Streamlit; no debe contener secretos. En produccion ambos sitios deben usar HTTPS y permitir la incrustacion solo desde el dominio de PelisDark mediante la configuracion del proxy. El modo integrado no sustituye la autenticacion ni las cuotas pendientes para acceso publico.

## Copia de la base de datos

Se creo un respaldo completo y privado en `backend/backups/`. Los scripts de estructura, carga del catalogo, verificacion, respaldo y restauracion estan en [backend/database](backend/database/README.md). El `.bak` contiene datos reales de cuentas y perfiles: esta excluido de Git. Los scripts de restauracion crean una base separada y no sobrescriben PelisDark.

## Seguridad

Consulta [docs/SECURITY.md](docs/SECURITY.md). Se aplicaron sesiones HttpOnly, CSRF, BCrypt, verificaciones de propiedad, consultas parametrizadas, codigos con caducidad, limites de intentos y permisos SQL limitados. Las claves de API nunca forman parte del paquete React.

El archivo `deploy/nginx.conf.example` muestra un proxy HTTPS con limites de peticion y cabeceras de seguridad. Requiere adaptar dominio, certificados y rutas; no es un despliegue ya realizado.

## Mi veredicto y mejoras futuras

PelisDark deja de ser una maqueta y pasa a tener una base full stack util para aprendizaje y desarrollo. Los flujos principales se han probado localmente con SQL Server. **No seria responsable describirla como 100% lista para produccion** sin validar la entrega de correo externo, la API real de OpenAI, la infraestructura, las copias de seguridad y la carga esperada.

Prioridades recomendadas:

1. Automatizar las pruebas contra SQL Server tambien en CI, con migraciones versionadas y restauracion de copias. La conexion y los flujos locales ya estan comprobados.
2. Anadir recuperacion segura de contrasena, passkeys, gestion de dispositivos y revocacion de todas las sesiones al cambiar la clave.
3. Proteger Streamlit con la misma identidad de la web y cuotas por cuenta antes de permitir acceso externo.
4. Usar almacenamiento compartido de sesiones y limites, colas de correo, metricas y alertas.
5. Incorporar un panel de administracion y revision editorial, clasificacion por edades y controles parentales.
6. Introducir paginacion, busqueda indexada, cache y pruebas de carga cuando el catalogo crezca. Actualmente se limita a 500 titulos por consulta.
7. Revisar accesibilidad de forma exhaustiva y reducir dependencias de imagenes y fuentes externas mediante recursos con permisos adecuados.
8. Si se quiere reproducir contenido completo, resolver primero licencias, almacenamiento de video, transcodificacion, CDN y proteccion de contenido. Un enlace a un trailer no sustituye esa infraestructura.

Autor del proyecto original: Daniel Olivos / DARNEXDAN.

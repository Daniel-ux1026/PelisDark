# Copia completa y scripts de base de datos

## Donde esta la copia

El respaldo completo esta en `backend/backups/`, en un archivo `PelisDark_FECHA_HORA_IDENTIFICADOR.bak`. El archivo `latest.json` identifica la copia mas reciente e incluye su fecha UTC, tamano, version de SQL Server y hash SHA-256. Cada ejecucion crea un archivo nuevo, sin reemplazar las copias anteriores.

El `.bak` contiene las seis tablas, sus datos actuales, relaciones e indices: catalogo, cuentas, perfiles, codigos de verificacion, listas y puntuaciones. Tambien contiene correos y hashes de contrasenas. **Es privado: no lo subas a GitHub, no lo compartas publicamente y no lo adjuntes como si fuera solo un esquema de ejemplo.** La carpeta y los archivos `.bak` estan excluidos de Git.

Una copia de base de datos no incluye las credenciales externas del archivo `.env`, la API key de OpenAI ni los logins de la instancia SQL Server. Al restaurar en otra instancia puede ser necesario crear un login y vincularlo con el usuario de la base. Los codigos de correo incluidos conservan su caducidad original; la copia no los renueva.

El respaldo se genero con `COPY_ONLY`, `CHECKSUM` y compresion. Se comprobo con `RESTORE VERIFYONLY`, se compararon los hashes del archivo del servidor y del archivo en backend, y se probo una restauracion separada con `DBCC CHECKDB`. No se detuvo ni reemplazo la base activa.

## Scripts incluidos

| Archivo | Funcion |
| --- | --- |
| `01-Crear-Estructura.sql` | Crea PelisDark y sus seis tablas si aun no existen; no borra los datos existentes. No es un sistema de migraciones para esquemas parciales o incompatibles. |
| `02-Llenar-Catalogo.sql` | Inserta o actualiza los 21 titulos iniciales de 2020-2026. Se puede repetir sin duplicar IDs. No cambia cuentas, perfiles, listas ni puntuaciones. |
| `03-Verificar-Datos.sql` | Muestra cantidades por tabla, ano y formato sin mostrar contrasenas ni correos. |
| `Backup-PelisDark.ps1` | Crea un respaldo completo nuevo y una copia verificada dentro de backend/backups. |
| `Restore-PelisDark.ps1` | Restaura en una base nueva, por defecto PelisDark_Copia, y ejecuta DBCC CHECKDB. Rechaza la base activa y cualquier nombre que ya exista. |
| `SqlServer-Tools.ps1` | Funciones auxiliares de conexion; no contiene contrasenas. |

## Llenar la base con SQL Server Management Studio

1. Conectate a tu instancia SQL Server con una cuenta que tenga los permisos necesarios.
2. Abre `01-Crear-Estructura.sql` y ejecutalo con F5. Si PelisDark ya existe con sus tablas, se conserva.
3. Abre `02-Llenar-Catalogo.sql`. En la lista de bases de datos de la ventana de consulta, selecciona **PelisDark** antes de pulsar F5.
4. Abre `03-Verificar-Datos.sql`, selecciona **PelisDark** y ejecutalo. El catalogo inicial contiene 21 titulos.

Si estas revisando una copia restaurada, selecciona su nombre en los pasos 3 y 4; no ejecutes el script 01 para crear esa copia, usa el script de restauracion. El script 02 conserva otros titulos ya existentes, pero actualiza los campos de los IDs del catalogo inicial; no lo utilices para preservar ediciones manuales de esos mismos titulos.

No se insertan usuarios con contrasenas predeterminadas ni se evita la verificacion por correo. Para crear cuentas adicionales, usa el registro de la web. El respaldo ya incluye las cuentas que existian al generarlo.

Los scripts de creacion y carga son una alternativa para reconstruir estructura y catalogo inicial. **No sustituyen al `.bak` para recuperar cuentas, listas y puntuaciones.** Si ya restauraste el respaldo, no necesitas volver a cargar el catalogo.

## Crear otra copia completa

Desde PowerShell, en la carpeta principal de PelisDark:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\backend\database\Backup-PelisDark.ps1
```

El script solicita la contrasena administrativa sin mostrarla ni guardarla. Crea primero un archivo en la carpeta de backups de SQL Server y luego copia los mismos bytes a `backend/backups`, sin conceder permisos amplios a la carpeta del proyecto. La copia original del servidor tambien se conserva.

Cada respaldo refleja un momento concreto: los registros posteriores no se incorporan automaticamente. Una copia en el mismo disco no protege frente a la perdida del equipo; conserva otra copia en un medio seguro.

## Restaurar sin sobrescribir la web

Desde la raiz del proyecto:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\backend\database\Restore-PelisDark.ps1 -Database PelisDark_Copia
```

Si ese nombre ya existe, el script se detiene; usa otro nombre nuevo. No utiliza `WITH REPLACE`, no cambia la conexion de la web y no elimina la base original. SQL Server debe ser compatible con la version del respaldo.

Por defecto, verifica el hash del archivo de `backend/backups` y restaura desde su copia identica en la carpeta del servidor, indicada en `latest.json`. Esto evita dar acceso al servicio SQL a toda tu carpeta personal.

Si trasladas el `.bak` a otra computadora, colocalo en una carpeta que la instancia SQL Server pueda leer y especifica esa ruta:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\backend\database\Restore-PelisDark.ps1 -Database PelisDark_Copia -BackupPath "C:\RespaldosSQL\PelisDark_FECHA_HORA_IDENTIFICADOR.bak"
```

La ruta de `BackupPath` es una ruta accesible para SQL Server, no una descarga ni una URL. No copies ni muevas los archivos `.mdf` o `.ldf` de la base activa para reemplazar este procedimiento.

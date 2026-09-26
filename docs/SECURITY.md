# Seguridad y limites

## Controles implementados

- Spring Security exige una sesion autenticada en los endpoints privados.
- Cookies HttpOnly y SameSite=Strict; Secure activado por defecto. El modo local HTTP lo desactiva explicitamente.
- Sesion renovada al verificar el codigo, caducidad de 30 minutos y cierre de sesion con invalidacion.
- CSRF activo, incluido en registro, login y logout. React obtiene el token del servidor.
- No se guardan credenciales ni tokens de acceso en localStorage.
- BCrypt con coste 12 para contrasenas y codigos. Limite de 72 bytes para evitar truncamiento de BCrypt.
- Codigo aleatorio de seis digitos, expiracion de diez minutos, cinco intentos, consumo atomico y enfriamiento de un minuto por cuenta.
- Treinta peticiones POST de autenticacion por IP cada diez minutos, sin confiar en X-Forwarded-For del cliente.
- Consultas SQL parametrizadas y comprobacion de propiedad antes de leer o modificar un perfil.
- Claves foraneas, restricciones unicas y puntuaciones entre 1 y 5 en la base de datos.
- Maximo de cinco perfiles, validacion de campos y errores sin consultas SQL ni trazas internas.
- Cuenta SQL de aplicacion con permisos de datos, sin permisos de administracion ni de cambio de esquema.
- Secretos fuera del repositorio. OpenAI solo se invoca desde Python.
- Desactivado el usuario automatico de desarrollo de Spring Boot. No hay credenciales maestras ni bypass de correo.
- API y servidores de prueba vinculados a loopback. Mailpit no entrega correo al exterior.

## Antes de publicar

1. Mantener y ampliar las pruebas contra SQL Server real. Los flujos de navegador ya pasaron en la instancia local; el pipeline y las pruebas de API aisladas aun usan H2, que no prueba equivalencia completa del motor.
2. Mantener SQL Server y SMTP fuera de Internet. Configurar certificados validos y no confiar ciegamente en certificados del servidor SQL.
3. Usar HTTPS, COOKIE_SECURE=true, SMTP_AUTH=true y SMTP_TLS=true con un proveedor de correo verificado.
4. No publicar Vite, Mailpit ni el perfil preview. El ejemplo Nginx limita el cuerpo a 32 KB; el limite de formularios de Tomcat no sustituye al limite de JSON del proxy.
5. Proteger Streamlit con autenticacion y un limite de gasto centralizado antes de exponerlo. El cooldown por sesion de Streamlit no es una barrera contra un atacante que crea nuevas sesiones.
6. Mover rate limiting y sesiones a almacenamiento compartido para mas de una instancia. Tras un proxy, la IP visible sera la del proxy hasta configurar una cadena de confianza de forma segura.
7. Implementar recuperacion de contrasena, cierre remoto de todas las sesiones y revocacion tras cambio de contrasena. Actualmente se cierra la sesion que cambia la clave, no las de otros dispositivos.
8. Incorporar auditoria de eventos, gestion de incidentes, copias de seguridad y pruebas de restauracion.
9. Revisar dependencias Java y Python con un escaner de vulnerabilidades y aplicar actualizaciones. npm audit solo cubre JavaScript.
10. Hacer pruebas de carga, revision de privacidad, accesibilidad y una evaluacion independiente de seguridad.

## Amenazas residuales

La verificacion por correo depende de la seguridad del buzon y no reemplaza una passkey. El registro devuelve un identificador opaco para correos ya registrados, pero no garantiza eliminar todos los canales laterales de enumeracion, como el tiempo de respuesta. Los limites locales se reinician al reiniciar la aplicacion. Las sesiones se pierden al reiniciar el backend, aunque los datos de SQL Server permanecen. La base preview es temporal y se borra al reiniciar.

La aplicacion no se presenta como invulnerable ni como una plataforma comercial lista para usuarios masivos. El modo preview solo existe para pruebas locales y usa la misma verificacion por correo que el modo SQL Server.

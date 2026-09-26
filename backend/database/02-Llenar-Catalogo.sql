-- Initial catalog snapshot: 21 titles (2020-2026).
-- Rerunnable: updates matching IDs and inserts missing titles.
-- No accounts, passwords, watchlists or ratings are modified.
-- Select PelisDark (or your restored copy) as the connection database first.
IF DB_NAME() IN (N'master',N'model',N'msdb',N'tempdb')
    THROW 50001, 'Selecciona la base PelisDark antes de ejecutar este script.', 1;
IF OBJECT_ID(N'dbo.catalog',N'U') IS NULL
    THROW 50002, 'Falta la estructura. Ejecuta primero 01-Crear-Estructura.sql.', 1;
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @seed TABLE (
 id VARCHAR(40) PRIMARY KEY, title NVARCHAR(200), kind VARCHAR(10),
 release_year INT, genre NVARCHAR(60), description NVARCHAR(2000),
 poster VARCHAR(600), backdrop VARCHAR(600), trailer VARCHAR(100)
);
INSERT INTO @seed(id,title,kind,release_year,genre,description,poster,backdrop,trailer)
VALUES
(N'dune2',N'Dune: Parte dos',N'movie',2024,N'Ciencia ficcion',N'Paul se une a los fremen mientras debe elegir entre su amor y el destino de Arrakis.',N'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',N'https://hd-report.com/wp-content/uploads/2024/05/dune-part-2-Paul-Chani-desert-trailer-still-15-thumb-scaled.jpg',N'Way9Dexny3w'),
(N'dune',N'Dune',N'movie',2021,N'Ciencia ficcion',N'La familia Atreides llega a un planeta desertico donde se decide el equilibrio del imperio.',N'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',N'',N'n9xhJrPXop4'),
(N'soul',N'Soul',N'movie',2020,N'Animacion',N'Un profesor de musica reconsidera lo que significa vivir cuando su gran oportunidad toma un giro inesperado.',N'https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg',N'',N'xOsLIiBStEs'),
(N'tenet',N'Tenet',N'movie',2020,N'Accion',N'Un agente entra en una operacion donde el tiempo puede avanzar en dos direcciones.',N'https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg',N'',N'LdOM0x0XDMo'),
(N'encanto',N'Encanto',N'movie',2021,N'Animacion',N'Mirabel busca su lugar dentro de una familia colombiana cuyos miembros poseen dones extraordinarios.',N'https://image.tmdb.org/t/p/w500/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg',N'',N'CaimKeDcudo'),
(N'batman',N'The Batman',N'movie',2022,N'Suspenso',N'Un joven Batman investiga una serie de crimenes que descubre la corrupcion de Gotham.',N'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',N'',N'mqqft2x_Aa4'),
(N'maverick',N'Top Gun: Maverick',N'movie',2022,N'Accion',N'Maverick regresa para preparar a un grupo de pilotos para una mision de alto riesgo.',N'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',N'',N'giXco2jaZ_4'),
(N'oppenheimer',N'Oppenheimer',N'movie',2023,N'Drama',N'El fisico J. Robert Oppenheimer dirige un proyecto que cambia la historia y su propia vida.',N'https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg',N'',N'uYPbbksJxIg'),
(N'barbie',N'Barbie',N'movie',2023,N'Comedia',N'Barbie abandona la perfeccion de su mundo y descubre las contradicciones de la vida real.',N'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',N'',N'pBk4NYhWNMM'),
(N'spiderverse',N'Spider-Man: A traves del Spider-Verso',N'movie',2023,N'Animacion',N'Miles Morales se reencuentra con Gwen y descubre una sociedad de heroes de otras dimensiones.',N'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',N'',N'cqGjhVJWtEg'),
(N'insideout',N'Intensamente 2',N'movie',2024,N'Animacion',N'La adolescencia de Riley trae nuevas emociones y transforma el trabajo de Alegria.',N'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',N'',N'LEjhY15eCx0'),
(N'wildrobot',N'Robot salvaje',N'movie',2024,N'Animacion',N'Una robot aprende a sobrevivir en una isla y a cuidar de un pequeno ganso.',N'https://image.tmdb.org/t/p/w500/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg',N'',N'67vbA5ZJdKQ'),
(N'queensgambit',N'Gambito de dama',N'tv',2020,N'Drama',N'Una joven prodigio intenta alcanzar la cima del ajedrez mientras enfrenta sus conflictos personales.',N'https://static.tvmaze.com/uploads/images/original_untouched/510/1275203.jpg',N'',N''),
(N'squidgame',N'El juego del calamar',N'tv',2021,N'Suspenso',N'Personas endeudadas aceptan participar en juegos infantiles con consecuencias mortales.',N'https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg',N'',N''),
(N'severance',N'Severance',N'tv',2022,N'Ciencia ficcion',N'Los empleados de una empresa separan sus recuerdos laborales de su vida personal.',N'https://static.tvmaze.com/uploads/images/original_untouched/548/1371406.jpg',N'',N''),
(N'wednesday',N'Merlina',N'tv',2022,N'Fantasia',N'Merlina Addams investiga un misterio mientras se adapta a una escuela poco convencional.',N'https://static.tvmaze.com/uploads/images/original_untouched/586/1466410.jpg',N'',N''),
(N'lastofus',N'The Last of Us',N'tv',2023,N'Drama',N'Joel y Ellie cruzan un territorio devastado por una infeccion que transformo a la humanidad.',N'https://static.tvmaze.com/uploads/images/original_untouched/563/1409008.jpg',N'',N''),
(N'fallout',N'Fallout',N'tv',2024,N'Ciencia ficcion',N'Una habitante de un refugio descubre un mundo exterior muy distinto de lo que le ensenaron.',N'https://static.tvmaze.com/uploads/images/original_untouched/599/1499142.jpg',N'',N''),
(N'shogun',N'Shogun',N'tv',2024,N'Drama',N'Un navegante ingles queda involucrado en las luchas de poder del Japon del siglo XVII.',N'https://static.tvmaze.com/uploads/images/original_untouched/506/1265637.jpg',N'',N''),
(N'adolescence',N'Adolescencia',N'tv',2025,N'Drama',N'Una acusacion de asesinato contra un adolescente sacude a su familia y a su comunidad.',N'https://static.tvmaze.com/uploads/images/original_untouched/558/1395109.jpg',N'',N''),
(N'hailmary',N'Proyecto Fin del Mundo',N'movie',2026,N'Ciencia ficcion',N'Un profesor despierta en una nave lejos de la Tierra y reconstruye el proposito de una mision decisiva para la humanidad.',N'https://filmitena.com/img/Movie/Original/20137_Or_20260319224032.jpg',N'',N'oA1aBu4ISxQ');

BEGIN TRY
    BEGIN TRANSACTION;
    UPDATE c
    SET title=s.title, kind=s.kind, release_year=s.release_year,
        genre=s.genre, description=s.description, poster=s.poster,
        backdrop=s.backdrop, trailer=s.trailer
    FROM dbo.catalog AS c
    INNER JOIN @seed AS s ON s.id=c.id;

    INSERT INTO dbo.catalog(id,title,kind,release_year,genre,description,poster,backdrop,trailer)
    SELECT s.id,s.title,s.kind,s.release_year,s.genre,s.description,s.poster,s.backdrop,s.trailer
    FROM @seed AS s
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.catalog AS c WITH (UPDLOCK,HOLDLOCK) WHERE c.id=s.id
    );
    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
END CATCH;
SELECT COUNT(*) AS catalog_titles FROM dbo.catalog;
GO

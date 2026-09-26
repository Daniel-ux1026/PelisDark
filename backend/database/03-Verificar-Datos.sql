-- Select PelisDark (or your restored copy) as the connection database first.
IF OBJECT_ID(N'dbo.catalog',N'U') IS NULL
    THROW 50002, 'Selecciona una base con la estructura de PelisDark.', 1;
SET NOCOUNT ON;
SELECT 'catalog' AS table_name, COUNT(*) AS row_count FROM dbo.catalog
UNION ALL SELECT 'accounts',COUNT(*) FROM dbo.accounts
UNION ALL SELECT 'profiles',COUNT(*) FROM dbo.profiles
UNION ALL SELECT 'watchlist',COUNT(*) FROM dbo.watchlist
UNION ALL SELECT 'ratings',COUNT(*) FROM dbo.ratings
UNION ALL SELECT 'challenges',COUNT(*) FROM dbo.challenges;
SELECT release_year,kind,COUNT(*) AS titles
FROM dbo.catalog GROUP BY release_year,kind ORDER BY release_year,kind;
GO

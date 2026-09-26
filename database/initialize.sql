IF DB_ID('PelisDark') IS NULL CREATE DATABASE PelisDark;
GO
USE PelisDark;
GO
IF OBJECT_ID('dbo.accounts') IS NULL
BEGIN
:r backend/src/main/resources/schema.sql
END;
GO
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'pelisdark_app')
    CREATE LOGIN pelisdark_app WITH PASSWORD = '$(DB_PASSWORD)', CHECK_POLICY = ON;
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'pelisdark_app')
    CREATE USER pelisdark_app FOR LOGIN pelisdark_app;
GO
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO pelisdark_app;
GO

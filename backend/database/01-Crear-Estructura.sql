-- Run in SQL Server Management Studio or with sqlcmd as a database administrator.
-- Existing databases and records are never deleted.
USE master;
GO
IF DB_ID(N'PelisDark') IS NULL
    CREATE DATABASE [PelisDark];
GO
USE [PelisDark];
GO
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;
    IF OBJECT_ID(N'dbo.accounts', N'U') IS NULL
    BEGIN
CREATE TABLE accounts (
 id VARCHAR(36) PRIMARY KEY, email VARCHAR(254) NOT NULL UNIQUE,
 password_hash VARCHAR(100) NOT NULL, verified BIT NOT NULL DEFAULT 0
);
CREATE TABLE profiles (
 id VARCHAR(36) PRIMARY KEY, account_id VARCHAR(36) NOT NULL REFERENCES accounts(id),
 name NVARCHAR(40) NOT NULL, color VARCHAR(7) NOT NULL,
 language VARCHAR(5) NOT NULL DEFAULT 'es', spoilers BIT NOT NULL DEFAULT 0
);
CREATE INDEX ix_profiles_account ON profiles(account_id);
CREATE TABLE challenges (
 id VARCHAR(36) PRIMARY KEY, account_id VARCHAR(36) NOT NULL REFERENCES accounts(id),
 code_hash VARCHAR(100) NOT NULL, expires_at BIGINT NOT NULL, attempts INT NOT NULL DEFAULT 0,
 used BIT NOT NULL DEFAULT 0
);
CREATE INDEX ix_challenges_account ON challenges(account_id);
CREATE TABLE catalog (
 id VARCHAR(40) PRIMARY KEY, title NVARCHAR(200) NOT NULL,
 kind VARCHAR(10) NOT NULL CHECK (kind IN ('movie','tv')),
 release_year INT NOT NULL CHECK(release_year BETWEEN 2020 AND 2026),
 genre NVARCHAR(60) NOT NULL, description NVARCHAR(2000) NOT NULL,
 poster VARCHAR(600) NOT NULL, backdrop VARCHAR(600) NOT NULL, trailer VARCHAR(100) NOT NULL
);
CREATE TABLE watchlist (
 profile_id VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
 media_id VARCHAR(40) NOT NULL REFERENCES catalog(id),
 PRIMARY KEY(profile_id,media_id)
);
CREATE TABLE ratings (
 profile_id VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
 media_id VARCHAR(40) NOT NULL REFERENCES catalog(id),
 score INT NOT NULL CHECK(score BETWEEN 1 AND 5), PRIMARY KEY(profile_id,media_id)
);
    END;
    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
END CATCH;
GO

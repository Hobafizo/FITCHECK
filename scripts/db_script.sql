USE [master]
GO
/****** Object:  Database [FitCheck]    Script Date: 6/8/2025 9:33:32 AM ******/
CREATE DATABASE [FitCheck]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'FitCheck', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL13.SQLSERVER\MSSQL\DATA\FitCheck.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'FitCheck_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL13.SQLSERVER\MSSQL\DATA\FitCheck_log.ldf' , SIZE = 73728KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
GO
ALTER DATABASE [FitCheck] SET COMPATIBILITY_LEVEL = 130
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [FitCheck].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [FitCheck] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [FitCheck] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [FitCheck] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [FitCheck] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [FitCheck] SET ARITHABORT OFF 
GO
ALTER DATABASE [FitCheck] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [FitCheck] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [FitCheck] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [FitCheck] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [FitCheck] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [FitCheck] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [FitCheck] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [FitCheck] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [FitCheck] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [FitCheck] SET  DISABLE_BROKER 
GO
ALTER DATABASE [FitCheck] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [FitCheck] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [FitCheck] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [FitCheck] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [FitCheck] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [FitCheck] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [FitCheck] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [FitCheck] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [FitCheck] SET  MULTI_USER 
GO
ALTER DATABASE [FitCheck] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [FitCheck] SET DB_CHAINING OFF 
GO
ALTER DATABASE [FitCheck] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [FitCheck] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [FitCheck] SET DELAYED_DURABILITY = DISABLED 
GO
EXEC sys.sp_db_vardecimal_storage_format N'FitCheck', N'ON'
GO
ALTER DATABASE [FitCheck] SET QUERY_STORE = OFF
GO
USE [FitCheck]
GO
ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 0;
GO
ALTER DATABASE SCOPED CONFIGURATION SET PARAMETER_SNIFFING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET QUERY_OPTIMIZER_HOTFIXES = OFF;
GO
USE [FitCheck]
GO
/****** Object:  UserDefinedTableType [dbo].[TagList]    Script Date: 6/8/2025 9:33:34 AM ******/
CREATE TYPE [dbo].[TagList] AS TABLE(
	[Class] [varchar](50) NOT NULL,
	[Tag] [varchar](50) NOT NULL
)
GO
/****** Object:  UserDefinedTableType [dbo].[WardrobeItemList]    Script Date: 6/8/2025 9:33:34 AM ******/
CREATE TYPE [dbo].[WardrobeItemList] AS TABLE(
	[ItemName] [varchar](50) NULL,
	[BrandName] [varchar](50) NULL,
	[ImagePath] [varchar](200) NOT NULL,
	[Status] [tinyint] NOT NULL
)
GO
/****** Object:  UserDefinedTableType [dbo].[WardrobeItemsToUpdate]    Script Date: 6/8/2025 9:33:34 AM ******/
CREATE TYPE [dbo].[WardrobeItemsToUpdate] AS TABLE(
	[ImagePath] [varchar](200) NOT NULL,
	[CleanPath] [varchar](200) NOT NULL,
	[ColorHex] [varchar](6) NOT NULL,
	[ColorName] [varchar](30) NOT NULL
)
GO
/****** Object:  UserDefinedFunction [dbo].[GetColorDistance]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetColorDistance](@H1 REAL, @S1 REAL, @V1 REAL, @H2 REAL, @S2 REAL, @V2 REAL)
	RETURNS REAL
AS
BEGIN
	-- DECLARE
	DECLARE @Result REAL = 0;

	SET @Result += POWER((@H2 - @H1), 2);
	SET @Result += POWER((@S2 - @S1), 2);
	SET @Result += POWER((@V2 - @V1), 2);

	SET @Result = SQRT(@Result);
	RETURN @Result;
END
GO
/****** Object:  UserDefinedFunction [dbo].[GetColorHue]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetColorHue](@R TINYINT, @G TINYINT, @B TINYINT)
	RETURNS REAL
AS
BEGIN
	-- DECLARE
	DECLARE @Result REAL = 0, @Rd REAL, @Gd REAL, @Bd REAL, @Min REAL, @Max REAL, @Delta REAL;

	SET @Rd = @R / CAST(255 AS REAL);
	SET @Gd = @G / CAST(255 AS REAL);
	SET @Bd = @B / CAST(255 AS REAL);

	SET @Min =	CASE
					WHEN @Rd < @Gd AND @Rd < @Bd THEN @Rd
					WHEN @Gd < @Rd AND @Gd < @Bd THEN @Gd
					ELSE @Bd
				END;
	
	SET @Max =	CASE
					WHEN @Rd > @Gd AND @Rd > @Bd THEN @Rd
					WHEN @Gd > @Rd AND @Gd > @Bd THEN @Gd
					ELSE @Bd
				END;

	SET @Delta = @Max - @Min;
	
	IF (@Delta = 0)
		SET @Result = 0;

	ELSE IF (@Max = @Rd)
	BEGIN
		SET @Result = (@Gd - @Bd) / @Delta;
		SET @Result = @Result - FLOOR(@Result / 6) * 6; -- @Result %= 6
		SET @Result = @Result * 60;
	END

	ELSE IF (@Max = @Gd)
	BEGIN
		SET @Result = (@Bd - @Rd) / @Delta;
		SET @Result = (@Result + 2) * 60;
	END

	ELSE IF (@Max = @Bd)
	BEGIN
		SET @Result = (@Rd - @Gd) / @Delta;
		SET @Result = (@Result + 4) * 60;
	END

	RETURN @Result;
END
GO
/****** Object:  UserDefinedFunction [dbo].[GetColorHue_Hex]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetColorHue_Hex](@ColorHex VARCHAR(6))
	RETURNS REAL
AS
BEGIN
	-- DECLARE
	DECLARE @Result REAL = 0, @R TINYINT, @G TINYINT, @B TINYINT,
			@Rd REAL, @Gd REAL, @Bd REAL, @Min REAL, @Max REAL, @Delta REAL;

	SET @R = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ColorHex, 1, 2), 2));
	SET @G = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ColorHex, 3, 2), 2));
	SET @B = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ColorHex, 5, 2), 2));

	SET @Rd = @R / CAST(255 AS REAL);
	SET @Gd = @G / CAST(255 AS REAL);
	SET @Bd = @B / CAST(255 AS REAL);

	SET @Min =	CASE
					WHEN @Rd < @Gd AND @Rd < @Bd THEN @Rd
					WHEN @Gd < @Rd AND @Gd < @Bd THEN @Gd
					ELSE @Bd
				END;
	
	SET @Max =	CASE
					WHEN @Rd > @Gd AND @Rd > @Bd THEN @Rd
					WHEN @Gd > @Rd AND @Gd > @Bd THEN @Gd
					ELSE @Bd
				END;

	SET @Delta = @Max - @Min;
	
	IF (@Delta = 0)
		SET @Result = 0;

	ELSE IF (@Max = @Rd)
	BEGIN
		SET @Result = (@Gd - @Bd) / @Delta;
		SET @Result = @Result - FLOOR(@Result / 6) * 6; -- @Result %= 6
		SET @Result = @Result * 60;
	END

	ELSE IF (@Max = @Gd)
	BEGIN
		SET @Result = (@Bd - @Rd) / @Delta;
		SET @Result = (@Result + 2) * 60;
	END

	ELSE IF (@Max = @Bd)
	BEGIN
		SET @Result = (@Rd - @Gd) / @Delta;
		SET @Result = (@Result + 4) * 60;
	END

	RETURN @Result;
END
GO
/****** Object:  UserDefinedFunction [dbo].[GetColorSaturation]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetColorSaturation](@R TINYINT, @G TINYINT, @B TINYINT)
	RETURNS REAL
AS
BEGIN
	-- DECLARE
	DECLARE @Result REAL = 0, @Rd REAL, @Gd REAL, @Bd REAL, @Min REAL, @Max REAL, @Delta REAL;

	SET @Rd = @R / CAST(255 AS REAL);
	SET @Gd = @G / CAST(255 AS REAL);
	SET @Bd = @B / CAST(255 AS REAL);

	SET @Min =	CASE
					WHEN @Rd < @Gd AND @Rd < @Bd THEN @Rd
					WHEN @Gd < @Rd AND @Gd < @Bd THEN @Gd
					ELSE @Bd
				END;
	
	SET @Max =	CASE
					WHEN @Rd > @Gd AND @Rd > @Bd THEN @Rd
					WHEN @Gd > @Rd AND @Gd > @Bd THEN @Gd
					ELSE @Bd
				END;

	SET @Delta = @Max - @Min;
	
	IF (@Max = 0)
		SET @Result = 0;

	ELSE
		SET @Result = @Delta / @Max;

	RETURN @Result;
END
GO
/****** Object:  UserDefinedFunction [dbo].[GetColorSaturation_Hex]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetColorSaturation_Hex](@ColorHex VARCHAR(6))
	RETURNS REAL
AS
BEGIN
	-- DECLARE
	DECLARE @Result REAL = 0, @R TINYINT, @G TINYINT, @B TINYINT,
			@Rd REAL, @Gd REAL, @Bd REAL, @Min REAL, @Max REAL, @Delta REAL;

	SET @R = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ColorHex, 1, 2), 2));
	SET @G = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ColorHex, 3, 2), 2));
	SET @B = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ColorHex, 5, 2), 2));

	SET @Rd = @R / CAST(255 AS REAL);
	SET @Gd = @G / CAST(255 AS REAL);
	SET @Bd = @B / CAST(255 AS REAL);

	SET @Min =	CASE
					WHEN @Rd < @Gd AND @Rd < @Bd THEN @Rd
					WHEN @Gd < @Rd AND @Gd < @Bd THEN @Gd
					ELSE @Bd
				END;
	
	SET @Max =	CASE
					WHEN @Rd > @Gd AND @Rd > @Bd THEN @Rd
					WHEN @Gd > @Rd AND @Gd > @Bd THEN @Gd
					ELSE @Bd
				END;

	SET @Delta = @Max - @Min;
	
	IF (@Max = 0)
		SET @Result = 0;

	ELSE
		SET @Result = @Delta / @Max;

	RETURN @Result;
END
GO
/****** Object:  UserDefinedFunction [dbo].[GetColorValue]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetColorValue](@R TINYINT, @G TINYINT, @B TINYINT)
	RETURNS REAL
AS
BEGIN
	-- DECLARE
	DECLARE @Result REAL = 0, @Rd REAL, @Gd REAL, @Bd REAL;

	SET @Rd = @R / CAST(255 AS REAL);
	SET @Gd = @G / CAST(255 AS REAL);
	SET @Bd = @B / CAST(255 AS REAL);
	
	SET @Result =	CASE
					WHEN @Rd > @Gd AND @Rd > @Bd THEN @Rd
					WHEN @Gd > @Rd AND @Gd > @Bd THEN @Gd
					ELSE @Bd
				END;

	RETURN @Result;
END
GO
/****** Object:  UserDefinedFunction [dbo].[GetColorValue_Hex]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetColorValue_Hex](@ColorHex VARCHAR(6))
	RETURNS REAL
AS
BEGIN
	-- DECLARE
	DECLARE @Result REAL = 0, @R TINYINT, @G TINYINT, @B TINYINT, @Rd REAL, @Gd REAL, @Bd REAL;

	SET @R = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ColorHex, 1, 2), 2));
	SET @G = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ColorHex, 3, 2), 2));
	SET @B = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ColorHex, 5, 2), 2));

	SET @Rd = @R / CAST(255 AS REAL);
	SET @Gd = @G / CAST(255 AS REAL);
	SET @Bd = @B / CAST(255 AS REAL);
	
	SET @Result =	CASE
					WHEN @Rd > @Gd AND @Rd > @Bd THEN @Rd
					WHEN @Gd > @Rd AND @Gd > @Bd THEN @Gd
					ELSE @Bd
				END;

	RETURN @Result;
END
GO
/****** Object:  Table [dbo].[Color_Palettes]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Color_Palettes](
	[Category] [varchar](30) NOT NULL,
	[PaletteID] [int] NOT NULL,
	[ColorHex] [varchar](6) NOT NULL,
	[R] [tinyint] NULL,
	[G] [tinyint] NULL,
	[B] [tinyint] NULL,
	[H] [real] NULL,
	[S] [real] NULL,
	[V] [real] NULL,
	[Likes] [int] NOT NULL,
	[Date] [varchar](50) NOT NULL,
	[Source] [varchar](20) NULL,
 CONSTRAINT [PK_Color_Palettes] PRIMARY KEY CLUSTERED 
(
	[PaletteID] ASC,
	[ColorHex] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Item_Tags]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Item_Tags](
	[ItemID] [int] NOT NULL,
	[TagID] [int] NOT NULL,
 CONSTRAINT [PK_Item_Tags] PRIMARY KEY CLUSTERED 
(
	[ItemID] ASC,
	[TagID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Outfit_Suggestion_Items]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Outfit_Suggestion_Items](
	[SugID] [int] NOT NULL,
	[ItemID] [int] NOT NULL,
 CONSTRAINT [PK_Outfit_Suggestion_Items] PRIMARY KEY CLUSTERED 
(
	[SugID] ASC,
	[ItemID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Outfit_Suggestion_Ratings]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Outfit_Suggestion_Ratings](
	[SugID] [int] NOT NULL,
	[Rate] [tinyint] NOT NULL,
	[SubmitTime] [datetime] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Outfit_Suggestions]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Outfit_Suggestions](
	[SugID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NOT NULL,
	[PaletteID] [int] NULL,
	[SuggestTime] [datetime] NOT NULL,
 CONSTRAINT [PK_Outfit_Suggestions] PRIMARY KEY CLUSTERED 
(
	[SugID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tags]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tags](
	[TagID] [int] IDENTITY(1,1) NOT NULL,
	[Class] [varchar](50) NOT NULL,
	[Tag] [varchar](50) NOT NULL,
	[InsertTime] [datetime] NOT NULL,
 CONSTRAINT [PK_Tags] PRIMARY KEY CLUSTERED 
(
	[TagID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [IX_Tags] UNIQUE NONCLUSTERED 
(
	[Tag] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User_Outfit_Items]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User_Outfit_Items](
	[OutfitID] [int] NOT NULL,
	[ItemID] [int] NOT NULL,
 CONSTRAINT [PK_User_Outfit_Items] PRIMARY KEY CLUSTERED 
(
	[OutfitID] ASC,
	[ItemID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User_Outfits]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User_Outfits](
	[OutfitID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NOT NULL,
	[PaletteID] [int] NOT NULL,
	[Favorite] [bit] NOT NULL,
	[SaveTime] [datetime] NOT NULL,
 CONSTRAINT [PK_User_Outfits] PRIMARY KEY CLUSTERED 
(
	[OutfitID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User_Preferences]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User_Preferences](
	[UserID] [int] NOT NULL,
	[TagID] [int] NOT NULL,
 CONSTRAINT [PK_User_Preferences] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC,
	[TagID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[FirstName] [varchar](50) NOT NULL,
	[LastName] [varchar](50) NOT NULL,
	[Email] [varchar](50) NOT NULL,
	[Password] [varchar](50) NOT NULL,
	[Gender] [char](1) NOT NULL,
	[Age] [tinyint] NOT NULL,
	[BirthDate] [smalldatetime] NOT NULL,
	[PhoneNum] [varchar](14) NULL,
	[VerifyCode] [varchar](20) NULL,
	[Verified] [bit] NOT NULL,
	[ForgetCode] [varchar](20) NULL,
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Wardrobe_Items]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Wardrobe_Items](
	[ItemID] [int] IDENTITY(1,1) NOT NULL,
	[ItemName] [varchar](50) NULL,
	[BrandName] [varchar](50) NULL,
	[ImagePath] [varchar](200) NOT NULL,
	[Status] [tinyint] NOT NULL,
	[Color] [varchar](6) NULL,
	[InsertTime] [datetime] NOT NULL,
 CONSTRAINT [PK_Wardrobe_Items] PRIMARY KEY CLUSTERED 
(
	[ItemID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [IX_Wardrobe_Items] UNIQUE NONCLUSTERED 
(
	[ImagePath] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Wardrobes]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Wardrobes](
	[UserID] [int] NOT NULL,
	[ItemID] [int] NOT NULL,
 CONSTRAINT [PK_Wardrobes] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC,
	[ItemID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Index [IX_Outfit_Suggestion_Ratings]    Script Date: 6/8/2025 9:33:34 AM ******/
CREATE NONCLUSTERED INDEX [IX_Outfit_Suggestion_Ratings] ON [dbo].[Outfit_Suggestion_Ratings]
(
	[SugID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_Outfit_Suggestions]    Script Date: 6/8/2025 9:33:34 AM ******/
CREATE NONCLUSTERED INDEX [IX_Outfit_Suggestions] ON [dbo].[Outfit_Suggestions]
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_User_Outfits]    Script Date: 6/8/2025 9:33:34 AM ******/
CREATE NONCLUSTERED INDEX [IX_User_Outfits] ON [dbo].[User_Outfits]
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Users]    Script Date: 6/8/2025 9:33:34 AM ******/
CREATE UNIQUE NONCLUSTERED INDEX [IX_Users] ON [dbo].[Users]
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [dbo].[User_Outfits] ADD  CONSTRAINT [DF_User_Outfits_Favorite]  DEFAULT ((0)) FOR [Favorite]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_Users_Verified]  DEFAULT ((0)) FOR [Verified]
GO
ALTER TABLE [dbo].[Item_Tags]  WITH CHECK ADD  CONSTRAINT [FK_Item_Tags_Tags] FOREIGN KEY([TagID])
REFERENCES [dbo].[Tags] ([TagID])
GO
ALTER TABLE [dbo].[Item_Tags] CHECK CONSTRAINT [FK_Item_Tags_Tags]
GO
ALTER TABLE [dbo].[Item_Tags]  WITH CHECK ADD  CONSTRAINT [FK_Item_Tags_Wardrobe_Items] FOREIGN KEY([ItemID])
REFERENCES [dbo].[Wardrobe_Items] ([ItemID])
GO
ALTER TABLE [dbo].[Item_Tags] CHECK CONSTRAINT [FK_Item_Tags_Wardrobe_Items]
GO
ALTER TABLE [dbo].[Outfit_Suggestion_Items]  WITH CHECK ADD  CONSTRAINT [FK_Outfit_Suggestion_Items_Outfit_Suggestions] FOREIGN KEY([SugID])
REFERENCES [dbo].[Outfit_Suggestions] ([SugID])
GO
ALTER TABLE [dbo].[Outfit_Suggestion_Items] CHECK CONSTRAINT [FK_Outfit_Suggestion_Items_Outfit_Suggestions]
GO
ALTER TABLE [dbo].[Outfit_Suggestion_Items]  WITH CHECK ADD  CONSTRAINT [FK_Outfit_Suggestion_Items_Wardrobe_Items] FOREIGN KEY([ItemID])
REFERENCES [dbo].[Wardrobe_Items] ([ItemID])
GO
ALTER TABLE [dbo].[Outfit_Suggestion_Items] CHECK CONSTRAINT [FK_Outfit_Suggestion_Items_Wardrobe_Items]
GO
ALTER TABLE [dbo].[Outfit_Suggestion_Ratings]  WITH CHECK ADD  CONSTRAINT [FK_Outfit_Suggestion_Ratings_Outfit_Suggestions] FOREIGN KEY([SugID])
REFERENCES [dbo].[Outfit_Suggestions] ([SugID])
GO
ALTER TABLE [dbo].[Outfit_Suggestion_Ratings] CHECK CONSTRAINT [FK_Outfit_Suggestion_Ratings_Outfit_Suggestions]
GO
ALTER TABLE [dbo].[Outfit_Suggestions]  WITH CHECK ADD  CONSTRAINT [FK_Outfit_Suggestions_Users] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Outfit_Suggestions] CHECK CONSTRAINT [FK_Outfit_Suggestions_Users]
GO
ALTER TABLE [dbo].[User_Outfit_Items]  WITH CHECK ADD  CONSTRAINT [FK_User_Outfit_Items_User_Outfits] FOREIGN KEY([OutfitID])
REFERENCES [dbo].[User_Outfits] ([OutfitID])
GO
ALTER TABLE [dbo].[User_Outfit_Items] CHECK CONSTRAINT [FK_User_Outfit_Items_User_Outfits]
GO
ALTER TABLE [dbo].[User_Outfit_Items]  WITH CHECK ADD  CONSTRAINT [FK_User_Outfit_Items_Wardrobe_Items] FOREIGN KEY([ItemID])
REFERENCES [dbo].[Wardrobe_Items] ([ItemID])
GO
ALTER TABLE [dbo].[User_Outfit_Items] CHECK CONSTRAINT [FK_User_Outfit_Items_Wardrobe_Items]
GO
ALTER TABLE [dbo].[User_Outfits]  WITH CHECK ADD  CONSTRAINT [FK_User_Outfits_Users] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[User_Outfits] CHECK CONSTRAINT [FK_User_Outfits_Users]
GO
ALTER TABLE [dbo].[User_Preferences]  WITH CHECK ADD  CONSTRAINT [FK_User_Preferences_Tags] FOREIGN KEY([TagID])
REFERENCES [dbo].[Tags] ([TagID])
GO
ALTER TABLE [dbo].[User_Preferences] CHECK CONSTRAINT [FK_User_Preferences_Tags]
GO
ALTER TABLE [dbo].[User_Preferences]  WITH CHECK ADD  CONSTRAINT [FK_User_Preferences_Users] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[User_Preferences] CHECK CONSTRAINT [FK_User_Preferences_Users]
GO
ALTER TABLE [dbo].[Wardrobes]  WITH CHECK ADD  CONSTRAINT [FK_Wardrobes_Users] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Wardrobes] CHECK CONSTRAINT [FK_Wardrobes_Users]
GO
ALTER TABLE [dbo].[Wardrobes]  WITH CHECK ADD  CONSTRAINT [FK_Wardrobes_Wardrobe_Items] FOREIGN KEY([ItemID])
REFERENCES [dbo].[Wardrobe_Items] ([ItemID])
GO
ALTER TABLE [dbo].[Wardrobes] CHECK CONSTRAINT [FK_Wardrobes_Wardrobe_Items]
GO
/****** Object:  StoredProcedure [dbo].[CheckValidEmail]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[CheckValidEmail]
	@Email VARCHAR(50)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF EXISTS(SELECT TOP 1 UserID FROM [dbo].[Users] WHERE Email = @Email)
		RETURN 1;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[GenerateOutfit]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GenerateOutfit]
	@UserID INT,
	@Filters TagList READONLY
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- CONFIG
	DECLARE @OutputMaxCount INT = 5;
	DECLARE @ColorDistanceLimit REAL = 20;
	
	-- TABLES
	DECLARE @Items TABLE(ItemID INT PRIMARY KEY, Category VARCHAR(30), Color VARCHAR(6)); --to improve
	DECLARE @Categories TABLE(Idx INT IDENTITY(1,1), Category VARCHAR(30));
	DECLARE @CategoryItems TABLE(Idx INT, ItemID INT, Category VARCHAR(30), Color VARCHAR(6));
	DECLARE @ColorMatches TABLE(ItemID INT, Category VARCHAR(30), Color VARCHAR(6), PaletteID INT , PaletteColorHex VARCHAR(6), PaletteLikes INT, ColorDistance REAL); --to improve
	DECLARE @ColorPalettes TABLE(
		PaletteID INT PRIMARY KEY, CategoryCount INT, MatchCount INT, TotalColorDistance REAL,
		BestColorDistance REAL, TopStyleMatchCount INT, BestStyleMatchCount INT, ColorMatchScore REAL,
		StyleMatchScore REAL, TotalScore REAL
		);
	DECLARE @OutputMatches TABLE(
		Idx INT IDENTITY(1,1), PaletteID INT PRIMARY KEY, CategoryCount INT, MatchCount INT, TotalColorDistance REAL,
		BestColorDistance REAL, TopStyleMatchCount INT, BestStyleMatchCount INT, ColorMatchScore REAL,
		StyleMatchScore REAL, TotalScore REAL, SugID INT
		);
	
	-- DECLARE
	DECLARE @CategoryCount INT, @CategoryIdx INT, @Category VARCHAR(30);
	DECLARE @ItemCount INT, @ItemIdx INT, @ItemID INT, @ItemCategory VARCHAR(30), @ItemColor VARCHAR(6),
			@ColorR TINYINT, @ColorG TINYINT, @ColorB TINYINT, @ColorH REAL, @ColorS REAL, @ColorV REAL,
			@FilterCount INT, @ThemeFilterCount INT;
	DECLARE @OutputCount INT, @OutputIdx INT, @PaletteID INT, @SugID INT;
	
	-- Insert all items in user wardrobe
	INSERT INTO @Items
	SELECT a.ItemID, a.Category, a.Color
	FROM
	(
		SELECT wit.ItemID, tags.Tag AS Category, wit.Color, ROW_NUMBER() OVER(PARTITION BY wit.ItemID ORDER BY tags.TagID) AS TagNo
		FROM [dbo].[Wardrobes] wrd
		JOIN [dbo].[Wardrobe_Items] wit ON wit.ItemID = wrd.ItemID
		JOIN [dbo].[Item_Tags] itags ON itags.ItemID = wit.ItemID
		JOIN [dbo].[Tags] tags ON tags.TagID = itags.TagID AND tags.Class = 'Category'
		WHERE wrd.UserID = @UserID AND wit.[Status] = 1
		AND wit.Color IS NOT NULL
	) a
	WHERE a.TagNo = 1;

	SELECT @FilterCount = COUNT(*) FROM @Filters WHERE Class <> 'Theme';
	SELECT @ThemeFilterCount = COUNT(*) FROM @Filters WHERE Class = 'Theme';

	-- Remove items that do not match filters
	IF (@FilterCount > 0)
		DELETE items
		FROM @Items items
		LEFT JOIN @Filters fil ON fil.Class <> 'Theme'
		WHERE NOT EXISTS
		(
			SELECT tags.TagID
			FROM [dbo].[Item_Tags] itags
			JOIN [dbo].[Tags] tags ON tags.TagID = itags.TagID
			WHERE itags.ItemID = items.ItemID
			AND tags.Class = fil.Class AND tags.Tag = fil.Tag
		);
	
	-- Load categories of items
	INSERT INTO @Categories
	SELECT DISTINCT Category
	FROM @Items;
	
	SET @CategoryCount = @@ROWCOUNT;
	SET @CategoryIdx = 1;
	
	-- Loop through categories
	WHILE (@CategoryIdx <= @CategoryCount)
	BEGIN
		SELECT @Category = Category FROM @Categories WHERE Idx = @CategoryIdx;
	
		-- Loop through items of current category
		DELETE FROM @CategoryItems;
		INSERT INTO @CategoryItems SELECT ROW_NUMBER() OVER(ORDER BY ItemID), * FROM @Items WHERE Category = @Category;
	
		SET @ItemCount = @@ROWCOUNT;
		SET @ItemIdx = 1;
	
		WHILE (@ItemIdx <= @ItemCount)
		BEGIN
			SELECT @ItemID = ItemID, @ItemCategory = Category, @ItemColor = Color FROM @CategoryItems WHERE Idx = @ItemIdx;
	
			SET @ColorR = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ItemColor, 1, 2), 2));
			SET @ColorG = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ItemColor, 3, 2), 2));
			SET @ColorB = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(@ItemColor, 5, 2), 2));
			SET @ColorH = dbo.GetColorHue(@ColorR, @ColorG, @ColorB);
			SET @ColorS = dbo.GetColorSaturation(@ColorR, @ColorG, @ColorB) * 100;
			SET @ColorV = dbo.GetColorValue(@ColorR, @ColorG, @ColorB) * 100;
	
			IF (@ThemeFilterCount = 0)
			BEGIN
				INSERT INTO @ColorMatches
				SELECT @ItemID, @Category, @ItemColor, PaletteID, ColorHex, Likes, dbo.GetColorDistance(@ColorH, @ColorS, @ColorV, H, S, V)
				FROM [dbo].[Color_Palettes] WITH (NOLOCK)
				WHERE dbo.GetColorDistance(@ColorH, @ColorS, @ColorV, H, S, V) < @ColorDistanceLimit;
			END
			ELSE
			BEGIN
				INSERT INTO @ColorMatches
				SELECT @ItemID, @Category, @ItemColor, PaletteID, ColorHex, Likes, dbo.GetColorDistance(@ColorH, @ColorS, @ColorV, H, S, V)
				FROM [dbo].[Color_Palettes] palettes WITH (NOLOCK)
				JOIN @Filters fil ON fil.Class = 'Theme' AND fil.Tag = palettes.Category
				WHERE dbo.GetColorDistance(@ColorH, @ColorS, @ColorV, H, S, V) < @ColorDistanceLimit;
			END
	
			SET @ItemIdx += 1;
		END
	
		SET @CategoryIdx += 1;
	END
	
	-- Insert all items matchings with color palettes within color distance limit
	INSERT INTO @ColorPalettes
	SELECT PaletteID, 0, COUNT(*) AS MatchCount, SUM(ColorDistance) AS TotalColorDistance, 0, 0, 0, 0, 0, 0
	FROM @ColorMatches
	GROUP BY PaletteID;
	
	-- Set category count
	UPDATE palettes
	SET palettes.CategoryCount = b.CategoryCount
	FROM
	(
		SELECT a.PaletteID, COUNT(a.Category) AS CategoryCount
		FROM
		(
			SELECT DISTINCT PaletteID, Category
			FROM @ColorMatches
		) a
		GROUP BY a.PaletteID
	) b
	JOIN @ColorPalettes palettes ON palettes.PaletteID = b.PaletteID;
	
	-- Set best color distance and color score
	UPDATE palettes
	SET palettes.BestColorDistance = b.BestColorDistance, palettes.ColorMatchScore = ((palettes.CategoryCount * @ColorDistanceLimit) - b.BestColorDistance) / (palettes.CategoryCount * @ColorDistanceLimit)
	FROM
	(
		SELECT a.PaletteID, SUM(a.ColorDistance) AS BestColorDistance
		FROM
		(
			SELECT *, ROW_NUMBER() OVER(PARTITION BY PaletteID, Category ORDER BY ColorDistance) AS PickNo
			FROM @ColorMatches
		) a
		WHERE a.PickNo = 1
		GROUP BY a.PaletteID
	) b
	JOIN @ColorPalettes palettes ON palettes.PaletteID = b.PaletteID;
	
	-- Set top style match count
	UPDATE palettes
	SET palettes.TopStyleMatchCount = b.TopStyleMatchCount
	FROM
	(
		SELECT a.*, ROW_NUMBER() OVER(PARTITION BY a.PaletteID ORDER BY a.TopStyleMatchCount DESC) AS PickNo
		FROM
		(
			SELECT matches.PaletteID, tags.Tag, COUNT(tags.Tag) AS TopStyleMatchCount
			FROM @ColorMatches matches
			JOIN [dbo].[Item_Tags] itags WITH (NOLOCK) ON itags.ItemID = matches.ItemID
			JOIN [dbo].[Tags] tags WITH (NOLOCK) ON tags.TagID = itags.TagID AND tags.Class = 'Style'
			GROUP BY matches.PaletteID, tags.Tag
			HAVING COUNT(tags.Tag) > 1
		) a
	) b
	JOIN @ColorPalettes palettes ON palettes.PaletteID = b.PaletteID
	WHERE b.PickNo = 1
	
	-- Set best style matching categories count
	UPDATE palettes
	SET palettes.BestStyleMatchCount = d.StyleMatchingCategoryCount + 1, palettes.StyleMatchScore = (d.StyleMatchingCategoryCount + 1) / CAST(palettes.CategoryCount AS REAL)
	FROM
	(
		SELECT c.*, ROW_NUMBER() OVER(PARTITION BY c.PaletteID ORDER BY c.StyleMatchingCategoryCount DESC) AS PickNo
		FROM
		(
			SELECT b.PaletteID, b.Category, COUNT(b.MatchingCategory) AS StyleMatchingCategoryCount
			FROM
			(
				SELECT DISTINCT a.PaletteID, a.Category, matches.Category AS MatchingCategory
				FROM
				(
					SELECT DISTINCT matches.PaletteID, matches.Category, tags.Tag
					FROM @ColorMatches matches
					JOIN [dbo].[Item_Tags] itags WITH (NOLOCK) ON itags.ItemID = matches.ItemID
					JOIN [dbo].[Tags] tags WITH (NOLOCK) ON tags.TagID = itags.TagID AND tags.Class = 'Style'
				) a
				JOIN @ColorMatches matches ON matches.PaletteID = a.PaletteID AND matches.Category <> a.Category
				JOIN [dbo].[Item_Tags] itags WITH (NOLOCK) ON itags.ItemID = matches.ItemID
				JOIN [dbo].[Tags] tags WITH (NOLOCK) ON tags.TagID = itags.TagID AND tags.Class = 'Style' AND tags.Tag = a.Tag
			) b
			GROUP BY b.PaletteID, b.Category
		) c
	) d
	JOIN @ColorPalettes palettes ON palettes.PaletteID = d.PaletteID
	WHERE d.PickNo = 1;
	
	UPDATE @ColorPalettes SET TotalScore = ColorMatchScore + StyleMatchScore;
	
	INSERT INTO @OutputMatches
	SELECT TOP (@OutputMaxCount) *, 0
	FROM @ColorPalettes
	ORDER BY CategoryCount DESC, TotalScore DESC, NEWID();
	
	SET @OutputCount = @@ROWCOUNT;
	SET @OutputIdx = 1;
	
	WHILE (@OutputIdx <= @OutputCount)
	BEGIN
		SELECT @PaletteID = PaletteID FROM @OutputMatches WHERE Idx = @OutputIdx;
		IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
			CONTINUE;
	
		INSERT INTO [dbo].[Outfit_Suggestions] VALUES (@UserID, @PaletteID, GETDATE());
		IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
			CONTINUE;
	
		SET @SugID = SCOPE_IDENTITY();
	
		INSERT INTO [dbo].[Outfit_Suggestion_Items]
		SELECT @SugID, a.ItemID
		FROM
		(
			SELECT *, ROW_NUMBER() OVER(PARTITION BY Category ORDER BY ColorDistance) AS PickNo
			FROM @ColorMatches
			WHERE PaletteID = @PaletteID
		) a
		WHERE a.PickNo = 1;
	
		UPDATE @OutputMatches SET SugID = @SugID WHERE Idx = @OutputIdx;
		SET @OutputIdx += 1;
	END
	
	SELECT osi.*, [out].PaletteID
	FROM @OutputMatches [out]
	JOIN [dbo].[Outfit_Suggestion_Items] osi ON osi.SugID = [out].SugID
	ORDER BY [out].Idx;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[GenerateRandomCode]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GenerateRandomCode]
	@Code VARCHAR(50) OUTPUT,
	@MinLength INT,
	@MaxLength INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- DECLARE
	DECLARE @Length INT, @CharPool VARCHAR(100), @PoolLength INT, @LoopCount INT = 0;

	IF (@MinLength <> @MaxLength)
		SET @Length = RAND() * @MinLength + @MaxLength;
	ELSE
		SET @Length = @MinLength;
	
	-- define allowable character explicitly - easy to read this way an easy to 
	-- omit easily confused chars like l (ell) and 1 (one) or 0 (zero) and O (oh)
	SET @CharPool = '0123456789';
	SET @PoolLength = Len(@CharPool);
	
	SET @LoopCount = 0;
	SET @Code = '';
	
	WHILE (@LoopCount < @Length) BEGIN
	    SELECT @Code = @Code + 
	        SUBSTRING(@Charpool, CONVERT(INT, RAND() * @PoolLength) + 1, 1);

	    SELECT @LoopCount = @LoopCount + 1
	END
END
GO
/****** Object:  StoredProcedure [dbo].[GenerateUserForgetCode]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GenerateUserForgetCode]
	@Email VARCHAR(50)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- DECLARE
	DECLARE @ForgetCode VARCHAR(20);

	-- GENERATE RANDOM CODE
	-- SET @ForgetCode = CONVERT(VARCHAR(5), CRYPT_GEN_RANDOM(2), 2) + '-' + CONVERT(VARCHAR(5), CRYPT_GEN_RANDOM(2), 2) + '-' + CONVERT(VARCHAR(5), CRYPT_GEN_RANDOM(2), 2);
	EXECUTE [dbo].[GenerateRandomCode] @ForgetCode OUTPUT, 4, 4;

	UPDATE [dbo].[Users] SET ForgetCode = @ForgetCode WHERE Email = @Email;

	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 1;

	SELECT TOP 1 * FROM [dbo].[Users] WHERE Email = @Email;
	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[GenerateUserVerifyCode]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GenerateUserVerifyCode]
	@UserID INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- DECLARE
	DECLARE @VerifyCode VARCHAR(20);

	-- GENERATE RANDOM CODE
	-- SET @VerifyCode = CONVERT(VARCHAR(5), CRYPT_GEN_RANDOM(2), 2) + '-' + CONVERT(VARCHAR(5), CRYPT_GEN_RANDOM(2), 2) + '-' + CONVERT(VARCHAR(5), CRYPT_GEN_RANDOM(2), 2);
	EXECUTE [dbo].[GenerateRandomCode] @VerifyCode OUTPUT, 4, 4;

	UPDATE [dbo].[Users] SET VerifyCode = @VerifyCode WHERE UserID = @UserID;

	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 1;

	SELECT @VerifyCode AS VerifyCode;
	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[GetOutfitSuggestions]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GetOutfitSuggestions]
	@UserID INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT osi.*, sug.PaletteID
	FROM [dbo].[Outfit_Suggestions] sug
	JOIN [dbo].[Outfit_Suggestion_Items] osi ON osi.SugID = sug.SugID
	WHERE sug.UserID = @UserID
	ORDER BY sug.SugID;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[GetUserOutfits]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GetUserOutfits]
	@UserID INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT uoi.*, uout.Favorite, uout.PaletteID
	FROM [dbo].[User_Outfits] uout
	JOIN [dbo].[User_Outfit_Items] uoi ON uoi.OutfitID = uout.OutfitID
	WHERE uout.UserID = @UserID
	ORDER BY uout.OutfitID;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[GetWardrobeItems]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GetWardrobeItems]
	@UserID INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT witems.*
	FROM [dbo].[Wardrobes] wrb
	JOIN [dbo].[Wardrobe_Items] witems ON wrb.ItemID = witems.ItemID
	WHERE wrb.UserID = @UserID;

	SELECT itags.ItemID, tags.TagID, tags.[Class], tags.[Tag]
	FROM [dbo].[Wardrobes] wrb
	JOIN [dbo].[Item_Tags] itags ON itags.ItemID = wrb.ItemID
	JOIN [dbo].[Tags] tags ON itags.TagID = tags.TagID
	WHERE wrb.UserID = @UserID
	ORDER BY itags.ItemID, itags.TagID;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[OnForgetPassword]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[OnForgetPassword]
	@Email VARCHAR(50),
	@NewPassword VARCHAR(50),
	@ForgetCode VARCHAR(20)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- DECLARE
	DECLARE @UserID INT = 0, @CurForgetCode VARCHAR(20);

	SELECT TOP 1 @UserID = UserID, @CurForgetCode = ForgetCode FROM [dbo].[Users] WHERE Email = @Email;

	IF (@UserID = 0)
		RETURN 1;

	IF (@CurForgetCode IS NULL OR @ForgetCode <> @CurForgetCode)
		RETURN 2;

	UPDATE [dbo].[Users] SET [Password] = @NewPassword, ForgetCode = NULL WHERE UserID = @UserID;

	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 3;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[OnUserLogin]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[OnUserLogin]
	@Email VARCHAR(50),
	@Password VARCHAR(50)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT TOP 1 * FROM [dbo].[Users] WHERE Email = @Email AND [Password] = @Password;

	IF (@@ERROR <> 0 AND @@ROWCOUNT = 0)
		RETURN 1;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[OnUserPreferencesSave]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[OnUserPreferencesSave]
	@UserID INT,
	@Preferences TagList READONLY
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF NOT EXISTS(SELECT UserID FROM [dbo].[Users] WHERE UserID = @UserID)
		RETURN 1;

	-- Insert missing tags
	INSERT INTO [dbo].[Tags] (Class, Tag, InsertTime)
	SELECT DISTINCT prefs.Class, prefs.Tag, GETDATE()
	FROM @Preferences prefs
	LEFT JOIN [dbo].[Tags] tags ON tags.Tag = prefs.Tag
	WHERE tags.Tag IS NULL;

	-- Delete user previous tags
	DELETE upr
	FROM [dbo].[User_Preferences] upr
	JOIN [dbo].[Tags] tags ON tags.TagID = upr.TagID
	WHERE upr.UserID = @UserID;

	-- Insert user tags
	INSERT INTO [dbo].[User_Preferences]
	SELECT DISTINCT @UserID, tags.TagID
	FROM @Preferences prefs
	JOIN [dbo].[Tags] tags ON tags.Tag = prefs.Tag;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[OnUserRegister]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[OnUserRegister]
	@Email VARCHAR(50),
	@Password VARCHAR(50),
	@FirstName VARCHAR(50),
	@LastName VARCHAR(50),
	@Gender CHAR(1),
	@BirthDate SMALLDATETIME,
	@PhoneNum VARCHAR(14) NULL
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF (@BirthDate >= GETDATE())
		RETURN 1;

	IF EXISTS(SELECT TOP 1 UserID FROM [dbo].[Users] WHERE Email = @Email)
		RETURN 2;

	INSERT INTO [dbo].[Users] (FirstName, LastName, Email, [Password], Gender, Age, BirthDate, PhoneNum, Verified)
	VALUES (@FirstName, @LastName, @Email, @Password, @Gender, (DATEDIFF(DAY, @BirthDate, GETDATE()) / 365), @BirthDate, @PhoneNum, 0);

	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 3;

	SELECT TOP 1 * FROM [dbo].[Users] WHERE Email = @Email AND [Password] = @Password;

	IF (@@ERROR <> 0 AND @@ROWCOUNT = 0)
		RETURN 4;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[OnUserUpdate]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[OnUserUpdate]
	@UserID INT,
	@Password VARCHAR(50),
	@FirstName VARCHAR(50),
	@LastName VARCHAR(50),
	@Gender CHAR(1),
	@BirthDate SMALLDATETIME,
	@PhoneNum VARCHAR(14) NULL,
	@NewPassword VARCHAR(50) NULL
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF NOT EXISTS(SELECT TOP 1 UserID FROM [dbo].[Users] WHERE UserID = @UserID)
		RETURN 1;

	UPDATE [dbo].[Users]
	SET FirstName =  @FirstName,
		LastName =  @LastName,
		Gender = @Gender,
		Age = (DATEDIFF(DAY, @BirthDate, GETDATE()) / 365),
		BirthDate =  @BirthDate,
		PhoneNum =  @PhoneNum,
		[Password] = CASE WHEN @NewPassword IS NOT NULL AND LEN(@NewPassword) > 0 THEN @NewPassword ELSE [Password] END
	WHERE UserID = @UserID AND [Password] = @Password;

	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 2;

	SELECT TOP 1 * FROM [dbo].[Users] WHERE UserID = @UserID;

	IF (@@ERROR <> 0 AND @@ROWCOUNT = 0)
		RETURN 3;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[OnWardrobeItemDelete]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[OnWardrobeItemDelete]
	@UserID INT,
	@ItemID INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF NOT EXISTS(SELECT UserID FROM [dbo].[Users] WHERE UserID = @UserID)
		RETURN 1;

	IF NOT EXISTS(SELECT UserID FROM [dbo].[Wardrobes] WHERE UserID = @UserID AND ItemID = @ItemID)
		RETURN 2;

	DELETE [dbo].[Wardrobes] WHERE UserID = @UserID AND ItemID = @ItemID;
	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 3;

	UPDATE [dbo].[Wardrobe_Items] SET [Status] = 0 WHERE ItemID = @ItemID;

	/*DELETE [dbo].[Wardrobe_Items] WHERE ItemID = @ItemID;
	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 3;*/
	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[OnWardrobeItemModify]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[OnWardrobeItemModify]
	@UserID INT,
	@ItemID INT,
	@ItemName VARCHAR(50),
	@BrandName VARCHAR(50),
	@Tags TagList READONLY
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF NOT EXISTS(SELECT UserID FROM [dbo].[Users] WHERE UserID = @UserID)
		RETURN 1;

	IF NOT EXISTS(SELECT UserID FROM [dbo].[Wardrobes] WHERE UserID = @UserID AND ItemID = @ItemID)
		RETURN 2;

	UPDATE [dbo].[Wardrobe_Items]
	SET ItemName = CASE WHEN @ItemName IS NOT NULL THEN @ItemName ELSE ItemName END,
		BrandName = CASE WHEN @BrandName IS NOT NULL THEN @BrandName ELSE BrandName END
	WHERE ItemID = @ItemID;

	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 3;

	-- If empty, skip and return success
	IF NOT EXISTS(SELECT TOP 1 * FROM @Tags)
		GOTO OnEnd;

	-- Insert missing tags
	INSERT INTO [dbo].[Tags] (Class, Tag, InsertTime)
	SELECT DISTINCT newtags.Class, newtags.Tag, GETDATE()
	FROM @Tags newtags
	LEFT JOIN [dbo].[Tags] tags ON tags.Tag = newtags.Tag
	WHERE tags.Tag IS NULL;

	-- Delete user previous tags
	DELETE itg
	FROM [dbo].[Item_Tags] itg
	JOIN [dbo].[Tags] tags ON tags.TagID = itg.TagID
	WHERE itg.ItemID = @ItemID;

	-- Insert user tags
	INSERT INTO [dbo].[Item_Tags]
	SELECT DISTINCT @ItemID, tags.TagID
	FROM @Tags newtags
	JOIN [dbo].[Tags] tags ON tags.Tag = newtags.Tag;

OnEnd:
	SELECT * FROM [dbo].[Wardrobe_Items] WHERE ItemID = @ItemID;

	SELECT itags.ItemID, tags.TagID, tags.[Class], tags.[Tag]
	FROM [dbo].[Item_Tags] itags
	JOIN [dbo].[Tags] tags ON itags.TagID = tags.TagID
	WHERE itags.ItemID = @ItemID;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[OnWardrobeItemsAddon]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[OnWardrobeItemsAddon]
	@UserID INT,
	@Items WardrobeItemList READONLY
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF NOT EXISTS(SELECT UserID FROM [dbo].[Users] WHERE UserID = @UserID)
		RETURN 1;

	IF ((SELECT COUNT(*) FROM @Items) = 0)
		RETURN 2;

	BEGIN TRANSACTION;

		INSERT INTO [dbo].[Wardrobe_Items] (ItemName, BrandName, ImagePath, [Status], InsertTime)
		SELECT ItemName, BrandName, ImagePath, [Status], GETDATE()
		FROM @Items;

		IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		BEGIN
			ROLLBACK TRANSACTION;
			RETURN 2;
		END

		INSERT INTO [dbo].[Wardrobes]
		SELECT @UserID, witems.ItemID
		FROM @Items items
		JOIN [dbo].[Wardrobe_Items] witems ON witems.ImagePath = items.ImagePath;

		IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		BEGIN
			ROLLBACK TRANSACTION;
			RETURN 2;
		END

	COMMIT TRANSACTION;

	SELECT witems.*
	FROM @Items items
	JOIN [dbo].[Wardrobe_Items] witems ON witems.ImagePath = items.ImagePath;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[OnWardrobePostSegmentation]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[OnWardrobePostSegmentation]
	@UserID INT,
	@Items WardrobeItemsToUpdate READONLY
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF NOT EXISTS(SELECT UserID FROM [dbo].[Users] WHERE UserID = @UserID)
		RETURN 1;

	IF ((SELECT COUNT(*) FROM @Items) = 0)
		RETURN 2;

	UPDATE witems SET witems.ImagePath = items.CleanPath, witems.Color = items.ColorHex, witems.[Status] = 1
	FROM @Items items
	JOIN [dbo].[Wardrobe_Items] witems ON witems.ImagePath = items.ImagePath;

	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 2;

	-- Set color tag
	INSERT INTO [dbo].[Tags] (Class, Tag, InsertTime)
	SELECT DISTINCT 'Color', items.ColorName, GETDATE()
	FROM @Items items
	JOIN [dbo].[Wardrobe_Items] witems ON witems.ImagePath = items.CleanPath
	LEFT JOIN [dbo].[Tags] tags ON tags.Class = 'Color' AND tags.Tag = items.ColorName
	WHERE tags.TagID IS NULL;

	INSERT INTO [dbo].[Item_Tags] (ItemID, TagID)
	SELECT DISTINCT witems.ItemID, tags.TagID
	FROM @Items items
	JOIN [dbo].[Wardrobe_Items] witems ON witems.ImagePath = items.CleanPath
	LEFT JOIN [dbo].[Tags] tags ON tags.Class = 'Color' AND tags.Tag = items.ColorName
	LEFT JOIN [dbo].[Item_Tags] itags ON itags.ItemID = witems.ItemID AND itags.TagID = tags.TagID
	WHERE itags.TagID IS NULL;

	SELECT witems.*
	FROM @Items items
	JOIN [dbo].[Wardrobe_Items] witems ON witems.ImagePath = items.CleanPath;

	SELECT itags.ItemID, tags.TagID, tags.[Class], tags.[Tag]
	FROM @Items items
	JOIN [dbo].[Wardrobe_Items] witems ON witems.ImagePath = items.CleanPath
	JOIN [dbo].[Item_Tags] itags ON itags.ItemID = witems.ItemID
	JOIN [dbo].[Tags] tags ON tags.TagID = itags.TagID
	ORDER BY itags.ItemID, itags.TagID;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[SaveOutfitSuggestion]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SaveOutfitSuggestion]
	@UserID INT,
	@SugID INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- DECLARE
	DECLARE @OutfitID INT = 0;

	IF NOT EXISTS(SELECT TOP 1 UserID FROM [dbo].[Users] WHERE UserID = @UserID)
		RETURN 1;

	IF NOT EXISTS(SELECT TOP 1 UserID FROM [dbo].[Outfit_Suggestions] WHERE UserID = @UserID AND SugID = @SugID)
		RETURN 2;

	IF NOT EXISTS(SELECT TOP 1 ItemID FROM [dbo].[Outfit_Suggestion_Items] WHERE SugID = @SugID)
		RETURN 3;

	BEGIN TRANSACTION;

		INSERT INTO [dbo].[User_Outfits] (UserID, PaletteID, SaveTime)
		SELECT @UserID, PaletteID, GETDATE()
		FROM [dbo].[Outfit_Suggestions]
		WHERE UserID = @UserID AND SugID = @SugID;

		IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		BEGIN
			ROLLBACK TRANSACTION;
			RETURN 4;
		END

		SET @OutfitID = SCOPE_IDENTITY();

		IF (@OutfitID = 0)
		BEGIN
			ROLLBACK TRANSACTION;
			RETURN 4;
		END

		INSERT INTO [dbo].[User_Outfit_Items] (OutfitID, ItemID)
		SELECT @OutfitID, ItemID
		FROM [dbo].[Outfit_Suggestion_Items]
		WHERE SugID = @SugID;

		IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		BEGIN
			ROLLBACK TRANSACTION;
			RETURN 4;
		END

	COMMIT TRANSACTION;

	SELECT uoi.*, uout.Favorite, uout.PaletteID
	FROM [dbo].[User_Outfits] uout
	JOIN [dbo].[User_Outfit_Items] uoi ON uoi.OutfitID = uout.OutfitID
	WHERE uout.UserID = @UserID AND uout.OutfitID = @OutfitID
	ORDER BY uout.OutfitID;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[SetColorPaletteRGB]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SetColorPaletteRGB]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	UPDATE [dbo].[Color_Palettes]
	SET R = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(ColorHex, 1, 2), 2))
		,G = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(ColorHex, 3, 2), 2))
		,B = CONVERT(INT, CONVERT(VARBINARY, SUBSTRING(ColorHex, 5, 2), 2));
END
GO
/****** Object:  StoredProcedure [dbo].[SetUserVerifyStatus]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SetUserVerifyStatus]
	@UserID INT,
	@Verified BIT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	UPDATE [dbo].[Users] SET Verified = @Verified WHERE UserID = @UserID;

	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 1;

	RETURN 0;
END
GO
/****** Object:  StoredProcedure [dbo].[ToggleOutfitFavorite]    Script Date: 6/8/2025 9:33:34 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ToggleOutfitFavorite]
	@UserID INT,
	@OutfitID INT,
	@Favorite BIT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF NOT EXISTS(SELECT TOP 1 UserID FROM [dbo].[Users] WHERE UserID = @UserID)
		RETURN 1;

	UPDATE [dbo].[User_Outfits] SET Favorite = @Favorite WHERE UserID = @UserID AND OutfitID = @OutfitID;
	IF (@@ERROR <> 0 OR @@ROWCOUNT = 0)
		RETURN 2;

	RETURN 0;
END
GO
USE [master]
GO
ALTER DATABASE [FitCheck] SET  READ_WRITE 
GO

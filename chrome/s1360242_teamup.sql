-- phpMyAdmin SQL Dump
-- version 4.0.10.7
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 03-06-2015 a las 13:41:57
-- Versión del servidor: 5.5.38-35.2
-- Versión de PHP: 5.4.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de datos: `s1360242_teamup`
--
CREATE DATABASE IF NOT EXISTS `s1360242_teamup` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `s1360242_teamup`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `locations`
--

DROP TABLE IF EXISTS `locations`;
CREATE TABLE IF NOT EXISTS `locations` (
  `id_location` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id_location`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Volcado de datos para la tabla `locations`
--

INSERT INTO `locations` (`id_location`, `name`) VALUES
(1, 'Globant - Mar del Plata'),
(2, 'Globant - Tandil'),
(4, 'Globant - North Park');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recruitings`
--

DROP TABLE IF EXISTS `recruitings`;
CREATE TABLE IF NOT EXISTS `recruitings` (
  `id_recruiting` int(11) NOT NULL,
  `description` varchar(450) NOT NULL,
  `location` varchar(450) NOT NULL,
  `maxPlayers` int(2) NOT NULL,
  `players` varchar(450) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_recruiting`),
  UNIQUE KEY `id_recruiting` (`id_recruiting`),
  KEY `id_recruiting_2` (`id_recruiting`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `recruitings`
--

INSERT INTO `recruitings` (`id_recruiting`, `description`, `location`, `maxPlayers`, `players`, `date`) VALUES
(354865, 'Ping Pong dobles', 'Globant - Mar del Plata', 4, 'Munz,Wally,Palmieri', '2015-06-02 15:24:00'),
(458769, 'PS4 Fifa', 'Globant - Mar del Plata', 2, 'Fede', '2015-06-02 13:11:00'),
(544237, 'FutbolÃ­n', 'Globant - Mar del Plata', 4, 'Rafa,Joaquin', '2015-06-02 08:48:00');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

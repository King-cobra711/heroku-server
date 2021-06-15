-- phpMyAdmin SQL Dump
-- version 4.9.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Mar 30, 2021 at 08:11 AM
-- Server version: 5.7.26
-- PHP Version: 7.4.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Beer_Buddies`
--

-- --------------------------------------------------------

--
-- Table structure for table `Friends`
--

CREATE TABLE `Friends` (
  `F_ID` int(10) NOT NULL,
  `User_ID` int(10) NOT NULL,
  `Friend_User_ID` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Game`
--

CREATE TABLE `Game` (
  `G_ID` int(10) NOT NULL,
  `Game_Difficulty` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Game`
--

INSERT INTO `Game` (`G_ID`, `Game_Difficulty`) VALUES
(1, 'Easy'),
(2, 'Medium'),
(3, 'Hard');

-- --------------------------------------------------------

--
-- Table structure for table `Leaderboards`
--

CREATE TABLE `Leaderboards` (
  `Leaderboard_ID` int(10) NOT NULL,
  `User_ID` int(10) NOT NULL,
  `Game_ID` int(10) NOT NULL,
  `Best_Score` int(10) DEFAULT NULL,
  `Score_Date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Leaderboards`
--

INSERT INTO `Leaderboards` (`Leaderboard_ID`, `User_ID`, `Game_ID`, `Best_Score`, `Score_Date`) VALUES
(4, 1, 1, 2, '2021-03-11'),
(5, 1, 2, 10, '2021-03-11'),
(6, 1, 3, 15, '2021-03-11'),
(7, 9, 1, 5, '2021-03-11'),
(8, 10, 1, 6, '2021-03-11'),
(9, 11, 1, 7, '2021-03-11'),
(10, 12, 1, 8, '2021-03-11'),
(11, 13, 1, 9, '2021-03-11'),
(12, 14, 1, 10, '2021-03-11'),
(13, 15, 1, 11, '2021-03-11'),
(14, 16, 1, 12, '2021-03-11'),
(15, 17, 1, 13, '2021-03-11'),
(16, 9, 2, 11, '2021-03-11'),
(17, 10, 2, 12, '2021-03-11'),
(18, 11, 2, 13, '2021-03-11'),
(19, 12, 2, 14, '2021-03-11'),
(20, 13, 2, 15, '2021-03-11'),
(21, 14, 2, 16, '2021-03-11'),
(22, 15, 2, 17, '2021-03-11'),
(23, 16, 2, 18, '2021-03-11'),
(24, 17, 2, 19, '2021-03-11'),
(25, 9, 3, 16, '2021-03-11'),
(26, 10, 3, 17, '2021-03-11'),
(27, 11, 3, 18, '2021-03-11'),
(28, 12, 3, 19, '2021-03-11'),
(29, 13, 3, 20, '2021-03-11'),
(30, 14, 3, 21, '2021-03-11'),
(31, 15, 3, 22, '2021-03-11'),
(32, 16, 3, 23, '2021-03-11'),
(33, 17, 3, 24, '2021-03-11'),
(37, 43, 1, 0, '2021-03-25'),
(38, 43, 2, 1, '2021-03-25'),
(39, 43, 3, 2, '2021-03-25'),
(139, 88, 1, 2, '2021-03-27'),
(140, 88, 2, 12, '2021-03-29'),
(141, 88, 3, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `User_ID` int(10) NOT NULL,
  `UserType_ID` int(10) NOT NULL DEFAULT '2',
  `User_Name` varchar(15) NOT NULL,
  `User_Password` varchar(255) NOT NULL,
  `User_Email` varchar(50) NOT NULL,
  `User_Date_Joined` date NOT NULL,
  `User_Bio` varchar(100) NOT NULL DEFAULT 'I love beer',
  `User_Picture` varchar(255) NOT NULL DEFAULT 'Back',
  `User_Theme` varchar(10) NOT NULL DEFAULT 'blue',
  `User_Blacklist_Status` tinyint(1) NOT NULL DEFAULT '0',
  `User_Level` int(10) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`User_ID`, `UserType_ID`, `User_Name`, `User_Password`, `User_Email`, `User_Date_Joined`, `User_Bio`, `User_Picture`, `User_Theme`, `User_Blacklist_Status`, `User_Level`) VALUES
(1, 1, 'Cobra711', 'admin', 'user@user.com', '2021-03-09', 'I love beer', 'BB Logo', 'blue', 0, 1),
(9, 2, 'testyboy', 'aaaaaa', 'learntocode@gmail.com', '2021-03-11', 'I love beer', 'BB Logo', 'blue', 0, 1),
(10, 2, 'beerguy', 'aaaaaa', 'example@example.com', '2021-03-11', 'I love beer', 'BB Logo', 'blue', 0, 1),
(11, 2, 'beergirl', 'aaaaaa', 'example@example.com', '2021-03-11', 'I love beer', 'BB Logo', 'blue', 0, 1),
(12, 2, 'usernamebeer', 'aaaaaa', 'example@example.com', '2021-03-11', 'I love beer', 'BB Logo', 'blue', 0, 1),
(13, 2, 'pint', 'aaaaaa', 'example@example.com', '2021-03-11', 'I love beer', 'BB Logo', 'blue', 0, 1),
(14, 2, 'pint', 'aaaaaa', 'example@example.com', '2021-03-11', 'I love beer', 'BB Logo', 'blue', 0, 1),
(15, 2, 'poopy', 'aaaaaa', 'example@example.com', '2021-03-11', 'I love beer', 'BB Logo', 'blue', 0, 1),
(16, 2, 'bumbum', 'ssssss', 'learntocode711@gmail.com', '2021-03-11', 'I love beer', 'BB Logo', 'blue', 0, 1),
(17, 2, 'seven11', 'ssssss', 'learntocode711@gmail.com', '2021-03-11', 'I love beer', 'BB Logo', 'blue', 0, 1),
(43, 1, 'KingCob', '$2b$10$2/Fgv7s17QW9uQO/u65N..cgZr6r8lWckDLmVBS4uvVYWFJesDtZe', 'learntocode@gail.com', '2021-03-19', 'I love beer', 'Coors', 'yellow', 0, 3),
(88, 2, 'testuser', '$2b$10$YKPSCGMN5aXTUxM0glPAfO6YxoEjy941eB67ydcSQh/xFNJSN05o6', 'email@email.com', '2021-03-27', 'new bio', 'Back', 'yellow', 0, 2);

-- --------------------------------------------------------

--
-- Table structure for table `User_Type`
--

CREATE TABLE `User_Type` (
  `User_Type_ID` int(10) NOT NULL,
  `User_Type_Name` varchar(10) NOT NULL DEFAULT 'registered'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `User_Type`
--

INSERT INTO `User_Type` (`User_Type_ID`, `User_Type_Name`) VALUES
(1, 'Admin'),
(2, 'Registerd');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Friends`
--
ALTER TABLE `Friends`
  ADD PRIMARY KEY (`F_ID`),
  ADD KEY `friends_ibfk_1` (`User_ID`),
  ADD KEY `Friend_User_ID` (`Friend_User_ID`);

--
-- Indexes for table `Game`
--
ALTER TABLE `Game`
  ADD PRIMARY KEY (`G_ID`);

--
-- Indexes for table `Leaderboards`
--
ALTER TABLE `Leaderboards`
  ADD PRIMARY KEY (`Leaderboard_ID`),
  ADD KEY `User_ID` (`User_ID`),
  ADD KEY `Game_ID` (`Game_ID`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`User_ID`),
  ADD KEY `UserType_ID` (`UserType_ID`);

--
-- Indexes for table `User_Type`
--
ALTER TABLE `User_Type`
  ADD PRIMARY KEY (`User_Type_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Friends`
--
ALTER TABLE `Friends`
  MODIFY `F_ID` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Game`
--
ALTER TABLE `Game`
  MODIFY `G_ID` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Leaderboards`
--
ALTER TABLE `Leaderboards`
  MODIFY `Leaderboard_ID` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=142;

--
-- AUTO_INCREMENT for table `User`
--
ALTER TABLE `User`
  MODIFY `User_ID` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `User_Type`
--
ALTER TABLE `User_Type`
  MODIFY `User_Type_ID` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Friends`
--
ALTER TABLE `Friends`
  ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`Friend_User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Leaderboards`
--
ALTER TABLE `Leaderboards`
  ADD CONSTRAINT `leaderboards_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `leaderboards_ibfk_2` FOREIGN KEY (`Game_ID`) REFERENCES `Game` (`G_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `User`
--
ALTER TABLE `User`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`UserType_ID`) REFERENCES `User_Type` (`User_Type_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

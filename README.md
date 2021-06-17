# Beer Buddies

## Description

The project is the creation of the ‘Beer Buddies’ game. The game is essentially a card-flip memory game. The aim of the game is to complete the game in the shortest time. Players will be able to compete against each other for a place on the leader board. Leader board rankings are based on the shortest time a player has taken to play the game.

## Technologies

- [Visual Studio Code](https://code.visualstudio.com/)
- [MAMP](https://www.mamp.info/en/downloads/) or [MySQL](https://www.mysql.com/)
- [NodeJS (includes npm)](https://nodejs.org/en/)

## .ENV file setup for assessment purposes

- DB_HOST=localhost
- DB_USER=beerAdmin (Your User for MAMP/MySQL)
- DB_PASS=VzjCTh0terHVarXP (The password for the above user)
- DATABASE=Beer_Buddies (Name of database)
- DB_DOCK=8889
- SESSION_SECRET=LDpFx23F8!!dCnwi$w
- SESSION_TIMEOUT=3600000

These will be subject to change depending on what your MAMP/MySQL setup is. Make sure you double check these values.

## Launch

- Open the terminal and use the `cd` to navigate to your desktop or your preffered location to store this project.
- Once there use the command `mkdir Beer_Buddies` to create a new folder entitled Beer_Buddies.
- Now use the command `git clone https://github.com/King-cobra711/Beer_Buddies_Fullstack.git` to copy the project files from the github repository

### Database setup

You can use phpMyAdmin's UI to set up a new database and import the project sql file in the sql folder from the repository. **Make sure you have setup your user's privilages to the new database.**

Alternitavley you can use the terminal:

- copy and paste `/Applications/MAMP/Library/bin/mysql -uroot -p` into the terminal. If you want to use a different user other than the root user then change "-u**root**" to the preffered user.
- If done correctly then you will be prompted to input your password for your chosen user.
- If you want to creat a new user input `mysql> create user 'USER_NAME'@'localhost' identified by 'PASSWORD';`
- Make a new database to store the files `mysql> create database DATABASE_NAME;`
- Give new/existing User privilages to new database `mysql> grant all privileges on DATABASE_NAME.* TO 'USER_NAME'@'localhost';`
- Import sql file for project into new database `/applications/MAMP/library/bin/mysql -u User_Name -p Database_Name < /Users/Matt/Desktop/test\ lauch/beerbuds.sql`

**Alter code for .ENV**

There was no .ENV file uploaded to this repository however for assessment purposes information for this .ENV file can be found above. To ensure the project is configured to your data base:

- Go into the project files Beer Buddies > server > sql > db_functions.js
- Lines 6 - 10 should be updated to the approppriate information. Alternatively you can make your own .ENV file, just make sure it's stored in the root of the project.
- Go into Beer Buddies > server > index.js
- line 52 (session secret) can be updated to any password of your choice.

## Starting the App

- Make sure the MAMP servers are running.
- in the terminal navigate to the beer-buddies folder and then type `npm start`. Example:

1. `cd /Users/Matt/Desktop/Beer Buddies/beer-buddies`
2. `npm start`

- then navigate to the server folder and run `npm run devStart`. Example:

1. `cd /Users/Matt/Desktop/Beer Buddies/server`
2. `npm run devStart`

## Login

### Admin

Username: KingCob,
Password: Admin711

### Registered user

Username: testuser,
Password: aaaaaa

### Moving forward, the following functionality needs to be added:

- the ‘friends list’ needs to be added, with instant messaging
- blacklist functionality needs to be implemented
- Light and dark mode
- improve app performance
- update sidebar for leaderboards
- improve validation error messaging

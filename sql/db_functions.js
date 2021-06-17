require("dotenv").config({ path: "./.env" });
const bcrypt = require("bcrypt");
const saltRounds = 10;
const mysql = require("mysql");
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DATABASE,
  port: process.env.DB_DOCK,
  multipleStatements: true,
});

// Database oject installed above. This seperates the sql from other code to make it cleaner and easier to read. Functions that interact with the database are written here and then exported to be used in the index.js file in the server folder.

// POST

const checkRegistrationDetails = (req, status) => {
  const Email = req.body.Email;
  const Username = req.body.Username;

  const RegistrationDetails =
    "SELECT User_Name FROM User WHERE User_Name = ?;SELECT User_Email FROM User WHERE User_Email = ?;";

  db.query(RegistrationDetails, [Username, Email], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result[0].length > 0 && result[1].length > 0) {
      status(400);
      return;
    }
    if (result[0].length > 0) {
      status(406);
      return;
    }
    if (result[1].length > 0) {
      status(409);
      return;
    } else {
      status(200);
      return;
    }
  });
};
const registerUser = (req, res, cb) => {
  const Email = req.body.Email;
  const Username = req.body.Username;
  const Password = req.body.Password;

  const RegisterUser =
    "INSERT INTO User (User_Email, User_Name, User_Password, User_Date_Joined) VALUES (?, ?, ?, CURRENT_DATE);";

  const leaderBoardEasyRegister =
    "INSERT into Leaderboards (User_ID, Game_ID) VALUES (?, 1)";
  const leaderBoardMediumRegister =
    "INSERT into Leaderboards (User_ID, Game_ID) VALUES (?, 2)";
  const leaderBoardHardRegister =
    "INSERT into Leaderboards (User_ID, Game_ID) VALUES (?, 3)";

  const login =
    "SELECT User_ID, UserType_ID, User_Name, DATE_FORMAT(User_Date_Joined, '%d/%m/%Y') AS 'User_Date_Joined', User_Bio, User_Picture, User_Theme, User_Blacklist_Status, User_Level FROM User WHERE User_ID = ?";

  bcrypt.hash(Password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
      cb(400);
    }
    db.query(RegisterUser, [Email, Username, hash], (err, result) => {
      if (err) {
        console.log(err);
        cb(401);
      }
      if (result) {
        console.log(result);
        const lastID = result.insertId;

        db.query(login, [lastID], (err, response) => {
          if (err) {
            console.log(err);
          } else if (response) {
            console.log(response);
            cb(response);
          } else {
            console.log("error");
          }
        });
        db.query(leaderBoardEasyRegister, [lastID], (err, response) => {
          if (err) {
            console.log(err);
          } else if (response) {
            console.log(response);
          } else {
            console.log("error");
          }
        });
        db.query(leaderBoardMediumRegister, [lastID], (err, response) => {
          if (err) {
            console.log(err);
          } else if (response) {
            console.log(response);
          } else {
            console.log("error");
          }
        });
        db.query(leaderBoardHardRegister, [lastID], (err, response) => {
          if (err) {
            console.log(err);
          } else if (response) {
            console.log(response);
          } else {
            console.log("error");
          }
        });
      }
    });
  });
};

const Login = (req, logstat) => {
  const userName = req.body.Username;
  const password = req.body.Password;

  const checkDetails =
    "SELECT User_Name, User_Password FROM User WHERE User_Name = ?";

  const login =
    "SELECT User_ID, UserType_ID, User_Name, DATE_FORMAT(User_Date_Joined, '%d/%m/%Y') AS 'User_Date_Joined', User_Bio, User_Picture, User_Theme, User_Blacklist_Status, User_Level FROM User WHERE User_Name = ?";

  db.query(checkDetails, [userName], (err, result) => {
    console.log(err);
    console.log(result);
    if (err) {
      logstat(err);
    }
    if (result.length > 0) {
      bcrypt.compare(password, result[0].User_Password, (err, response) => {
        if (response) {
          db.query(login, [userName], (error, response) => {
            if (error) {
              console.log(error);
            }
            if (response) {
              logstat(response);
            }
          });
        } else {
          logstat(406);
        }
      });
    } else {
      logstat(404);
    }
  });
};

const newEasyScore = (req, newScore) => {
  const score = req.body.score;
  const id = req.body.id;

  const check =
    "SELECT Best_Score FROM Leaderboards WHERE Game_ID = 1 AND User_ID = ?";

  const insert =
    "UPDATE Leaderboards SET Best_Score = ?, Score_Date = CURRENT_DATE WHERE (User_ID = ? AND Game_ID = 1)";

  const levelCheck = "SELECT User_Level FROM User WHERE User_ID = ?";

  const updateLevel = "UPDATE User SET User_Level = 2 WHERE User_ID = ?;";

  db.query(check, [id], (err, res) => {
    if (err) {
      console.log(err);
    }
    if (res[0].Best_Score > score || res[0].Best_Score == null) {
      db.query(insert, [score, id], (error, response) => {
        if (error) {
          console.log(error);
        }
        if (response) {
          if (score <= 8) {
            db.query(levelCheck, [id], (err, res) => {
              if (err) {
                console.log(err);
              }
              if (res[0].User_Level === 1) {
                db.query(updateLevel, [id], (error, response) => {
                  if (error) {
                    console.log(error);
                  }
                  if (response) {
                    console.log(response);
                    newScore(201);
                  }
                });
              } else {
                newScore(200);
              }
            });
          } else {
            newScore(200);
          }
        }
      });
    } else if (res[0].Best_Score <= score) {
      newScore(400);
    } else {
      console.log("ERROR");
    }
  });
};

const newMediumScore = (req, newScore) => {
  const score = req.body.score;
  const id = req.body.id;
  console.log(score);

  const check =
    "SELECT Best_Score FROM Leaderboards WHERE Game_ID = 2 AND User_ID = ?";

  const insert =
    "UPDATE Leaderboards SET Best_Score = ?, Score_Date = CURRENT_DATE WHERE (User_ID = ? AND Game_ID = 2)";

  const levelCheck = "SELECT User_Level FROM User WHERE User_ID = ?";

  const updateLevel = "UPDATE User SET User_Level = 3 WHERE User_ID = ?;";

  db.query(check, [id], (err, res) => {
    if (err) {
      console.log(err);
    }
    if (res[0].Best_Score > score || res[0].Best_Score == null) {
      db.query(insert, [score, id], (error, res) => {
        if (error) {
          console.log(error);
        }
        if (res) {
          if (score <= 10) {
            db.query(levelCheck, [id], (err, response) => {
              if (err) {
                console.log(err);
              }
              if (response[0].User_Level === 2) {
                db.query(updateLevel, [id], (error, reply) => {
                  if (error) {
                    console.log(error);
                  }
                  if (reply) {
                    console.log(response);
                    newScore(201);
                  }
                });
              }
            });
          } else {
            newScore(200);
          }
        }
      });
    } else if (res[0].Best_Score <= score) {
      newScore(400);
    } else {
      console.log("ERROR");
    }
  });
};

const newHardScore = (req, newScore) => {
  const score = req.body.score;
  const id = req.body.id;
  console.log(score);

  const check =
    "SELECT Best_Score FROM Leaderboards WHERE Game_ID = 3 AND User_ID = ?";

  const insert =
    "UPDATE Leaderboards SET Best_Score = ?, Score_Date = CURRENT_DATE WHERE (User_ID = ? AND Game_ID = 3)";

  db.query(check, [id], (err, res) => {
    if (err) {
      console.log(err);
    }
    if (res[0].Best_Score > score || res[0].Best_Score == null) {
      db.query(insert, [score, id], (error, response) => {
        if (error) {
          console.log(error);
        }
        if (response) {
          newScore(200);
        }
      });
    } else if (res[0].Best_Score <= score) {
      newScore(400);
    } else {
      console.log("ERROR");
    }
  });
};

const updateUserBio = (req, cb) => {
  const id = req.body.id;
  const bio = req.body.Biography;
  console.log(bio);
  console.log(id);
  console.log("id an bio above");

  const updateBio = "UPDATE User SET User_Bio = ? WHERE User_ID = ? ";

  db.query(updateBio, [bio, id], (err, res) => {
    if (err) {
      console.log(err);
    }
    if (res) {
      cb(bio);
    } else {
      cb(400);
    }
  });
};
const updateUserTheme = (req, cb) => {
  const id = req.body.id;
  const theme = req.body.theme;
  console.log(theme);

  const updateTheme = "UPDATE User SET User_Theme = ? WHERE User_ID = ? ";

  db.query(updateTheme, [theme, id], (err, res) => {
    if (err) {
      console.log(err);
    }
    if (res) {
      cb(theme);
    } else {
      cb(400);
    }
  });
};
const updateUserPic = (req, cb) => {
  const id = req.body.id;
  const Pic = req.body.Pic;
  console.log(Pic);

  const updatePic = "UPDATE User SET User_Picture = ? WHERE User_ID = ? ";

  db.query(updatePic, [Pic, id], (err, res) => {
    if (err) {
      console.log(err);
    }
    if (res) {
      cb(Pic);
    } else {
      cb(400);
    }
  });
};

// GET

const scores = (res) => {
  const allScores =
    "SELECT User.User_Name, Leaderboards.Best_Score from User JOIN Leaderboards ON User.User_ID = Leaderboards.User_ID WHERE Game_ID = 1 AND Leaderboards.Best_Score IS NOT NULL ORDER BY Leaderboards.Best_Score ASC;SELECT User.User_Name, Leaderboards.Best_Score from User JOIN Leaderboards ON User.User_ID = Leaderboards.User_ID WHERE Game_ID = 2 AND Leaderboards.Best_Score IS NOT NULL ORDER BY Leaderboards.Best_Score ASC;SELECT User.User_Name, Leaderboards.Best_Score from User JOIN Leaderboards ON User.User_ID = Leaderboards.User_ID WHERE Game_ID = 3 AND Leaderboards.Best_Score IS NOT NULL ORDER BY Leaderboards.Best_Score ASC;";

  db.query(allScores, [0, 1, 2], (err, result) => {
    console.log(err);
    console.log(result);
    res.send(result);
  });
};

const userScores = (req, scores) => {
  const Id = req.body.id;
  const userscores =
    "SELECT Best_Score, DATE_FORMAT(Score_Date, '%d/%m/%Y') AS 'Score_Date' FROM Leaderboards WHERE User_ID = ? ORDER BY Game_ID ASC;";
  db.query(userscores, [Id], (err, result) => {
    if (err) {
      console.log(err);
      scores(400);
    }
    if (result) {
      console.log(result);
      scores(result);
    }
  });
};

// Admin

const AdminUserSearch = (req, cb) => {
  const users =
    "SELECT User_ID, User_Name, User_Picture FROM User ORDER BY User_Name ASC;";
  db.query(users, (err, result) => {
    if (err) {
      console.log(err);
      cb(400);
    }
    if (result) {
      console.log(result);
      cb(result);
    }
  });
};
const SearchUser = (req, cb) => {
  const Name = req.body.name;
  console.log(Name);
  const user = "SELECT User_Name FROM User WHERE User_Name = ?";
  db.query(user, [Name], (err, result) => {
    console.log(result);
    if (err) {
      console.log(err);
      cb(400);
    }
    if (result.length > 0) {
      console.log("yes");
      cb(200);
    } else {
      console.log("no");
      cb(404);
    }
  });
};
const DeleteUser = (req, cb) => {
  const Name = req.body.name;
  console.log(Name);
  console.log("Name above");
  const user = "DELETE FROM User WHERE User_Name = ?";
  db.query(user, [Name], (err, result) => {
    console.log(result);
    if (err) {
      console.log(err);
      cb(400);
    }
    if (result) {
      console.log("yes");
      cb(200);
    } else {
      console.log("no");
      cb(404);
    }
  });
};
const UserTypes = (req, cb) => {
  const userTypes = "Select * From User_Type";
  db.query(userTypes, (err, result) => {
    if (err) {
      console.log(err);
      cb(400);
    }
    if (result) {
      console.log("yes" + result[0]);
      cb(result);
    } else {
      console.log("no");
      cb(404);
    }
  });
};
const AddUserTypes = (req, cb) => {
  const newType = req.body.ntype;
  console.log(newType + "<-- New type here");
  const sql = "INSERT INTO User_Type (User_Type_Name) VALUES (?);";
  db.query(sql, [newType], (err, result) => {
    if (err) {
      console.log(err);
      cb(400);
    }
    if (result) {
      console.log("yes" + result[0]);
      cb(200);
    } else {
      console.log("no");
      cb(404);
    }
  });
};

const DeleteUserType = (req, cb) => {
  const Name = req.body.deltype;
  console.log(Name);
  console.log("Name above");
  const user = "DELETE FROM User_Type WHERE User_Type_Name = ?";
  db.query(user, [Name], (err, result) => {
    if (err) {
      console.log(err);
      cb(400);
    }
    if (result.length > 0) {
      console.log("yes" + result);
      cb(200);
    } else {
      console.log("no");
      cb(404);
    }
  });
};
const AdminGetUser = (req, cb) => {
  const Name = req.body.username;
  console.log(Name + "<------Name");
  const user =
    "SELECT UserType_ID, User_Name, User_Email, User_Bio, User_Picture, User_Theme, User_Blacklist_Status, User_Level FROM User WHERE User_Name = ?;";
  db.query(user, [Name], (err, result) => {
    if (err) {
      console.log(err);
      cb(400);
    }
    if (result) {
      console.log("yes");
      cb(result);
    } else {
      console.log("no");
      cb(404);
    }
  });
};
const AdminUpdateUser = (req, cb) => {
  const Name = req.body.name;
  const Biography = req.body.biography;
  const Picture = req.body.picture;
  const Theme = req.body.theme;
  const Blacklist = req.body.blacklistStatus;
  const Level = req.body.userLevel;
  console.log(Biography + "<------Name");
  const updateUser =
    "UPDATE User SET User_Bio = ?, User_Picture = ?, User_Theme = ?, User_Blacklist_Status = ?, User_Level = ? WHERE User_Name = ? ;";
  db.query(
    updateUser,
    [Biography, Picture, Theme, Blacklist, Level, Name],
    (err, result) => {
      if (err) {
        console.log(err);
        cb(400);
      }
      if (result) {
        console.log("yes");
        cb(200);
      } else {
        console.log("no");
        cb(404);
      }
    }
  );
};

module.exports = {
  checkRegistrationDetails: checkRegistrationDetails,
  registerUser: registerUser,
  scores: scores,
  Login: Login,
  userScores: userScores,
  newEasyScore: newEasyScore,
  newMediumScore: newMediumScore,
  newHardScore: newHardScore,
  updateUserBio: updateUserBio,
  updateUserTheme: updateUserTheme,
  updateUserPic: updateUserPic,
  AdminUserSearch: AdminUserSearch,
  SearchUser: SearchUser,
  DeleteUser: DeleteUser,
  UserTypes: UserTypes,
  AddUserTypes: AddUserTypes,
  DeleteUserType: DeleteUserType,
  AdminGetUser: AdminGetUser,
  AdminUpdateUser: AdminUpdateUser,
};

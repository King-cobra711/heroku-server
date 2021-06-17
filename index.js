const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const Cors = require("cors");
const app = express();
const db = require("./sql/db_functions");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const MySQLStore = require("express-mysql-session")(session);

const { transports, createLogger, format } = require("winston");

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DATABASE,
  port: process.env.DB_DOCK,
  multipleStatements: true,
});

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: "./error.log",
      level: "error",
    }),
    new transports.File({
      filename: "./action.log",
      level: "info",
    }),
  ],
});

const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 100, // limit each IP to 10 requests per windowMs
  message: "Too many requests",
});
const accountLimiter = rateLimit({
  windowMs: 24 * 60 * 1000, // 24hours
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests",
});

app.use(
  Cors({
    origin: [
      "http://localhost:3000",
      "https://beer-buddies-game.herokuapp.com",
    ],
    credentials: true,
    allowedHeaders: ["Origin", "Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.enable("trust proxy", true);
app.use(
  session({
    key: "User",
    secret: process.env.SESSION_SECRET || "LDpFx23F8!!dCnwi$w",
    saveUninitialized: false,
    resave: false,
    proxy: true,
    store: sessionStore,
    cookie: {
      maxAge: 60000 * 60 * 48,
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(limiter);

// Validation code structure:
// Express validator;
// .isEmail checks for proper email structure.
// .trim removes white-space.
// .isLength has a min & max value that that the string must adhere to .
// .isAlphanumeric check for numbers or letters of the alphabet, with exeption of some other characters. Helps prevent script inserts.
// .isNumber checks for number characters only.
// .matches({options: [black, white]}) checks to see if the string of characters is equal to (matches) one of the values in the options array. In this case it would check if the string matches the word "black" or or the word "white". This is case sensitive.
// Express validator offers much more validations than this, this can be seen in the documentation - https://express-validator.github.io/docs/

app.post(
  "/checkRegisterDetails",
  body("Email").isEmail().trim(),
  body("Username").isLength({ min: 3, max: 10 }).isAlphanumeric().trim(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      db.checkRegistrationDetails(req, (status) => {
        console.log(status);
        if (status === 400) {
          res.status(409).send({
            email: "email already in use",
            user: "user already exists",
          });
        } else if (status === 406) {
          res.status(409).send({ user: "user already exists" });
        } else if (status === 409) {
          res.status(409).send({ email: "email already in use" });
        } else if (status === 200) {
          res.status(200).send();
        }
      });
    }
  }
);

app.post(
  "/register",
  body("Email").isEmail().trim(),
  body("Username").isLength({ min: 3, max: 10 }).isAlphanumeric().trim(),
  body("Password").isLength({ min: 6, max: 20 }).isAlphanumeric().trim(),
  accountLimiter,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      db.registerUser(req, res, (cb) => {
        if (cb === 400) {
          console.log("failed to hash password");
          res.status(400).send({ LoggedIn: false });
        } else if (cb === 401) {
          console.log("failed to register user");
        } else {
          // This is one of two place where a session is established and user information is attached to the session obect.
          req.session.user = cb[0];
          console.log(req.session.user);
          res.status(200).send({ LoggedIn: true });
        }
      });
    }
  }
);

app.post(
  "/login",
  body("Password").isLength({ min: 6, max: 20 }).trim(),
  body("Username").isLength({ min: 3, max: 15 }).trim(),
  accountLimiter,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      db.Login(req, (logstat) => {
        console.log(logstat);
        if (logstat === 406) {
          res
            .status(406)
            .send({ message: "Incorrect username and/or password" });
        } else if (logstat === 404) {
          res.status(404).send({ message: "User does not exist" });
        } else {
          // This is one of two place where a session is established and user information is attached to the session obect.
          req.session.user = logstat[0];
          res.status(200).send({ LoggedIn: true });
          if (req.session.user.UserType_ID === 1) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Logged In,  Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 2) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Registered, Action: Logged In, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Logged In, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          }
        }
      });
    }
  }
);

app.get("/login", accountLimiter, (req, res) => {
  if (req.session.user) {
    res.status(200).send({ loggedIn: true, User: req.session.user });
  } else {
    res.status(200).send({ loggedIn: false });
  }
});

// The below route checks if  session exists and the user object, with the user information, is attached to it. It will respond with a status 200 if it does and send loggedIn with a value of True and the user object to the front end. If a session has not been established it will respond with status 200 and send loggedIn value of false. In this case the frontend will redirect to the login page and deny access to certain routes of the app.

app.get("/user", accountLimiter, (req, res) => {
  if (req.session.user) {
    res.status(200).send({ loggedIn: true, User: req.session.user });
  } else {
    res.status(200).send({ loggedIn: false });
  }
});

app.get("/logout", accountLimiter, (req, res) => {
  console.log(req.session.user);
  if (req.session.user.UserType_ID === 1) {
    logger.info(
      `IP: ${req.ip}, Username: ${
        req.session.user.User_Name
      }, User Type: Anonymous, Action: Logged Out,  Cookie: ${JSON.stringify(
        req.session.cookie
      )}`
    );
  } else if (req.session.user.UserType_ID === 2) {
    logger.info(
      `IP: ${req.ip}, Username: ${
        req.session.user.User_Name
      }, User Type: Registered, Action: Logged Out, Cookie: ${JSON.stringify(
        req.session.cookie
      )}`
    );
  } else if (req.session.user.UserType_ID === 3) {
    logger.info(
      `IP: ${req.ip}, Username: ${
        req.session.user.User_Name
      }, User Type: Administrator, Action: Logged Out, Cookie: ${JSON.stringify(
        req.session.cookie
      )}`
    );
  }
  req.session.destroy();
  res.status(200).send({ Message: "logged out" });
});

app.get("/scores", accountLimiter, (req, res) => {
  db.scores(res);
});

app.post(
  "/userScores",
  body("id").isNumeric().trim(),
  accountLimiter,
  (req, res) => {
    db.userScores(req, (scores) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        if (scores === 400) {
          res.status(400).send({ error: "error" });
        } else {
          res.status(200).send({ UserScores: scores });
          logger.info(
            `IP: ${req.ip}, Username: ${
              req.session.user.User_Name
            }, User Type: ${
              req.session.user.UserType_ID
            }, Action: Retrieved User Scores (Easy, Medium, Hard), Cookie: ${JSON.stringify(
              req.session.cookie
            )}`
          );
          if (req.session.user.UserType_ID === 1) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Anonymous, Action: Retrieved User Scores (Easy, Medium, Hard), Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 2) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Registered, Action: Retrieved User Scores (Easy, Medium, Hard), Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 3) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Retrieved User Scores (Easy, Medium, Hard), Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          }
        }
      }
    });
  }
);
app.post(
  "/UpdateEasyScore",
  body("id").isNumeric().trim(),
  body("score").isNumeric().trim(),
  accountLimiter,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      db.newEasyScore(req, (newScore) => {
        if (newScore === 400) {
          res.status(200).send({ message: "Better luck next time" });
        } else if (newScore === 201) {
          req.session.user.User_Level = 2;
          res
            .status(200)
            .send({ message: "New Best Score! Next level unlocked!" });
          if (req.session.user.UserType_ID === 1) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Anonymous, Action: Updated Easy Score & Updated Level,  Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 2) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Registered, Action: Updated Easy Score & Updated Level, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 3) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Updated Easy Score & Updated Level, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          }
        } else if (newScore === 200) {
          res.status(200).send({ message: "New Best Score!" });
          if (req.session.user.UserType_ID === 1) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Anonymous, Action: Updated Easy Score,  Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 2) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Registered, Action: Updated Easy Score, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 3) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Updated Easy Score, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          }
        }
      });
    }
  }
);
app.post(
  "/UpdateMediumScore",
  body("id").isNumeric().trim(),
  body("score").isNumeric().trim(),
  accountLimiter,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      db.newMediumScore(req, (newScore) => {
        if (newScore === 400) {
          res.status(200).send({ message: "Better luck next time" });
        } else if (newScore === 201) {
          req.session.user.User_Level = 3;
          res
            .status(200)
            .send({ message: "New Best Score! Next level unlocked!" });
          if (req.session.user.UserType_ID === 1) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Anonymous, Action: Updated Medium Score & Updated Level,  Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 2) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Registered, Action: Updated Medium Score & Updated Level, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 3) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Updated Medium Score & Updated Level, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          }
        } else if (newScore === 200) {
          res.status(200).send({ message: "New Best Score!" });
          if (req.session.user.UserType_ID === 1) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Anonymous, Action: Updated Medium Score,  Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 2) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Registered, Action: Updated Medium Score, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 3) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Updated Medium Score, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          }
        }
      });
    }
  }
);
app.post(
  "/UpdateHardScore",
  body("id").isNumeric().trim(),
  body("score").isNumeric().trim(),
  accountLimiter,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      db.newHardScore(req, (newScore) => {
        if (newScore === 400) {
          res.status(200).send({ message: "Better luck next time" });
        } else {
          res.status(200).send({ message: "New Best Score!" });
          if (req.session.user.UserType_ID === 1) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Anonymous, Action: Updated Hard Score & Updated Level,  Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 2) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Registered, Action: Updated Hard Score & Updated Level, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 3) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Updated Hard Score & Updated Level, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          }
        }
      });
    }
  }
);

app.post(
  "/UpdateTheme",
  body("id").isNumeric(),
  body("theme").matches({
    options: [
      "blue",
      "red",
      "black",
      "white",
      "yellow",
      "green",
      "purble",
      "pink",
    ],
  }),
  accountLimiter,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      db.updateUserTheme(req, (cb) => {
        if (cb === 400) {
          res.status(200).send({ message: "Fail", code: 400 });
        } else {
          req.session.user.User_Theme = cb;
          res.status(200).send({ message: "success", code: 200 });
          if (req.session.user.UserType_ID === 1) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Anonymous, Action: Updated Theme, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 2) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Registered, Action: Updated Theme, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 3) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Updated Theme, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          }
        }
      });
    }
  }
);
app.post(
  "/UpdatePic",
  body("id").isNumeric(),
  body("Pic").matches({
    options: [
      "Coors",
      "Corona",
      "Heinekin",
      "Peroni",
      "StoneWood",
      "xxxxGold",
      "Back",
    ],
  }),
  accountLimiter,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      db.updateUserPic(req, (cb) => {
        if (cb === 400) {
          res.status(200).send({ message: "Fail", code: 400 });
        } else {
          req.session.user.User_Picture = cb;
          res.status(200).send({ message: "success", code: 200 });
          if (req.session.user.UserType_ID === 1) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Anonymous, Action: Updated Picture,  Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 2) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Registered, Action: Updated Picture, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 3) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Updated Picture, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          }
        }
      });
    }
  }
);
app.post(
  "/UpdateBiography",
  accountLimiter,
  body("id").isNumeric(),
  body("Biography").isLength({ max: 100 }),
  (req, res) => {
    db.updateUserBio(req, (cb) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        if (cb === 400) {
          res.status(200).send({ message: "Failed to update", code: 400 });
        } else {
          console.log(req.session.user);
          req.session.user.User_Bio = cb;
          res.status(200).send({ message: cb, code: 200 });
          if (req.session.user.UserType_ID === 1) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Anonymous, Action: Updated Biography,  Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 2) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Registered, Action: Updated Biography, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          } else if (req.session.user.UserType_ID === 3) {
            logger.info(
              `IP: ${req.ip}, Username: ${
                req.session.user.User_Name
              }, User Type: Administrator, Action: Updated Biography, Cookie: ${JSON.stringify(
                req.session.cookie
              )}`
            );
          }
        }
      }
    });
  }
);

app.get("/AdminUserSearch", accountLimiter, (req, res) => {
  db.AdminUserSearch(req, (cb) => {
    if (cb === 400) {
      res.sendStatus(400);
    } else {
      res.status(200).send({ users: cb });
    }
  });
});

app.post("/Admin/searchUser", accountLimiter, (req, res) => {
  db.SearchUser(req, (cb) => {
    if (cb === 404) {
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  });
});

app.post("/Admin/DeleteUser", accountLimiter, (req, res) => {
  db.DeleteUser(req, (cb) => {
    if (cb === 404) {
      res.status(400).send({ message: "could not delete" });
    } else {
      res.sendStatus(200);
    }
  });
});
app.get("/UserTypes", accountLimiter, (req, res) => {
  db.UserTypes(req, (cb) => {
    if (cb === 404) {
      res.status(400).send({ message: "error" });
    } else {
      res.status(200).send({ usertypes: cb });
    }
  });
});
app.post("/NewUserTypes", accountLimiter, (req, res) => {
  db.AddUserTypes(req, (cb) => {
    if (cb === 404) {
      res.status(400).send({ message: "error" });
    } else {
      res.status(200).send({ message: "user type added" });
    }
  });
});
app.post(
  "/deleteUserType",
  accountLimiter,
  body("deltype").isLength({ min: 3, max: 10 }).isAlphanumeric().trim(),
  (req, res) => {
    db.DeleteUserType(req, (cb) => {
      if (cb === 404) {
        res.status(400).send({ message: "error" });
      } else {
        res.status(200).send({ message: "user type added" });
      }
    });
  }
);
app.post(
  "/AdminUserSearchInfo",
  accountLimiter,
  body("username").isLength({ min: 3, max: 10 }).isAlphanumeric().trim(),
  (req, res) => {
    db.AdminGetUser(req, (cb) => {
      if (cb === 404) {
        res.status(400).send({ message: "error" });
      } else {
        res.status(200).send({ userInfo: cb });
      }
    });
  }
);
app.post(
  "/AdminUpdateUser",
  accountLimiter,
  body("username").isLength({ min: 3, max: 10 }).isAlphanumeric().trim(),
  body("biography").isLength({ max: 100 }).isAlphanumeric().trim(),
  body("picture").matches({
    options: [
      "Coors",
      "Corona",
      "Heinekin",
      "Peroni",
      "StoneWood",
      "xxxxGold",
      "Back",
    ],
  }),
  body("theme").matches({
    options: [
      "blue",
      "red",
      "black",
      "white",
      "yellow",
      "green",
      "purble",
      "pink",
    ],
  }),
  body("theme").matches({
    options: [
      "blue",
      "red",
      "black",
      "white",
      "yellow",
      "green",
      "purble",
      "pink",
    ],
  }),
  body("blacklistStatus")
    .isNumeric()
    .trim()
    .matches({ options: [0, 1] }),
  body("userLevel").isNumeric().trim(),
  (req, res) => {
    db.AdminUpdateUser(req, (cb) => {
      if (cb === 404) {
        return res.status(400).send({ message: "error" });
      } else {
        return res.status(200).send({ message: "User Updated" });
      }
    });
  }
);
app.get("/test", accountLimiter, (req, res) => {
  res.status(200).send({ message: "testy boy" });
});
app.get("/Whitelist", accountLimiter, (req, res) => {
  let whitelist = ["::1", "::ffff:127.0.0.1", process.env.IPADMIN];
  let address = req.ip;
  let check = whitelist.includes(address);
  if (req.session.user.UserType_ID === 1) {
    if (check === true) {
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
  }
});

module.exports = app;

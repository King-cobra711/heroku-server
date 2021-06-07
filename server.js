const app = require("./index.js");
const databasePort = process.env.PORT || 3001;

app.listen(databasePort, () => {
  console.log("App is running on port " + databasePort);
});

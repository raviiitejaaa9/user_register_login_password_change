const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");
console.log(dbPath);
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started at port 3000");
    });
  } catch (e) {
    console.log(`DB ERROR : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API_1 REGISTER

app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;

  const selectUserQuery = `
        SELECT *
        FROM user
        WHERE username = '${username}'`;

  const dbUser = await db.get(selectUserQuery);
  console.log(dbUser);
  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const hashPassword = await bcrypt.hash(password, 9);
      const userCreationQuery = `
                INSERT INTO user(
                    username,name,password,gender,location
                    )
                VALUES (
                    '${username}',
                    '${name}',
                    '${hashPassword}',
                    '${gender}',
                    '${location}'
                ) ;`;
      const userSignUp = await db.run(userCreationQuery);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//API_2 LOGIN

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  console.log(username);
});

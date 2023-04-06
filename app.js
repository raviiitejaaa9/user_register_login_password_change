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
  const userDetails = `
                SELECT * 
                FROM user
                WHERE username = '${username}';`;
  const userPresent = await db.get(userDetails);
  console.log(userPresent);
  if (userPresent === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const passwordVerification = await bcrypt.compare(
      password,
      userPresent.password
    );
    if (passwordVerification === false) {
      response.status(400);
      response.send("Invalid password");
    } else {
      response.send("Login success!");
    }
  }
});

//API_3 change-password
app.put("/change-password/", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  console.log(username);

  const dbQuery = `
            SELECT * 
            FROM user
            WHERE username = '${username}';`;

  const userPresent = await db.get(dbQuery);
  console.log(userPresent);

  const userPassword = await bcrypt.compare(oldPassword, userPresent.password);
  console.log(userPassword);
  if (userPassword === false) {
    response.status(400);
    response.send("Invalid current password");
  } else if (newPassword.length < 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const passwordChangeQuery = `
                UPDATE user
                SET 
                    password = '${encryptedPassword}'
                WHERE username = '${username}';`;
    const passwordChange = await db.run(passwordChangeQuery);
    response.send("Password updated");
  }
});

require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const connectDB = require("./db/db.js");
const authController = require("./controllers/auth");
// const { isSignedIn } = require("./middleware/isSignedIn");
const foodController = require("./controllers/foodController.js");

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.use("/users", authController);
app.use("/users/:userId/foods", foodController);

const connect = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  // await runQueries();
  //   await mongoose.disconnect();
  //   console.log("Disconnected from MongoDB");
  //   process.exit();
};

const PORT = process.env.PORT ? process.env.PORT : "3000";

app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.json("Welcome");
});

// app.get("/users/:userId", async (req, res) => {
//   // const id = 68525eed5c53bcd356c4ef0b
//   const id = req.params.userId; //* req.query
//   const userLogIn = await User.findById(id);
//   res.status(200).json(userLogIn);
// });

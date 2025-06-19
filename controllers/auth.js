const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/Users");
const Food = require("../models/Foods");

const saveUserInPayload = (user) => {
  return { currentUser: user };
};

router.post("/sign-up", async (req, res) => {
  try {
    const { body } = req;
    const { username } = body;
    // Check if the username is already taken
    const userInDatabase = await User.findOne({ username });
    if (userInDatabase) {
      return res.send("Username already taken.");
    }

    // Must hash the password before sending to the database
    body.password = bcrypt.hashSync(req.body.password, 10);

    // All ready to create the new user!
    const user = await User.create(body);

    res.json({
      user,
      message: "Sign-up successful. Please sign-in at the sign-in screen.",
    });
  } catch (error) {
    console.log(error);
    res.send("Sign-up failed. Please try again later.");
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    // First, get the user from the database
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (user === null) {
      return res.status(401).send("Sign-in failed. Please try again.");
    }

    // There is a user! Time to test their password with bcrypt
    if (bcrypt.compareSync(password, user.password)) {
      const payload = saveUserInPayload(user);
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      // There is a user AND they had the correct password. Time to make a JWT!
      // const claims = { username: payload.username };

      // const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
      //   expiresIn: "15m",
      //   jwtid: uuidv4(),
      // });

      // const refresh = jwt.sign(claims, process.env.REFRESH_SECRET, {
      //   expiresIn: "30d",
      //   jwtid: uuidv4(),
      // });
      // console.log(req.session);
      // console.log(req.user);
      const userId = user._id;
      res.json({ token, payload });
    }
  } catch (error) {
    console.log(error);
    res.status(401).redirect("/");
  }
});

const saveUser = (req, user) => {
  req.currentUser = user;
};

const loadUser = (req) => req.currentUser;

const loadUserFromPayload = (payload) => {
  return payload.currentUser;
};

const isLogged = (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    saveUser(req, loadUserFromPayload(payload));
    next();
  } catch (error) {
    res.status(401).json({ msg: "No Entry" });
  }
};

const checkUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = loadUser(req);
    if (currentUser._id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (user === null) {
      return res.status(404).json({ error: "Not found" });
    }
    next();
  } catch (error) {
    res.status(401).json({ msg: "No Entry" });
  }
};

router.get("/:userId", [isLogged, checkUser], async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  res.json({ user });
});

router.get("/:userId/foods", [isLogged, checkUser], async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    // const foods = await user.pantry.find({});
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post("/:userId/foods", [isLogged, checkUser], async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    // const { name } = req.body;
    const newFood = {
      name: "chicken rice",
    };

    if (user.pantry.findOne({ newFood })) {
      return res.status(409).json({ err: "You have added this food." });
    }

    const food = await Food.create(newFood);

    user.pantry.push(food);

    await user.save();
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;

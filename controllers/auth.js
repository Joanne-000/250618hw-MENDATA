const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/Users");

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

      res.json({ token });
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

router.get("/:userId", [isLogged], async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    const currentUser = loadUser(req);
    console.log(currentUser);
    if (currentUser._id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (user === null) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ user });
    next();
  } catch (error) {
    res.status(401).json({ msg: "No Entry" });
  }
});

module.exports = router;

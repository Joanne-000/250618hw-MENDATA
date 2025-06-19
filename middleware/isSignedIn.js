const express = require("express");
const router = express.Router();

const loadUserFromPayload = (payload) => {
  return payload.currentUser;
};

const saveUser = (req, user) => {
  req.currentUser = user;
};

const isSignedIn = (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    saveUser(req, loadUserFromPayload(payload));

    next();
  } catch (error) {
    return res.status(401).json({ error: "not authorised" });
  }
};

module.exports = { isSignedIn };

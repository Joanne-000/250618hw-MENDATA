// controllers/foods.js

const User = require("../models/Users.js");
const express = require("express");
const router = express.Router();
const { verifyUserId } = require("./auth");

// controller logic will go here - will be built later on in the lab
router.get("/", async (req, res) => {
  try {
    const foods = await User.pantry.find({});
    // const newFood = user.pantry.push(food);
    // await user.save();
    console.log("foods", foods);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// router.post("/foods", async (req, res) => {
//   try {
//     const { name } = req.body;

//     if (User.pantry.findOne({ name })) {
//       return res.status(409).json({ err: "You have added this food." });
//     }
//     // const user = await User.findById(user.id);
//     // console.log(user.id);
//     const food = { name: name };
//     // const newFood = user.pantry.push(food);
//     // await user.save();
//     console.log("modified", food);
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// });

module.exports = router;

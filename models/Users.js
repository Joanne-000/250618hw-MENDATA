const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: String,
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  pantry: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;

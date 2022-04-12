const mongoose = require("mongoose");

const { isEmail } = require("validator");
const bcrypt = require("brcypt")

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Can't be blank"]
  },
  email: {
    type : String,
    lowercase: true,
    unique: true,
    required: [true, "Can't be blank"],
    index: true,
    validate: [isEmail, "Invalid Email!"]
  },

  password: {
    type: String,
    required: [true, "Can't be blank"]
  },
  picture: {
    type: String,
  },
  newMessages: {
    type : Object,
    default: {}
  },
  status: {
    type: String,
    default: "online",
  }
}, {minimize: false})

const User = mongoose.model("User", UserSchema);

module.exports = User;
const router = require("express").Router();
const User = require("../models/User");

// signup user
router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password, picture } = req.body;
    const user = await User.create({ name, email, password, picture });
    res.status(201).json(user);
  } catch (error) {
    let message;
    if (error.code === 11000) {
      message = "User already exists.";
    } else {
      message = error.message;
    }
    console.log(error);
    res.status(400).json(message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    user.status = "online";
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
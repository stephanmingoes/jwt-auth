const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
require("dotenv").config();

const validateEmail = (email) => {
  return String(email).match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

const validateUsername = (username) => {
  return (
    String(username).match(/^[0-9a-zA-Z]+$/) && String(username).length >= 5
  );
};

const validatePassword = (password) => {
  return String(password).length >= 5;
};

// Signup User
const signup = async (req, res) => {
  const username = req.body.username.toLowerCase().trim();
  const email = req.body.email.toLowerCase().trim();
  const password = req.body.password;

  if (!validateEmail(email))
    return res.status(400).json({
      status: "user error",
      message: "Enter a valid email address",
    });

  if (!validateUsername(username))
    return res.status(400).json({
      status: "user error",
      message:
        "Username must only contain numbers or letters and the length must be 5 or more.",
    });

  if (!validatePassword(password))
    return res.status(400).json({
      status: "user error",
      message: "Password must contain more than 5 characters.",
    });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await User.create({
        username: username,
        email: email,
        password: hashedPassword,
      });

      res.status(201).send({
        status: "success",
        message: "User created sucessfully, please proceed to login.",
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          status: "user error",
          message: "Username or email already exist.",
        });
      } else {
        res.status(500).json({
          status: "error",
          message: "Oops, something went wrong. Try again later.",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "error",
      message: "Oops, something went wrong. Try again later",
    });
  }
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser)
      return res.status(401).json({
        status: "user error",
        message: "No account exist with this email address.",
      });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res
        .status(401)
        .json({ status: "user error", message: "Incorrect Password" });

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.ACCESS_TOKEN,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      status: "success",
      message: "User logged in successfully.",
      data: token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "error",
      message: "Oops, something went wrong. Try again later",
    });
  }
};
module.exports = { signup, login };

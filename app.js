require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 8000;

const Login = require("./models/login.model.js");
const FoodLocation = require("./models/foodlocation.model.js");

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to parse cookies
app.use(cookieParser());

// Middleware for CORS
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// POST route for user login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await Login.findOne({ username });

    // If user does not exist, send "Please sign up"
    if (!user) {
      return res.status(401).json({ message: "Please sign up" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If password is invalid, send "Invalid password or username"
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password or username" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    // Send the token as response
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST route for user sign up
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await Login.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new Login({ username, password: hashedPassword });
    await newUser.save();

    // Send success message
    res.json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST route for creating food location data
app.post("/foodlocation", async (req, res) => {
  const { type, quantity, location, status } = req.body;

  try {
    // Create a new food location
    const newFoodLocation = new FoodLocation({
      type,
      quantity,
      location,
      status,
    });
    await newFoodLocation.save();

    // Send success message
    res.json({ message: "Food location created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE route for deleting food location data
app.delete("/foodlocation/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the food location by id
    const foodLocation = await FoodLocation.findById(id);

    // If food location does not exist, send "Food location not found"
    if (!foodLocation) {
      return res.status(404).json({ message: "Food location not found" });
    }

    // If food location status is "unavailable", delete it from the database
    if (foodLocation.status === "unavailable") {
      await FoodLocation.findByIdAndDelete(id);
      return res.json({ message: "Food location deleted successfully" });
    }

    // If food location status is not "unavailable", send "Cannot delete food location with status other than 'unavailable'"
    res.status(400).json({
      message:
        "Cannot delete food location with status other than 'unavailable'",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
mongoose
  .connect(
    "mongodb+srv://MRishith:mFI4im5mmqRnIySf@backend.bdxavry.mongodb.net/fooddonation?retryWrites=true&w=majority&appName=backend"
  )
  .then(() => {
    console.log("DB Connected");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  });

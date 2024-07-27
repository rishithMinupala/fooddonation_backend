const mongoose = require("mongoose");

const foodLocationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "unavailable"],
    default: "available",
  },
});

const FoodLocation = mongoose.model("FoodLocation", foodLocationSchema);

module.exports = FoodLocation;

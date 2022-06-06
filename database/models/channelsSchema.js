const mongoose = require("mongoose");

const TargetSchema = new mongoose.Schema({
  id: String,
});

const channels = new mongoose.Schema(
  {
    id: String,
    targets: [TargetSchema],
  },
  { versionKey: false }
);

module.exports = new mongoose.model("channels", channels, "channels");

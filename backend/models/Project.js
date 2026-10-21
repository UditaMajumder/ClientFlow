const mongoose = require("mongoose");
const projectSchema = new mongoose.Schema({
    name: {
  type: String,
  required: true
},

client: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Client",
  required: true
},

status: {
  type: String,
  required: true
},

deadline: {
  type: Date,
  required: true
},

budget: {
  type: Number,
  required: true
},

currency: {
  type: String,
  default: "USD"
},

completedAt: {

  type: Date,

  default: null

},

userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}
});

module.exports = mongoose.model("Project", projectSchema);
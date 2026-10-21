const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },

    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
}
});

module.exports = mongoose.model("Client", clientSchema);
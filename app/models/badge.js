var mongoose = require('mongoose');

var BadgeSchema = new mongoose.Schema({
    name: String,
    description: String,
    requiredValue: Number,
    completionBadge: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('Badge', BadgeSchema);
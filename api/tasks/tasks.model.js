const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {type: String,required: true,trim: true},
    description: { type: String, trim: true},
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending',required: true,},
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project',required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});

module.exports = mongoose.model('Task', TaskSchema);
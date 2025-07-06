const mongoose = require('mongoose');

const EmpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    resumePdf: { 
        type: String, 
        default: '' 
    },
    skills: {
        type: [String],
        default: []
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    },
}, {
    timestamps: true,
    versionKey: false
})


const EmpModel = new mongoose.model('newDeveloper', EmpSchema);

module.exports = EmpModel;



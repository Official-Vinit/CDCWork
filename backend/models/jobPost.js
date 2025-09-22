const mongoose = require('mongoose');
const { Schema } = mongoose;

const applicantSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
        type: String, 
        enum: ['Applied', 'Eligible', 'Not Eligible', 'Round 1', 'Round 2', 'HR Round', 'Hired', 'Rejected'], 
        default: 'Applied' 
    },
    currentRound: { type: Number, default: 0 },
    attendedRounds: [{
        roundNumber: Number,
        attendedAt: Date
    }]
});

const jobPostSchema = new Schema({
companyName: { 
        type: String, 
        required: true 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    package: { type: String },
    role: { type: String },
    jobLocation: { type: String },
    applicationDeadline: { type: Date },
    isActive: { type: Boolean, default: true },
    
    // Eligibility Criteria
    eligibility: {
        passoutYear: { type: Number, required: true },
        minUgCgpa: { type: Number, default: 0 },
        maxHistoryOfArrears: { type: Number, default: 0 },
        maxCurrentArrears: { type: Number, default: 0 },
        allowedDepts: [{ type: String }] // Array of department names from your user schema
    },

    // Tracking students
    applicants: [applicantSchema],
    
    // Final selected students
    placedStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

const JobPost = mongoose.model('JobPost', jobPostSchema);
module.exports = JobPost;
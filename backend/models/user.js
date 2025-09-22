const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    collegeEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9.]+@kpriet\.ac\.in$/, 'Please use your official KPRIET email.']
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isProfileComplete: { type: Boolean, default: false },
    universityRegNumber: {
        type: String,
        unique: true,
       sparse: true,
        match: [/^\d{16}$/, 'University Reg Number must be exactly 16 digits.']
    },
    rollNo: { type: String,unique: true,
        sparse: true, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    nationality: { type: String, trim: true },
    panNumber: { type: String, trim: true, uppercase: true },
    aadharNumber: { type: String, trim: true },
    mobileNumber: { type: String },
    personalEmail: { type: String, unique: true, sparse: true, lowercase: true },
    dept: {
        type: String,
        enum: ['AIDS', 'BME', 'CHEM', 'CIVIL', 'CSE', 'AIML', 'Cyber Security', 'CSBS', 'ECE', 'EEE', 'IT', 'Mechanical', 'Mechatronics']
    },
    quota: { type: String, enum: ['Management Quota(MQ)', 'Government Quota(GQ)'] },
    passoutYear: { type: Number },
    historyOfArrears: { type: Number, default: 0 },
    currentArrears: { type: Number, default: 0 },
    ugCgpa: { type: Number },
    residence: { type: String, enum: ['Hostel', 'Day Scholar'] },
    education: {
        tenth: {
            percentage: { type: Number },
            board: { type: String, enum: ['State', 'CBSE', 'ICSC', 'NEB', 'others'] },
            passingYear: { type: Number }
        },
        twelth: {
            percentage: { type: Number },
            passingYear: { type: Number }
        },
        diploma: {
            percentage: { type: Number },
            passingYear: { type: Number }
        }
    },
    languages: {
        japanese: {
            knows: { type: Boolean, default: false },
            level: { type: String, enum: ['N5', 'N4', 'N3', 'N2', 'N1', 'Not Applicable'] }
        },
        german: {
            knows: { type: Boolean, default: false },
            level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Not Appeared', 'Not Applicable'] }
        },
    },
    address: {
        city: { type: String, trim: true },
        state: { type: String, trim: true }
    },
    photoUrl: { type: String },
    resumeUrl: { type: String },
    codingProfiles: {
        leetcode: { type: String, trim: true },
        codeforces: { type: String, trim: true },
        hackerrank: { type: String, trim: true },
        geeksforgeeks: { type: String, trim: true },
        github: { type: String, trim: true }
    }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (this.isModified('firstName') || this.isModified('middleName') || this.isModified('lastName')) {
        this.fullName = [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ');
    }
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
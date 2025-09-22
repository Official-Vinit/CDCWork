const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    website: { type: String },
    description: { type: String },
    logoUrl: { type: String }
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
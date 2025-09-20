const Job = require('../models/job.model');
const User = require('../models/user.js');

// @desc    Admin creates a new job posting
exports.createJob = async (req, res) => {
    try {
        const job = new Job({
            ...req.body,
            postedBy: req.user.id // req.user comes from 'protect' middleware
        });
        const savedJob = await job.save();
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getJobs = async (req, res) => {
    try {
        const open_jobs = await Job.find({
            status : 'OPEN'
        })
        const inProg_jobs = await Job.find({
          status: "IN_PROGRESS",
        });
        const closed_jobs = await Job.find({
          status: "CLOSED",
        });
        if (!jobs) {
            return res.status(404).json({ message: 'No active jobs found' });
        }
        
        res.status(200).json({
            open : open_jobs,
            in_progress : inProg_jobs,
            closed : closed_jobs
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
}

// @desc    Student gets a list of jobs they are eligible for
exports.getEligibleJobs = async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        const allJobs = await Job.find({ passoutYear: student.passoutYear }); // Basic filter by passout year

        const eligibleJobs = allJobs.filter(job => {
            const criteria = job.eligibility;
            // Add all your eligibility checks here
            if (student.ugCgpa < criteria.minCgpa) return false;
            if (student.currentArrears > criteria.maxArrears) return false;
            if (student.education.tenth.percentage < criteria.minTenthMarks) return false;
            if (criteria.allowedDepartments.length > 0 && !criteria.allowedDepartments.includes(student.dept)) {
                return false;
            }
            // If all checks pass, the job is eligible
            return true;
        });
        
        res.status(200).json(eligibleJobs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
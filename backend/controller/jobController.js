const JobPost = require('../models/jobPost');
const User = require('../models/user');
const { Parser } = require('json2csv');

exports.createJobPost = async (req, res) => {
    try {
        const {
            companyName,  // Change from company to companyName
            title,
            description,
            package,
            role,
            passoutYear,
            minUgCgpa,
            maxHistoryOfArrears,
            maxCurrentArrears,
            allowedDepts,
        } = req.body;

        // 1. Basic Validation
        if (!companyName || !title || !description || !passoutYear || !allowedDepts) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        // 2. No company validation needed

        // 3. Create job post with company name
        const newJobPost = new JobPost({
            companyName,  // Store as string
            title,
            description,
            package,
            role,
            eligibility: {
                passoutYear,
                minUgCgpa,
                maxHistoryOfArrears,
                maxCurrentArrears,
                allowedDepts,
            },
        });

        const savedJob = await newJobPost.save();
        res.status(201).json(savedJob);

    } catch (error) {
        console.error('Error creating job post:', error);
        res.status(500).json({ message: 'Server error while creating job post.', error: error.message });
    }
};
exports.updateJobPost = async (req, res) => {
    try {
        const { jobId } = req.params;
        const {
            companyName,
            title,
            description,
            package,
            role,
            passoutYear,
            minUgCgpa,
            maxHistoryOfArrears,
            maxCurrentArrears,
            allowedDepts,
        } = req.body;

        // Basic Validation
        if (!companyName || !title || !description || !passoutYear || !allowedDepts) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        const updatedJob = await JobPost.findByIdAndUpdate(
            jobId,
            {
                companyName,
                title,
                description,
                package,
                role,
                eligibility: {
                    passoutYear,
                    minUgCgpa,
                    maxHistoryOfArrears,
                    maxCurrentArrears,
                    allowedDepts,
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedJob) {
            return res.status(404).json({ message: 'Job post not found' });
        }

        res.status(200).json(updatedJob);

    } catch (error) {
        console.error('Error updating job post:', error);
        res.status(500).json({ message: 'Server error while updating job post.', error: error.message });
    }
};

// Add deleteJobPost function
exports.deleteJobPost = async (req, res) => {
    try {
        const { jobId } = req.params;

        const deletedJob = await JobPost.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({ message: 'Job post not found' });
        }

        res.status(200).json({ message: 'Job post deleted successfully' });

    } catch (error) {
        console.error('Error deleting job post:', error);
        res.status(500).json({ message: 'Server error while deleting job post.', error: error.message });
    }
};
exports.getAllJobPosts = async (req, res) => {
    try {
        // Remove .populate('company', 'name') since we don't have Company model
        const jobs = await JobPost.find({})
            .sort({ createdAt: -1 });

        if (!jobs) {
            return res.status(404).json({ message: 'No job posts found.' });
        }

        res.status(200).json(jobs);
        
    } catch (error) {
        console.error('Error fetching job posts:', error);
        res.status(500).json({ message: 'Server error while fetching job posts.' });
    }
};

exports.getEligibleStudents = async (req, res) => {
    try {
        const job = await JobPost.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job post not found' });
        }

        // Construct the eligibility query based on the job's criteria
        const eligibilityQuery = {
            role: 'user',
            passoutYear: job.eligibility.passoutYear,
        };

        if (job.eligibility.minUgCgpa && job.eligibility.minUgCgpa > 0) {
            eligibilityQuery.ugCgpa = { $gte: job.eligibility.minUgCgpa };
        }

        // Add arrears filters only if specified
        if (job.eligibility.maxHistoryOfArrears !== undefined && job.eligibility.maxHistoryOfArrears >= 0) {
            eligibilityQuery.historyOfArrears = { $lte: job.eligibility.maxHistoryOfArrears };
        }

        if (job.eligibility.maxCurrentArrears !== undefined && job.eligibility.maxCurrentArrears >= 0) {
            eligibilityQuery.currentArrears = { $lte: job.eligibility.maxCurrentArrears };
        }

        // Add department filter
        if (job.eligibility.allowedDepts && job.eligibility.allowedDepts.length > 0) {
            eligibilityQuery.dept = { $in: job.eligibility.allowedDepts };
        }

        console.log('Eligibility Query:', eligibilityQuery);
        
        const students = await User.find(eligibilityQuery)
            .select('fullName collegeEmail dept ugCgpa historyOfArrears currentArrears passoutYear')
            .lean();

        console.log('Found students:', students.length); // Add this back for debugging

        res.status(200).json({ count: students.length, students });

    } catch (error) {
        console.error('Error fetching eligible students:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.downloadEligibleStudentsCSV = async (req, res) => {
    try {
        const job = await JobPost.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job post not found' });
        }
        
        // Same eligibility query as getEligibleStudents
        const eligibilityQuery = {
            role: 'user',
           passoutYear: job.eligibility.passoutYear,
            
        };
        if (job.eligibility.minUgCgpa && job.eligibility.minUgCgpa > 0) {
            eligibilityQuery.ugCgpa = { $gte: job.eligibility.minUgCgpa };
        }

        // Add arrears filters only if specified
        if (job.eligibility.maxHistoryOfArrears !== undefined && job.eligibility.maxHistoryOfArrears >= 0) {
            eligibilityQuery.historyOfArrears = { $lte: job.eligibility.maxHistoryOfArrears };
        }

        if (job.eligibility.maxCurrentArrears !== undefined && job.eligibility.maxCurrentArrears >= 0) {
            eligibilityQuery.currentArrears = { $lte: job.eligibility.maxCurrentArrears };
        }

        // Add department filter
        if (job.eligibility.allowedDepts && job.eligibility.allowedDepts.length > 0) {
            eligibilityQuery.dept = { $in: job.eligibility.allowedDepts };
        }
        const students = await User.find(eligibilityQuery)
            .select('fullName universityRegNumber rollNo collegeEmail mobileNumber dept ugCgpa')
            .lean();

        if (students.length === 0) {
            return res.status(404).json({ message: 'No eligible students found to download.' });
        }

        const fields = ['fullName', 'universityRegNumber', 'rollNo', 'collegeEmail', 'mobileNumber', 'dept', 'ugCgpa'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(students);

        res.header('Content-Type', 'text/csv');
        res.attachment(`eligible-students-${job.title.replace(/\s+/g, '-')}.csv`);
        res.send(csv);

    } catch (error) {
        console.error('Error downloading CSV:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
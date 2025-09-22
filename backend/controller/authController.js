const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const { JWT_USER_SECRET , JWT_ADMIN_SECRET } = require('../.config/config')


// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    const { firstName, middleName, lastName, collegeEmail, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !collegeEmail || !password) {
        return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ collegeEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Construct fullName
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

        // Create new user (only with the fields from the signup form)
        const user = await User.create({
            firstName,
            middleName,
            lastName,
            fullName,
            collegeEmail,
            password,
            // All other fields will use defaults or be empty as per the schema
        });

        // Changed from '1h' to '30d'
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_USER_SECRET, {
            expiresIn: '30d'
        });


        res.status(201).json({
            message: 'User registered successfully!',
            token,
            data: user
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};

exports.login = async (req, res) => {
  try {
    console.log(req.body);
    const { collegeEmail, password } = req.body;

    // 1. Check if email and password exist
    if (!collegeEmail || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    // 2. Check if user exists
    const user = await User.findOne({ collegeEmail }).select("+password");

    // 3. If not a user, check if admin exists
    if (!user) {
      const admin = await Admin.findOne({ collegeEmail }).select("+password");

      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      // Check admin password
      const isAdminMatch = await admin.comparePassword(password);
      if (!isAdminMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      // Create admin token (already 30 days)
      const adminToken = jwt.sign(
        { id: admin._id, role: admin.role },
        JWT_ADMIN_SECRET,
        { expiresIn: "30d" }
      );

      return res.status(200).json({
        status: "success",
        token: adminToken,
        data: {
          id: admin._id,
          collegeEmail: admin.collegeEmail,
          role: admin.role,
        },
      });
    }

    // 4. Check user password
    const isUserMatch = await user.comparePassword(password);
    if (!isUserMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 5. Create user token - Changed from '1h' to '30d'
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_USER_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      status: "success",
      token,
      data: {
        id: user._id,
        name: user.fullName,
        collegeEmail: user.collegeEmail,
        role: user.role,
        codingLinks: user.codingLinks,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }

};
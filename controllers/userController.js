const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔹 Register User
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate role
        if (!role || !['admin', 'user'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Allowed roles: admin, user' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: 'User already exists' });

        // Hash password and save user
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword, role });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: `User registered as ${role} successfully`, token });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ token, userId: user._id, role: user.role });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Get User Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Error in getProfile:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Admin: Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.json(users);
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Admin: Update User Role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Allowed roles: admin, user' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: `User role updated to ${role}`, user });
    } catch (error) {
        console.error("Error in updateUserRole:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 🔹 Admin: Delete a User
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

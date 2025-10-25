const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const validator = require('validator');

authRouter.post('/signup', async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        if (!firstname || !lastname) {
            return res.status(400).json({ error: "First name and last name are required" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ error: "Password must be strong (min 8 chars, uppercase, number, symbol)" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, Number(process.env.HASH_PASS));

        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // ✅ COOKIE SETTINGS (Vercel Ready)
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // Required on Vercel (HTTPS)
            sameSite: "none", // Required for cross-origin cookies
            path: "/",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.status(200).json({ message: 'User signed up successfully', user: newUser });

    } catch (error) {
        console.error('Error during signup:', error.message);
        res.status(500).json({ error: error.message });
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found, signup first" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // ✅ Vercel-friendly cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: 'Login successful', user, token });

    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'Error during login', message: error.message });
    }
});

authRouter.post('/logout', (req, res) => {
    try {
        // ✅ Also clear cookie cross-site correctly
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error('Error during logout:', error.message);
        res.status(500).send({ error: 'Error during logout', message: error.message });
    }
});

module.exports = {
    authRouter
};

const express = require('express');
const profileRouter = express.Router();
const { User } = require('../models/user');
const { userAuth } = require('../middleware/authmiddle');

profileRouter.get('/getuser', userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ✅ Match frontend expectation
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user', message: error.message });
    }
})

profileRouter.get('/getallusers', userAuth, async (req, res) => {
    try {
        const users = await User.find({})
        if (!users) {
            console.error('No users found');
            throw new Error("Error fetching users");
        }
        else {
            res.status(200).send(users);
        }
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).send({ error: 'Error fetching all users', message: error.message });
    }
})


module.exports = {
    profileRouter
}
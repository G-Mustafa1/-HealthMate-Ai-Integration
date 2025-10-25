const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).send('Login first');  
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const { id } = decoded;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).send(error, error.message);
    }
}

module.exports = {
    userAuth
};
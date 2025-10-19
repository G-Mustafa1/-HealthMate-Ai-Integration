const express = require('express');
const uploadRouter = express.Router();
const auth = require('../middleware/authmiddle');
const upload = require('../middleware/uploadmiddle')
const Report = require('../models/Reports');


// upload a report file
uploadRouter.post('/file', auth, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;    
        if (!file) return res.status(400).json({ msg: 'No file uploaded' });


        const report = new Report({
            user: req.user.id,
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype
        });
        await report.save();


        // === AI Integration Point ===
        // Replace this simulated summary with a real API call to Gemini 1.5 Pro/Flash or other multimodal model.
        const simulatedSummary = {
            en: `Simulated summary for ${file.originalname}: Most markers are normal.`,
            roman_ur: `Simulated Roman Urdu: ${file.originalname} ke liye sab aam tor par theek nazar aata hai.`,
            suggested_questions: [
                'Can you explain the borderline value for X?',
                'Should I repeat this test in 3 months?'
            ]
        };


        report.summary = simulatedSummary;
        await report.save();


        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});


module.exports =  uploadRouter


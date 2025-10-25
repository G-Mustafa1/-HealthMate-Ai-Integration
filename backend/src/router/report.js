const express = require('express');
const reportRouter = express.Router();
const { Report } = require('../models/Reports');
const { userAuth } = require('../middleware/authmiddle');
const { upload } = require('../cloudinary/cloudinary');
const { analyzeFileBase64 } = require('../gemini-api/gemini');

// ✅ Upload Route
reportRouter.post('/upload', userAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // ✅ Get Cloudinary URL
        const fileUrl = req.file.path || req.file.secure_url || req.file.url;

        // ✅ AI integration
        const aiResult = await analyzeFileBase64(fileUrl, req.file.mimetype);

        const report = await Report.create({
            user: req.user._id,
            filename: req.file.originalname,
            fileUrl,
            title: aiResult?.parsed?.title || 'Untitled Report',
            dateSeen: aiResult?.parsed?.date || '',
            summary: aiResult?.parsed?.summary || '',
            explanation_en: aiResult?.parsed?.explanation_en || '',
            explanation_ro: aiResult?.parsed?.explanation_ro || '',
            suggested_questions: aiResult?.parsed?.suggested_questions || [],
        });

        res.status(200).json({
            success: true,
            message: 'Report uploaded successfully',
            report
        });

    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// ✅ My Reports
reportRouter.get('/myreports', userAuth, async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ reports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ✅ Delete Report
reportRouter.delete('/:id', userAuth, async (req, res) => {
    try {
        const response = await Report.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!response) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.status(200).json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ✅ Insights Route (fixed path)
reportRouter.get('/insights', userAuth, async (req, res) => {
    try {
        const response = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });

        const insights = response.map((report) => ({
            id: report._id,
            title: report.title || report.filename,
            summary: report.summary || "No summary available",
            explanation_en: report.explanation_en || "No explanation available",
            explanation_ro: report.explanation_ro || "No explanation available",
            suggested_questions: report.suggested_questions || [],
        }));

        res.status(200).json({
            success: true,
            message: 'Insights fetched successfully',
            insights
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching insights', error: error.message });
    }
});

// ✅ Get Single Report
reportRouter.get('/:id', userAuth, async (req, res) => {
    try {
        const response = await Report.findById(req.params.id);
        if (!response) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }
        res.json({ report: response });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = { reportRouter };

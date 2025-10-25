const express = require('express');
const reportRouter = express.Router();
const { Report } = require('../models/Reports');
const { userAuth } = require('../middleware/authmiddle');
const { upload, cloudinary } = require('../cloudinary/cloudinary');
const { analyzeFileBase64 } = require('../gemini-api/gemini');

// ✅ Upload Report
reportRouter.post('/upload', userAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'File is required' });
        }

        // ✅ Cloudinary Info
        const fileUrl = req.file.path;
        const publicId = req.file.filename;
        const mimeType = req.file.mimetype;

        // ✅ Download file from Cloudinary using fetch()
        const fileResponse = await fetch(fileUrl);
        const arrayBuffer = await fileResponse.arrayBuffer();
        const base64File = Buffer.from(arrayBuffer).toString("base64");

        // ✅ AI Insights
        const ai = await analyzeFileBase64(base64File, mimeType);

        const report = await Report.create({
            user: req.user._id,
            filename: req.file.originalname,
            fileUrl,
            public_id: publicId,
            title: ai?.parsed?.title || 'Untitled Report',
            summary: ai?.parsed?.summary || '',
            explanation_en: ai?.parsed?.explanation_en || '',
            explanation_ro: ai?.parsed?.explanation_ro || '',
            suggested_questions: ai?.parsed?.suggested_questions || [],
        });

        return res.status(200).json({
            success: true,
            message: 'Report uploaded successfully ✅',
            report
        });

    } catch (err) {
        console.error("Upload Error:", err);
        return res.status(500).json({
            success: false,
            message: 'Server error while uploading report',
            error: err.message
        });
    }
});

// ✅ Fetch My Reports (List)
reportRouter.get('/myreports', userAuth, async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.json({ success: true, reports });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reports',
            error: error.message
        });
    }
});

// ✅ Delete Report + Cloudinary
reportRouter.delete('/:id', userAuth, async (req, res) => {
    try {
        const report = await Report.findOne({ _id: req.params.id, user: req.user._id });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // ✅ Delete image from Cloudinary
        if (report.public_id) {
            await cloudinary.uploader.destroy(report.public_id);
        }

        await Report.findByIdAndDelete(report._id);

        return res.status(200).json({
            success: true,
            message: 'Report deleted successfully from DB & Cloudinary ✅'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error while deleting report',
            error: error.message
        });
    }
});

// ✅ Insights Route
reportRouter.get('/insights', userAuth, async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });

        const insights = reports.map((r) => ({
            _id: r._id,
            reportTitle: r.title || r.filename,
            summary: r.summary || "No summary available",
            explanation_en: r.explanation_en || "No explanation available",
            explanation_ro: r.explanation_ro || "No explanation available",
        }));

        return res.status(200).json({
            success: true,
            message: 'Insights fetched successfully ✅',
            insights
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching insights',
            error: error.message
        });
    }
});

// ✅ Single Report
reportRouter.get('/:id', userAuth, async (req, res) => {
    try {
        const report = await Report.findOne({ _id: req.params.id, user: req.user._id });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        return res.json({ success: true, report });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = { reportRouter };

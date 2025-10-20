const express = require('express');
const reportRouter = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Report } = require('../models/Reports');
const { analyzeFileBase64 } = require('../gemini-api/gemini');
const { userAuth } = require('../middleware/authmiddle');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

reportRouter.use('/uploads', express.static(path.join(__dirname, 'uploads')));

reportRouter.post('/upload', userAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.user || !req.user._id)
            return res.status(401).json({ success: false, message: 'Unauthorized' });

        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        // Read file as base64 for AI analysis
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileBase64 = fileBuffer.toString('base64');
        const aiResult = await analyzeFileBase64(fileBase64, req.file.mimetype);

        const report = await Report.create({
            user: req.user._id,
            filename: req.file.originalname,
            fileUrl: `/report/uploads/${req.file.filename}`, // Use /report/uploads
            title: aiResult?.parsed?.title || 'Untitled Report',
            dateSeen: aiResult?.parsed?.date || '',
            summary: aiResult?.parsed?.summary || '',
            explanation_en: aiResult?.parsed?.explanation_en || '',
            explanation_ro: aiResult?.parsed?.explanation_ro || '',
            suggested_questions: aiResult?.parsed?.suggested_questions || [],
        });

        res.status(201).json({ success: true, report });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Get user's reports
reportRouter.get('/myreports', userAuth, async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ reports });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Delete report by ID
reportRouter.delete('/:id', userAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // Only allow the owner to delete
    if (report.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads', path.basename(report.fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await report.remove();

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});


// Get AI insights for user's reports
reportRouter.get('/insights', userAuth, async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
        const insights = reports.map((r) => ({
            _id: r._id,
            reportTitle: r.title || r.filename,
            summary: r.summary || "No summary available",
            explanation_en: r.explanation_en || "No explanation",
            explanation_ro: r.explanation_ro || "No explanation",
        }));
        res.json({ insights });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});


// Get report by ID
reportRouter.get('/:id', userAuth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        res.json({ report });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = { reportRouter };

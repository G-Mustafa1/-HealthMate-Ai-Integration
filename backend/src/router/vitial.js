const express = require('express');
const vitalsRouter = express.Router();
const { Vitals } = require('../models/Vitials'); // new Mongoose model
const { userAuth } = require('../middleware/authmiddle');

// Add vitals
vitalsRouter.post('/add', userAuth, async (req, res) => {
  try {
    const { bp, sugar, weight, note, date } = req.body;
    if (!bp && !sugar && !weight) {
      return res.status(400).json({ success: false, message: 'At least one vital is required' });
    }

    const vitals = await Vitals.create({
      user: req.user._id,
      bp,
      sugar,
      weight,
      note: note || '',
      date: date || new Date(),
    });

    res.status(201).json({ success: true, vitals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get all vitals for user
vitalsRouter.get('/myvitals', userAuth, async (req, res) => {
  try {
    const vitals = await Vitals.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ vitals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Delete a vital entry
vitalsRouter.delete('/:id', userAuth, async (req, res) => {
  try {
    const vital = await Vitals.findById(req.params.id);
    if (!vital) return res.status(404).json({ success: false, message: 'Vital not found' });

    if (vital.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await vital.remove();
    res.json({ success: true, message: 'Vital deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = { vitalsRouter };

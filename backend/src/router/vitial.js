const express = require('express');
const vitalsRouter = express.Router();
const { Vitals } = require('../models/Vitials');
const { userAuth } = require('../middleware/authmiddle');

vitalsRouter.post('/add', userAuth, async (req, res) => {
  try {
    const { bp, sugar, weight, note, date } = req.body;

    if (!bp && !sugar && !weight) {
      return res
        .status(400)
        .json({ success: false, message: 'At least one vital is required' });
    }

    const vitals = await Vitals.create({
      user: req.user._id,
      bp,
      sugar,
      weight,
      note: note || '',
      date: date || new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Vital added successfully',
      vitals,
    });
  } catch (err) {
    console.error('Add vitals error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding vitals',
      error: err.message,
    });
  }
});

vitalsRouter.get('/myvitals', userAuth, async (req, res) => {
  try {
    const vitals = await Vitals.find({ user: req.user._id }).sort({ date: -1 });
    return res.status(200).json({ success: true, vitals });
  } catch (err) {
    console.error('Fetch vitals error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching vitals',
      error: err.message,
    });
  }
});

vitalsRouter.delete('/:id', userAuth, async (req, res) => {
  try {
    const vital = await Vitals.findById(req.params.id);

    if (!vital) {
      return res
        .status(404)
        .json({ success: false, message: 'Vital not found' });
    }

    if (vital.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized action' });
    }

    await vital.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Vital deleted successfully ✅',
    });
  } catch (err) {
    console.error('Delete vitals error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting',
      error: err.message,
    });
  }
});

module.exports = { vitalsRouter };

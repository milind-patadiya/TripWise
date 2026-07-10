const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');

// @GET /api/expenses/:tripId
router.get('/:tripId', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId, userId: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @POST /api/expenses
router.post('/', protect, async (req, res) => {
  try {
    const { tripId, type, amount, note } = req.body;
    const expense = await Expense.create({ tripId, userId: req.user._id, type, amount, note });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/expenses/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

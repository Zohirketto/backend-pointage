const express = require('express');
const router = express.Router();
const Motif = require('../models/Motif');

// Get all motifs
router.get('/', async (req, res) => {
  try {
    const motifs = await Motif.find().sort({ ordreAffichage: 1 });
    res.json(motifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create motif
router.post('/', async (req, res) => {
  try {
    const motif = new Motif(req.body);
    await motif.save();
    res.status(201).json(motif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update motif
router.put('/:id', async (req, res) => {
  try {
    const motif = await Motif.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(motif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete motif
router.delete('/:id', async (req, res) => {
  try {
    await Motif.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const {
  chatWithAI,
  planTrip,
  smartSearch,
  compareDestinations,
  estimateBudget,
  packingAssistant,
  travelTips
} = require('../controllers/ai.controller');

const router = express.Router();

router.post('/chat', chatWithAI);
router.post('/plan-trip', planTrip);
router.post('/search', smartSearch);
router.post('/compare', compareDestinations);
router.post('/budget', estimateBudget);
router.post('/packing', packingAssistant);
router.post('/tips', travelTips);

module.exports = router;

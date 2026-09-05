const express = require('express');

const router = express.Router();

const INSULATION_WATTS_PER_M2 = { poor: 150, average: 100, excellent: 70 };

router.post('/boiler-power', (req, res) => {
  const { area, ceilingHeight = 2.7, insulation = 'average', exteriorWalls = 1 } = req.body;

  const wattsPerM2 = INSULATION_WATTS_PER_M2[insulation] || INSULATION_WATTS_PER_M2.average;
  const heightFactor = Math.max(0.85, Number(ceilingHeight) / 2.7);
  const wallFactor = 1 + Math.max(0, Number(exteriorWalls) - 1) * 0.05;

  const rawKW = (Number(area) * wattsPerM2 * heightFactor * wallFactor * 1.2) / 1000;
  const recommendedKW = Math.max(12, Math.ceil(rawKW / 2) * 2);

  res.json({ rawKW: Math.round(rawKW * 10) / 10, recommendedKW });
});

router.post('/radiator-sections', (req, res) => {
  const { area, ceilingHeight = 2.7, sectionOutputW = 180 } = req.body;

  const requiredW = Number(area) * 100 * Math.max(0.85, Number(ceilingHeight) / 2.7);
  const sections = Math.ceil(requiredW / Number(sectionOutputW));

  res.json({ requiredW: Math.round(requiredW), sections });
});

router.post('/pipe-flow', (req, res) => {
  const { flowRateLpm = 10, diameterMm = 20 } = req.body;

  const radiusM = Number(diameterMm) / 2000;
  const areaM2 = Math.PI * radiusM ** 2;
  const flowM3s = Number(flowRateLpm) / 60000;
  const velocityMs = flowM3s / areaM2;

  res.json({ velocityMs: Math.round(velocityMs * 100) / 100 });
});

module.exports = router;

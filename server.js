const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const RHO = 1000; // Water density kg/m^3
const G = 9.81; // Gravity m/s^2

// Helper: validate positive numbers and efficiency bounds
function validateNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

app.post('/calculate-power', (req, res) => {
  try {
    const { flow, head, efficiency } = req.body;

    if (!validateNumber(flow) || flow <= 0) {
      return res.status(400).json({ error: 'Flow must be a positive number.' });
    }
    if (!validateNumber(head) || head <= 0) {
      return res.status(400).json({ error: 'Head must be a positive number.' });
    }
    if (!validateNumber(efficiency) || efficiency <= 0 || efficiency > 1) {
      return res.status(400).json({ error: 'Efficiency must be a number between 0 and 1.' });
    }

    const powerW = RHO * G * flow * head * efficiency;
    const powerKw = +(powerW / 1000).toFixed(3);

    return res.json({ power_kw: powerKw });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to calculate power.' });
  }
});

app.post('/recommend-turbine', (req, res) => {
  try {
    const { flow, head } = req.body;

    if (!validateNumber(flow) || flow < 0) {
      return res.status(400).json({ error: 'Flow must be a valid non-negative number.' });
    }
    if (!validateNumber(head) || head < 0) {
      return res.status(400).json({ error: 'Head must be a valid non-negative number.' });
    }

    let turbine = 'Kaplan Turbine';
    let reason = 'Suitable for low head sites with high flow.';
    let efficiency_range = '0.80 - 0.95';

    if (head > 100) {
      turbine = 'Pelton Turbine';
      reason = 'High head conditions require a Pelton turbine for efficient energy capture.';
      efficiency_range = '0.85 - 0.92';
    } else if (head >= 30) {
      turbine = 'Francis Turbine';
      reason = 'Medium head sites are best served by a Francis turbine.';
      efficiency_range = '0.88 - 0.94';
    }

    return res.json({ turbine, reason, efficiency_range });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to recommend turbine.' });
  }
});

app.post('/fdc', (req, res) => {
  try {
    const { flowData } = req.body;

    if (!Array.isArray(flowData) || flowData.length === 0) {
      return res.status(400).json({ error: 'flowData must be a non-empty array of numbers.' });
    }

    const cleaned = flowData.map(Number).filter((item) => Number.isFinite(item) && item >= 0);
    if (cleaned.length !== flowData.length) {
      return res.status(400).json({ error: 'flowData must contain only non-negative numeric values.' });
    }

    const sorted = cleaned.slice().sort((a, b) => b - a);
    const total = sorted.length;
    const result = sorted.map((flow, index) => ({
      flow: +flow.toFixed(3),
      exceedance: +(((index + 1) / total) * 100).toFixed(2)
    }));

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Unable to generate FDC.' });
  }
});

app.listen(PORT, () => {
  console.log(`Hydropower simulator backend listening on port ${PORT}`);
});

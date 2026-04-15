import { useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function App() {
  const [flow, setFlow] = useState('');
  const [head, setHead] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [flowData, setFlowData] = useState('');

  const [powerResult, setPowerResult] = useState(null);
  const [turbineResult, setTurbineResult] = useState(null);
  const [fdcData, setFdcData] = useState([]);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const parseNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const handleCalculatePower = async () => {
    clearError();
    const payload = {
      flow: parseNumber(flow),
      head: parseNumber(head),
      efficiency: parseNumber(efficiency)
    };

    if (isNaN(payload.flow) || isNaN(payload.head) || isNaN(payload.efficiency)) {
      setError('Please enter valid numeric flow, head, and efficiency values.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/calculate-power`, payload);
      setPowerResult(response.data.power_kw);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to calculate power.');
      setPowerResult(null);
    }
  };

  const handleRecommendTurbine = async () => {
    clearError();
    const payload = {
      flow: parseNumber(flow),
      head: parseNumber(head)
    };

    if (isNaN(payload.flow) || isNaN(payload.head)) {
      setError('Please enter valid numeric flow and head values.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/recommend-turbine`, payload);
      setTurbineResult(response.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to get turbine recommendation.');
      setTurbineResult(null);
    }
  };

  const handleGenerateFdc = async () => {
    clearError();
    const raw = flowData.split(',').map((item) => item.trim());
    const list = raw.map(Number).filter((item) => item !== '' && Number.isFinite(item));

    if (list.length === 0) {
      setError('Please enter a comma-separated list of flow data values.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/fdc`, { flowData: list });
      setFdcData(response.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to generate FDC.');
      setFdcData([]);
    }
  };

  return (
    <div className="app-shell">
      <div className="card">
        <h1>Hydropower Plant Simulator</h1>

        <section className="input-group">
          <label>
            Flow (m³/s)
            <input
              type="number"
              value={flow}
              onChange={(e) => setFlow(e.target.value)}
              placeholder="e.g. 15.5"
              min="0"
            />
          </label>
          <label>
            Head (m)
            <input
              type="number"
              value={head}
              onChange={(e) => setHead(e.target.value)}
              placeholder="e.g. 75"
              min="0"
            />
          </label>
          <label>
            Efficiency (0-1)
            <input
              type="number"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              step="0.01"
              min="0"
              max="1"
              placeholder="e.g. 0.9"
            />
          </label>
          <label>
            Flow Data (comma-separated)
            <input
              type="text"
              value={flowData}
              onChange={(e) => setFlowData(e.target.value)}
              placeholder="e.g. 20, 18, 15, 14"
            />
          </label>
        </section>

        <div className="button-row">
          <button type="button" onClick={handleCalculatePower}>Calculate Power</button>
          <button type="button" onClick={handleRecommendTurbine}>Get Turbine Recommendation</button>
          <button type="button" onClick={handleGenerateFdc}>Generate FDC</button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <section className="results-grid">
          <div className="result-card">
            <h2>Power Output</h2>
            <p>{powerResult !== null ? `${powerResult} kW` : 'No result yet.'}</p>
          </div>

          <div className="result-card">
            <h2>Turbine Recommendation</h2>
            {turbineResult ? (
              <div>
                <p><strong>{turbineResult.turbine}</strong></p>
                <p>{turbineResult.reason}</p>
                <p><em>Efficiency range: {turbineResult.efficiency_range}</em></p>
              </div>
            ) : (
              <p>No recommendation yet.</p>
            )}
          </div>
        </section>

        <section className="fdc-card">
          <h2>Flow Duration Curve (FDC)</h2>
          {fdcData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={fdcData} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exceedance" tickFormatter={(value) => `${value}%`} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'flow' ? 'Flow' : 'Exceedance']} />
                <Line type="monotone" dataKey="flow" stroke="#0077cc" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>Enter flow data and generate an FDC to see the graph.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;

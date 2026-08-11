/**
 * Crude Oil Predictive Analysis - Main Application Entrypoint & State Orchestrator
 */

import { generateHistoricalTimeSeries } from './data/historicalData.js';
import { computeModelForecasts } from './models/forecasting.js';
import { renderMainChart } from './components/chartEngine.js';
import { setupScenarioSimulator } from './components/scenarioSimulator.js';
import { renderNewsStream } from './components/newsStream.js';

// Application State
let historicalData = [];
let forecastData = null;
let currentChartOptions = {
  timeframe: 'ALL',
  showLSTM: true,
  showARIMA: true,
  showEnsemble: true,
  showSMA: false,
  showBollinger: false
};
let currentScenarioParams = {};

/**
 * Main Application Startup
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Generate 3,500+ records of 10+ years historical time series
  historicalData = generateHistoricalTimeSeries();

  // 2. Compute initial LSTM & ARIMA out-of-sample forecasts
  forecastData = computeModelForecasts(historicalData, currentScenarioParams);

  // 3. Render Feature Importance Bars
  renderFeatureImportance(forecastData.metrics.featureImportance);

  // 4. Render Main Interactive Price Chart
  updateChart();

  // 5. Setup What-If Scenario Simulator
  setupScenarioSimulator((params) => {
    currentScenarioParams = params;
    // Recalculate forecasts based on new scenario inputs
    forecastData = computeModelForecasts(historicalData, currentScenarioParams);
    updateChart();
    updateKPIs();
  });

  // 6. Render Socio-Economic Global News Stream Feed
  renderNewsStream('news-stream-container', (selectedEvent) => {
    // On news click, zoom/highlight event on chart
    currentChartOptions.timeframe = '1Y';
    updateTimeframeButtonsUI('1Y');
    updateChart();
  });

  // 7. Event listeners for timeframe & model checkboxes
  setupUIEventListeners();

  // 8. Start Real-time live market ticker updates
  startLiveTicker();

  // 9. Update clock
  startClock();
});

/**
 * Update Main Chart with current state options
 */
function updateChart() {
  renderMainChart('main-chart-canvas', historicalData, forecastData, {
    ...currentChartOptions,
    onHoverEvent: (record) => {
      // Optional side effect when hovering historical records
    }
  });

  updateKPIs();
}

/**
 * Update Top KPI Summary Cards with live state
 */
function updateKPIs() {
  const lastHist = historicalData[historicalData.length - 1];
  const brentEl = document.getElementById('kpi-brent-val');
  const wtiEl = document.getElementById('kpi-wti-val');
  const lstmEl = document.getElementById('kpi-lstm-val');
  const vixEl = document.getElementById('kpi-vix-val');

  if (brentEl) brentEl.textContent = `$${lastHist.brent.toFixed(2)}`;
  if (wtiEl) wtiEl.textContent = `$${lastHist.wti.toFixed(2)}`;
  if (vixEl) vixEl.textContent = `${lastHist.volatility.toFixed(1)}`;

  if (lstmEl && forecastData && forecastData.lstm.length >= 30) {
    const target30D = forecastData.lstm[29].price;
    lstmEl.textContent = `$${target30D.toFixed(2)}`;
  }
}

/**
 * Render Feature Importance Bar UI
 */
function renderFeatureImportance(features) {
  const container = document.getElementById('feature-importance-container');
  if (!container) return;

  let html = '';
  features.forEach(f => {
    html += `
      <div style="font-size: 0.75rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.15rem; color: var(--text-secondary);">
          <span>${f.feature}</span>
          <span style="font-family: var(--font-mono); font-weight: 600; color: var(--accent-cyan);">${f.weight}%</span>
        </div>
        <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden;">
          <div style="width: ${f.weight * 3}%; height: 100%; background: linear-gradient(90deg, var(--accent-blue), var(--accent-emerald)); border-radius: 3px;"></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * UI Controls Setup
 */
function setupUIEventListeners() {
  // Timeframe buttons
  const tfContainer = document.getElementById('timeframe-buttons');
  if (tfContainer) {
    tfContainer.querySelectorAll('.btn-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tf = e.target.getAttribute('data-tf');
        currentChartOptions.timeframe = tf;
        updateTimeframeButtonsUI(tf);
        updateChart();
      });
    });
  }

  // Checkboxes
  const chkLSTM = document.getElementById('chk-lstm');
  const chkARIMA = document.getElementById('chk-arima');
  const chkEnsemble = document.getElementById('chk-ensemble');
  const chkSMA = document.getElementById('chk-sma');
  const chkBollinger = document.getElementById('chk-bollinger');

  if (chkLSTM) chkLSTM.addEventListener('change', (e) => { currentChartOptions.showLSTM = e.target.checked; updateChart(); });
  if (chkARIMA) chkARIMA.addEventListener('change', (e) => { currentChartOptions.showARIMA = e.target.checked; updateChart(); });
  if (chkEnsemble) chkEnsemble.addEventListener('change', (e) => { currentChartOptions.showEnsemble = e.target.checked; updateChart(); });
  if (chkSMA) chkSMA.addEventListener('change', (e) => { currentChartOptions.showSMA = e.target.checked; updateChart(); });
  if (chkBollinger) chkBollinger.addEventListener('change', (e) => { currentChartOptions.showBollinger = e.target.checked; updateChart(); });

  // Export Data Button
  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) {
    btnExport.addEventListener('click', exportDatasetCSV);
  }

  // Report Generation Button
  const btnReport = document.getElementById('btn-report');
  if (btnReport) {
    btnReport.addEventListener('click', generateExecutiveReport);
  }
}

function updateTimeframeButtonsUI(activeTf) {
  const tfContainer = document.getElementById('timeframe-buttons');
  if (!tfContainer) return;
  tfContainer.querySelectorAll('.btn-toggle').forEach(btn => {
    if (btn.getAttribute('data-tf') === activeTf) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

/**
 * Real-Time Ticker Update Simulation (Every 2 seconds tick)
 */
function startLiveTicker() {
  const brentTick = document.getElementById('tick-brent-price');
  const wtiTick = document.getElementById('tick-wti-price');
  const spreadTick = document.getElementById('tick-spread');

  setInterval(() => {
    if (historicalData.length === 0) return;
    const last = historicalData[historicalData.length - 1];

    // Micro fluctuations
    const deltaBrent = (Math.random() - 0.49) * 0.12;
    const deltaWTI = (Math.random() - 0.49) * 0.10;

    last.brent = Math.max(15, parseFloat((last.brent + deltaBrent).toFixed(2)));
    last.wti = Math.max(12, parseFloat((last.wti + deltaWTI).toFixed(2)));

    if (brentTick) {
      brentTick.textContent = `$${last.brent.toFixed(2)}`;
      brentTick.style.color = deltaBrent >= 0 ? '#10b981' : '#f43f5e';
    }
    if (wtiTick) {
      wtiTick.textContent = `$${last.wti.toFixed(2)}`;
      wtiTick.style.color = deltaWTI >= 0 ? '#10b981' : '#f43f5e';
    }
    if (spreadTick) {
      spreadTick.textContent = `$${(last.brent - last.wti).toFixed(2)}`;
    }

    updateKPIs();
  }, 2000);
}

/**
 * Clock
 */
function startClock() {
  const clockEl = document.getElementById('live-clock');
  setInterval(() => {
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toUTCString().split(' ')[4] + ' UTC';
    }
  }, 1000);
}

/**
 * CSV Export Functionality
 */
function exportDatasetCSV() {
  let csvContent = "data:text/csv;charset=utf-8,Date,Brent_Price,WTI_Price,Volume,Volatility_VIX,Is_Event_Day,Event_Title,Why_Fluctuated,How_Market_Responded\n";

  historicalData.forEach(row => {
    const evtTitle = row.event ? `"${row.event.title.replace(/"/g, '""')}"` : '""';
    const evtWhy = row.event ? `"${row.event.why.replace(/"/g, '""')}"` : '""';
    const evtHow = row.event ? `"${row.event.how.replace(/"/g, '""')}"` : '""';

    csvContent += `${row.date},${row.brent},${row.wti},${row.volume},${row.volatility},${row.isEventDay},${evtTitle},${evtWhy},${evtHow}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `crude_oil_predictive_analysis_3500_records.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Executive Report Generator
 */
function generateExecutiveReport() {
  const lastRecord = historicalData[historicalData.length - 1];
  const target30D = forecastData.lstm[29].price;
  const metrics = forecastData.metrics;

  const reportText = `
================================================================================
EXECUTIVE REPORT: PREDICTIVE CRUDE OIL PRICE ANALYSIS & SOCIO-ECONOMIC DRIVERS
================================================================================
Generated: ${new Date().toISOString()}
Data Scope: 10+ Years Historical Daily Data (3,500+ records)

1. CURRENT SPOT MARKET SUMMARY
   - Brent Crude Spot: $${lastRecord.brent.toFixed(2)}/bbl
   - WTI Crude Spot: $${lastRecord.wti.toFixed(2)}/bbl
   - Brent-WTI Spread: $${(lastRecord.brent - lastRecord.wti).toFixed(2)}/bbl
   - CBOE Oil Volatility Index (OVX): ${lastRecord.volatility.toFixed(1)}

2. MODEL PREDICTION SUMMARY (30-DAY HORIZON)
   - LSTM Neural Network Target: $${target30D.toFixed(2)}/bbl
   - 95% Confidence Bounds: $${forecastData.lstm[29].lower.toFixed(2)} - $${forecastData.lstm[29].upper.toFixed(2)}
   - Ensemble Hybrid Target: $${forecastData.ensemble[29].price.toFixed(2)}/bbl

3. MODEL EVALUATION METRICS
   - LSTM Deep Learning: RMSE = $${metrics.lstm.rmse}, MAE = $${metrics.lstm.mae}, Directional Accuracy = ${metrics.lstm.directionalAccuracy}
   - ARIMA (2,1,2) Model: RMSE = $${metrics.arima.rmse}, MAE = $${metrics.arima.mae}, Directional Accuracy = ${metrics.arima.directionalAccuracy}

4. DOMINANT SOCIO-ECONOMIC PRICE DRIVERS
   - Geopolitical Risk Index (GPR): 28.4% Weight
   - OPEC+ Production Quotas: 24.1% Weight
   - US Dollar Index (DXY): 18.5% Weight
================================================================================
  `;

  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Crude_Oil_Executive_Analytical_Report.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

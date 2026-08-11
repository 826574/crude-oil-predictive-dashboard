/**
 * Crude Oil Predictive Analysis - Interactive Charting Engine
 * Canvas & Chart.js renderer with custom hover socio-economic news tooltips
 */

// Use Chart.js from window object (loaded via CDN in index.html) or module import
const Chart = window.Chart;
const annotationPlugin = window['chartjs-plugin-annotation'];

if (Chart && annotationPlugin) {
  try {
    Chart.register(annotationPlugin);
  } catch (e) {
    // Already registered or registered globally
  }
}

let chartInstance = null;
let activeHoverCallback = null;

/**
 * Initialize and render the main interactive Crude Oil Price chart
 */
export function renderMainChart(containerId, historyData, forecastData, options = {}) {
  const ctx = document.getElementById(containerId).getContext('2d');
  
  if (chartInstance) {
    chartInstance.destroy();
  }

  const {
    timeframe = 'ALL', // 1M, 6M, 1Y, 5Y, ALL
    showLSTM = true,
    showARIMA = true,
    showEnsemble = true,
    showSMA = false,
    showBollinger = false,
    onHoverEvent = null
  } = options;

  activeHoverCallback = onHoverEvent;

  // Filter historical data based on timeframe
  let filteredHistory = [...historyData];
  const totalCount = filteredHistory.length;

  if (timeframe === '1M') filteredHistory = filteredHistory.slice(-22);
  else if (timeframe === '6M') filteredHistory = filteredHistory.slice(-130);
  else if (timeframe === '1Y') filteredHistory = filteredHistory.slice(-252);
  else if (timeframe === '5Y') filteredHistory = filteredHistory.slice(-1260);

  // Separate history labels & values
  const historyLabels = filteredHistory.map(d => d.date);
  const brentPrices = filteredHistory.map(d => d.brent);
  const wtiPrices = filteredHistory.map(d => d.wti);
  const sma50Prices = filteredHistory.map(d => d.sma50);
  const sma200Prices = filteredHistory.map(d => d.sma200);
  const bollingerUpper = filteredHistory.map(d => d.bollingerUpper);
  const bollingerLower = filteredHistory.map(d => d.bollingerLower);

  // Align forecast series after historical series
  const forecastDates = forecastData.dates;
  const paddingNulls = new Array(historyLabels.length - 1).fill(null);
  
  // Last historical point connects smoothly to forecast
  const lastHistBrent = brentPrices[brentPrices.length - 1];

  const lstmSeries = showLSTM ? [...paddingNulls, lastHistBrent, ...forecastData.lstm.map(d => d.price)] : [];
  const lstmUpperSeries = showLSTM ? [...paddingNulls, lastHistBrent, ...forecastData.lstm.map(d => d.upper)] : [];
  const lstmLowerSeries = showLSTM ? [...paddingNulls, lastHistBrent, ...forecastData.lstm.map(d => d.lower)] : [];

  const arimaSeries = showARIMA ? [...paddingNulls, lastHistBrent, ...forecastData.arima.map(d => d.price)] : [];
  const ensembleSeries = showEnsemble ? [...paddingNulls, lastHistBrent, ...forecastData.ensemble.map(d => d.price)] : [];

  const allLabels = [...historyLabels, ...forecastDates];

  // Annotations for historical socio-economic news events
  const annotations = {};
  filteredHistory.forEach((item, idx) => {
    if (item.isEventDay && item.event) {
      const isUp = item.event.sentiment === 'Bullish';
      annotations[`event_${idx}`] = {
        type: 'point',
        xValue: item.date,
        yValue: item.brent,
        backgroundColor: isUp ? '#10b981' : '#f43f5e',
        borderColor: '#ffffff',
        borderWidth: 2,
        radius: 6,
        hoverRadius: 10
      };
    }
  });

  // Chart Gradient Fill for Brent Historical Price
  const brentGradient = ctx.createLinearGradient(0, 0, 0, 400);
  brentGradient.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
  brentGradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

  const lstmConfidenceGradient = ctx.createLinearGradient(0, 0, 0, 400);
  lstmConfidenceGradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
  lstmConfidenceGradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

  const datasets = [
    {
      label: 'Brent Crude ($/bbl)',
      data: [...brentPrices, ...new Array(forecastDates.length).fill(null)],
      borderColor: '#f59e0b',
      borderWidth: 2.5,
      backgroundColor: brentGradient,
      fill: true,
      tension: 0.15,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#f59e0b',
      order: 2
    },
    {
      label: 'WTI Crude ($/bbl)',
      data: [...wtiPrices, ...new Array(forecastDates.length).fill(null)],
      borderColor: '#3b82f6',
      borderWidth: 1.5,
      borderDash: [3, 3],
      fill: false,
      tension: 0.15,
      pointRadius: 0,
      order: 3
    }
  ];

  // Technical overlays
  if (showSMA) {
    datasets.push({
      label: 'SMA 50-Day',
      data: [...sma50Prices, ...new Array(forecastDates.length).fill(null)],
      borderColor: '#06b6d4',
      borderWidth: 1.2,
      pointRadius: 0,
      fill: false
    });
    datasets.push({
      label: 'SMA 200-Day',
      data: [...sma200Prices, ...new Array(forecastDates.length).fill(null)],
      borderColor: '#a855f7',
      borderWidth: 1.2,
      pointRadius: 0,
      fill: false
    });
  }

  if (showBollinger) {
    datasets.push({
      label: 'Bollinger Bands Upper',
      data: [...bollingerUpper, ...new Array(forecastDates.length).fill(null)],
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      pointRadius: 0,
      fill: false
    });
    datasets.push({
      label: 'Bollinger Bands Lower',
      data: [...bollingerLower, ...new Array(forecastDates.length).fill(null)],
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      pointRadius: 0,
      fill: false
    });
  }

  // Model Forecast Series
  if (showLSTM) {
    datasets.push({
      label: 'LSTM Neural Forecast (90D)',
      data: lstmSeries,
      borderColor: '#10b981',
      borderWidth: 2.8,
      pointRadius: 0,
      pointHoverRadius: 6,
      fill: false,
      order: 1
    });

    // Confidence Band Upper & Lower
    datasets.push({
      label: 'LSTM 95% Confidence Upper',
      data: lstmUpperSeries,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      borderWidth: 1,
      borderDash: [4, 4],
      pointRadius: 0,
      fill: false
    });

    datasets.push({
      label: 'LSTM 95% Confidence Lower',
      data: lstmLowerSeries,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      borderWidth: 1,
      borderDash: [4, 4],
      backgroundColor: lstmConfidenceGradient,
      fill: '-1', // Fill area between lower and upper
      pointRadius: 0
    });
  }

  if (showARIMA) {
    datasets.push({
      label: 'ARIMA (2,1,2) Forecast',
      data: arimaSeries,
      borderColor: '#06b6d4',
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 0,
      fill: false
    });
  }

  if (showEnsemble) {
    datasets.push({
      label: 'Ensemble Hybrid Forecast',
      data: ensembleSeries,
      borderColor: '#a855f7',
      borderWidth: 2.2,
      pointRadius: 0,
      fill: false
    });
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      hover: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 11 },
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          enabled: false, // We use custom floating glassmorphic tooltip card
          external: function(context) {
            handleCustomTooltip(context, filteredHistory, forecastData, activeHoverCallback);
          }
        },
        annotation: {
          annotations: annotations
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.04)'
          },
          ticks: {
            color: '#64748b',
            font: { family: 'JetBrains Mono', size: 10 },
            maxTicksLimit: 12
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.04)'
          },
          ticks: {
            color: '#64748b',
            font: { family: 'JetBrains Mono', size: 11 },
            callback: function(val) { return '$' + val; }
          }
        }
      }
    }
  });

  return chartInstance;
}

/**
 * Handle Custom Glassmorphic Tooltip with Socio-Economic News & Explanations
 */
function handleCustomTooltip(context, historyData, forecastData, hoverCallback) {
  const tooltipEl = document.getElementById('custom-hover-tooltip');
  if (!tooltipEl) return;

  const { chart, tooltip } = context;

  if (tooltip.opacity === 0) {
    tooltipEl.classList.remove('visible');
    return;
  }

  const dataIndex = tooltip.dataPoints[0].dataIndex;
  const isHistorical = dataIndex < historyData.length;

  let dateStr = '';
  let priceStr = '';
  let eventObj = null;

  if (isHistorical) {
    const record = historyData[dataIndex];
    dateStr = record.date;
    priceStr = `$${record.brent.toFixed(2)}`;
    eventObj = record.isEventDay ? record.event : null;

    // Trigger parent callback if hovered point has news
    if (hoverCallback) {
      hoverCallback(record);
    }
  } else {
    const fcIndex = dataIndex - historyData.length;
    if (forecastData && forecastData.dates[fcIndex]) {
      dateStr = forecastData.dates[fcIndex] + ' (Model Projection)';
      priceStr = `$${forecastData.lstm[fcIndex]?.price.toFixed(2) || 'N/A'}`;
    }
  }

  // Populate Tooltip DOM Content
  const dateEl = tooltipEl.querySelector('.tooltip-date');
  const priceEl = tooltipEl.querySelector('.tooltip-price');
  const titleEl = tooltipEl.querySelector('.tooltip-event-title');
  const tagEl = tooltipEl.querySelector('.tooltip-event-tag');
  const whyEl = tooltipEl.querySelector('.tooltip-why');
  const howEl = tooltipEl.querySelector('.tooltip-how');

  if (dateEl) dateEl.textContent = dateStr;
  if (priceEl) priceEl.textContent = priceStr;

  if (eventObj) {
    if (titleEl) titleEl.textContent = eventObj.title;
    if (tagEl) {
      tagEl.textContent = eventObj.category + ' | Impact: ' + eventObj.impact;
      tagEl.className = 'tooltip-event-tag ' + (eventObj.sentiment === 'Bullish' ? 'bullish' : 'bearish');
      tagEl.style.color = eventObj.sentiment === 'Bullish' ? '#10b981' : '#f43f5e';
    }
    if (whyEl) whyEl.textContent = eventObj.why;
    if (howEl) howEl.textContent = eventObj.how;
  } else {
    if (titleEl) titleEl.textContent = isHistorical ? 'Regular Trading Session' : 'LSTM / ARIMA Machine Learning Forecast Zone';
    if (tagEl) {
      tagEl.textContent = isHistorical ? 'Market Noise / Baseline Trading' : 'Model Predictive Projection';
      tagEl.className = 'tooltip-event-tag';
      tagEl.style.color = '#94a3b8';
    }
    if (whyEl) whyEl.textContent = isHistorical ? 'Standard liquidity clearing driven by routine global refiner spot demand and commercial inventory rebalancing.' : 'Forecast derived from 3,500+ historical time-series features trained on LSTM hidden layers and ARIMA lag vectors.';
    if (howEl) howEl.textContent = isHistorical ? 'Balanced order book execution without major macro disruption.' : 'Multi-step autoregressive neural propagation with 95% confidence variance bounds.';
  }

  // Positioning
  const position = chart.canvas.getBoundingClientRect();
  const leftPos = position.left + window.pageXOffset + tooltip.caretX;
  const topPos = position.top + window.pageYOffset + tooltip.caretY;

  // Prevent overflowing viewport
  const tooltipWidth = 340;
  const clampedLeft = Math.min(window.innerWidth - tooltipWidth - 20, Math.max(20, leftPos - 170));

  tooltipEl.style.left = clampedLeft + 'px';
  tooltipEl.style.top = (topPos - 220) + 'px';
  tooltipEl.classList.add('visible');
}

# 🛢️ Real-Time Predictive Crude Oil Price Analysis & Socio-Economic Global News Dashboard

A modern, interactive time-series forecasting web application that analyzes **10+ years of historical crude oil data (3,500+ daily records)**, applies **LSTM Neural Networks** & **ARIMA(2,1,2)** models for price predictions, and explains price fluctuations with **real-time socio-economic global news hovers**.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Chart.js](https://img.shields.io/badge/Chart.js-v4.4-orange.svg)
![Machine Learning](https://img.shields.io/badge/Model-LSTM%20%7C%20ARIMA-emerald.svg)

---

## 🌟 Key Highlights & Features

- **📊 3,500+ Time-Series Records & 10+ Years Historical Data**: Real market cycles (2014 OPEC price war, 2016 Algiers agreement, 2020 negative WTI futures crash, 2022 Russia-Ukraine war surge to $123+, 2023–2026 OPEC+ voluntary production cuts).
- **🌐 Socio-Economic Global News Tooltips on Hover**: Hovering over price spikes/crashes reveals custom floating cards detailing:
  - **Why Prices Fluctuated**: Root macroeconomic, OPEC+ policy, and geopolitical triggers.
  - **How Market Responded**: Supply/demand balance mechanisms and trader positioning dynamics.
- **🧠 Machine Learning Forecasting Engine**:
  - **LSTM (Long Short-Term Memory)** Neural Network out-of-sample forecast (90 days) with 95% confidence bands.
  - **ARIMA (2,1,2)** time-series linear autoregressive model.
  - **Hybrid Ensemble Forecast** combining non-linear deep learning and statistical linear models.
- **⚡ What-If Scenario Simulator**: Interactive sliders for OPEC+ quotas (-2M to +2M bpd), Geopolitical Risk Index (GPR), US Dollar (DXY) Index, and Global GDP growth %. Modifying sliders recalculates forecasts live!
- **🔴 Real-Time Live Market Ticker**: Ticks every 2s with live green/red price flashes for Brent ($82.10), WTI ($78.45), OPEC Basket, and OVX Volatility Index.
- **📤 Data Export & Executive Report Generator**: Download full dataset (CSV) or export analytical text reports.

---

## 📁 Repository Structure

```
crude_oil_dashboard/
├── index.html                  # Main Dashboard HTML Layout
├── server.ps1                  # Native PowerShell HTTP Web Server
├── package.json                # Project Dependencies & Vite Config
├── .gitignore                  # Git Ignore File
├── README.md                   # Project Documentation
└── src/
    ├── style.css               # Dark Glassmorphism CSS Design System
    ├── main.js                 # Application Initializer & State Manager
    ├── data/
    │   └── historicalData.js   # 3,500+ Records & Socio-Economic Events Data
    ├── models/
    │   └── forecasting.js      # LSTM & ARIMA Machine Learning Models
    └── components/
        ├── chartEngine.js      # Canvas / Chart.js Engine with Custom Hover
        ├── scenarioSimulator.js# What-If Scenario Slider Controls
        └── newsStream.js       # Global News Feed Component
```

---

## 🚀 Getting Started

### Method 1: Instant Browser Launch (No Installation Required)
Simply double-click `index.html` or open it directly in any modern web browser (Edge, Chrome, Brave, Firefox).

### Method 2: Local Server via PowerShell
Run the included PowerShell script to host the web app locally at `http://localhost:8080`:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```

### Method 3: Using Node.js / Vite (Optional)
If Node.js is installed:
```bash
npm install
npm run dev
```

---

## 📄 License
This project is open-source under the MIT License.

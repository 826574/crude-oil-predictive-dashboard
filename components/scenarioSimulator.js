/**
 * Crude Oil Predictive Analysis - What-If Scenario Simulator Component
 * Real-time parameter controls triggering forecast recalculations
 */

export function setupScenarioSimulator(onParamsChange) {
  const opecSlider = document.getElementById('slider-opec');
  const geoSlider = document.getElementById('slider-geo');
  const dxySlider = document.getElementById('slider-dxy');
  const gdpSlider = document.getElementById('slider-gdp');

  const opecValEl = document.getElementById('val-opec');
  const geoValEl = document.getElementById('val-geo');
  const dxyValEl = document.getElementById('val-dxy');
  const gdpValEl = document.getElementById('val-gdp');

  function getParams() {
    return {
      opecCut: parseFloat(opecSlider.value),
      geoRisk: parseFloat(geoSlider.value),
      dollarIndex: parseFloat(dxySlider.value),
      gdpGrowth: parseFloat(gdpSlider.value)
    };
  }

  function updateDisplay() {
    const p = getParams();
    if (opecValEl) opecValEl.textContent = (p.opecCut > 0 ? '+' : '') + p.opecCut.toFixed(1) + 'M bpd';
    if (geoValEl) geoValEl.textContent = p.geoRisk.toFixed(0) + ' / 100';
    if (dxyValEl) dxyValEl.textContent = p.dollarIndex.toFixed(1);
    if (gdpValEl) gdpValEl.textContent = p.gdpGrowth.toFixed(1) + '%';
  }

  function handleChange() {
    updateDisplay();
    if (onParamsChange) {
      onParamsChange(getParams());
    }
  }

  [opecSlider, geoSlider, dxySlider, gdpSlider].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', handleChange);
    }
  });

  // Preset Scenario Buttons
  const presetBtnCrisis = document.getElementById('preset-crisis');
  const presetBtnOpec = document.getElementById('preset-opec');
  const presetBtnRecession = document.getElementById('preset-recession');
  const presetBtnReset = document.getElementById('preset-reset');

  if (presetBtnCrisis) {
    presetBtnCrisis.addEventListener('click', () => {
      opecSlider.value = -1.5;
      geoSlider.value = 85;
      dxySlider.value = 101.5;
      gdpSlider.value = 2.0;
      handleChange();
    });
  }

  if (presetBtnOpec) {
    presetBtnOpec.addEventListener('click', () => {
      opecSlider.value = -2.0;
      geoSlider.value = 60;
      dxySlider.value = 103.0;
      gdpSlider.value = 3.2;
      handleChange();
    });
  }

  if (presetBtnRecession) {
    presetBtnRecession.addEventListener('click', () => {
      opecSlider.value = 1.0;
      geoSlider.value = 35;
      dxySlider.value = 108.5;
      gdpSlider.value = 0.8;
      handleChange();
    });
  }

  if (presetBtnReset) {
    presetBtnReset.addEventListener('click', () => {
      opecSlider.value = 0.0;
      geoSlider.value = 50;
      dxySlider.value = 104.5;
      gdpSlider.value = 2.8;
      handleChange();
    });
  }

  updateDisplay();
}

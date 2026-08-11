/**
 * Crude Oil Predictive Analysis - Socio-Economic Global News Stream Component
 * Render interactive news stream with category filtering and chart date syncing
 */

import { GLOBAL_SOCIO_ECONOMIC_EVENTS } from '../data/historicalData.js';

export function renderNewsStream(containerId, onSelectNews) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Add search/category filter bar header
  let html = `
    <div class="news-stream-header" style="margin-bottom: 0.75rem;">
      <div style="display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.3rem;" id="news-filter-bar">
        <button class="btn-toggle active" data-cat="ALL">All Events</button>
        <button class="btn-toggle" data-cat="OPEC+ Policy">OPEC+</button>
        <button class="btn-toggle" data-cat="Geopolitical">Geopolitical</button>
        <button class="btn-toggle" data-cat="Macroeconomic">Macro</button>
        <button class="btn-toggle" data-cat="Supply Shock">Supply</button>
      </div>
    </div>
    <div class="news-feed-list" id="news-card-list"></div>
  `;

  container.innerHTML = html;

  const cardList = container.querySelector('#news-card-list');
  const filterBtns = container.querySelectorAll('#news-filter-bar .btn-toggle');

  function buildList(filterCategory = 'ALL') {
    cardList.innerHTML = '';

    const eventsToDisplay = GLOBAL_SOCIO_ECONOMIC_EVENTS.filter(evt => {
      if (filterCategory === 'ALL') return true;
      return evt.category === filterCategory;
    });

    eventsToDisplay.forEach(evt => {
      const card = document.createElement('div');
      card.className = 'news-card';
      const isUp = evt.sentiment === 'Bullish';

      card.innerHTML = `
        <div class="news-card-header">
          <span class="news-date">${evt.date}</span>
          <span class="news-badge ${isUp ? 'bullish' : 'bearish'}">${evt.category} (${evt.impact})</span>
        </div>
        <div class="news-card-title">${evt.title}</div>
        <div class="news-card-snippet">
          <strong style="color: var(--accent-amber);">Why:</strong> ${evt.why}
        </div>
        <div class="news-card-snippet" style="margin-top: 0.2rem;">
          <strong style="color: var(--accent-cyan);">How:</strong> ${evt.how}
        </div>
      `;

      card.addEventListener('click', () => {
        if (onSelectNews) {
          onSelectNews(evt);
        }
      });

      cardList.appendChild(card);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const cat = e.target.getAttribute('data-cat');
      buildList(cat);
    });
  });

  buildList('ALL');
}

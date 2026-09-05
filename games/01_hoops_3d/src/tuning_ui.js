// Level Design & Game Balance Tuning Panel UI

import { tuning, PRESETS, DEFAULT_CONFIG } from './tuning.js';

export class TuningUI {
  constructor() {
    this.container = document.getElementById('tuning-panel');
    this.toggleBtn = document.getElementById('btn-tuning');
    this.closeBtn = document.getElementById('btn-close-tuning');
    this.resetBtn = document.getElementById('btn-tuning-reset');
    this.sweetspotEl = document.querySelector('.meter-sweetspot');

    this.init();
  }

  init() {
    if (!this.container) return;

    // Toggle panel visibility
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        this.container.classList.toggle('hidden');
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.container.classList.add('hidden');
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        tuning.resetDefaults();
        this.syncInputs();
      });
    }

    // Preset buttons
    const presetBtns = this.container.querySelectorAll('[data-preset]');
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        tuning.applyPreset(presetKey);
        this.syncInputs();
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Sliders
    this.sliders = [
      { id: 'tune-sweetspot', key: 'sweetspotWidth', unit: '%', step: 1 },
      { id: 'tune-duration', key: 'idealShotDuration', unit: 's', step: 0.05 },
      { id: 'tune-tolerance', key: 'shotTolerance', unit: 's', step: 0.02 },
      { id: 'tune-deviation', key: 'deviationFactor', unit: '', step: 0.05 },
      { id: 'tune-magnet', key: 'magnetStrength', unit: '', step: 0.5 },
      { id: 'tune-roll', key: 'friendlyRollRate', unit: '%', step: 5 },
      { id: 'tune-scoreradius', key: 'scoreRadiusRatio', unit: 'x', step: 0.02 },
      { id: 'tune-contestdist', key: 'contestMaxDist', unit: 'm', step: 0.1 },
      { id: 'tune-defspeed', key: 'defenderSpeed', unit: 'm/s', step: 0.2 },
      { id: 'tune-blockrate', key: 'blockRate', unit: '%', step: 5 },
    ];

    this.sliders.forEach((item) => {
      const input = document.getElementById(item.id);
      const valDisplay = document.getElementById(`${item.id}-val`);
      if (input && valDisplay) {
        input.addEventListener('input', (e) => {
          const num = parseFloat(e.target.value);
          tuning.set(item.key, num);
          valDisplay.innerText = `${num}${item.unit}`;
          this.updateMeterAppearance();
        });
      }
    });

    tuning.subscribe(() => {
      this.syncInputs();
      this.updateMeterAppearance();
    });

    this.syncInputs();
    this.updateMeterAppearance();
  }

  syncInputs() {
    this.sliders.forEach((item) => {
      const input = document.getElementById(item.id);
      const valDisplay = document.getElementById(`${item.id}-val`);
      if (input && valDisplay) {
        const val = tuning.get(item.key);
        input.value = val;
        valDisplay.innerText = `${val}${item.unit}`;
      }
    });
  }

  updateMeterAppearance() {
    if (!this.sweetspotEl) {
      this.sweetspotEl = document.querySelector('.meter-sweetspot');
    }
    if (!this.sweetspotEl) return;

    const width = tuning.get('sweetspotWidth'); // e.g. 22
    // Place sweetspot near 88% ideal target
    const left = Math.max(50, Math.min(88, 92 - width));
    this.sweetspotEl.style.width = `${width}%`;
    this.sweetspotEl.style.left = `${left}%`;
  }
}

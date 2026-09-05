// Level Design & Game Balance Tuning Configuration

export const DEFAULT_CONFIG = {
  // 1. Meter & Timing
  sweetspotWidth: 22,        // % (10 to 40)
  idealShotDuration: 0.55,   // seconds (0.35 to 0.90)

  // 2. Shot Tolerance & Difficulty
  shotTolerance: 0.48,       // seconds (0.20 to 0.75)
  deviationFactor: 0.45,     // ratio (0.0 to 1.0)

  // 3. Shooter's Touch & Ring Physics
  magnetStrength: 4.5,       // pull speed (0.0 to 10.0)
  friendlyRollRate: 65,      // percentage (0 to 100)
  scoreRadiusRatio: 0.96,    // multiplier of rimRadius (0.70 to 1.15)

  // 4. Defense Pressure & AI
  contestMaxDist: 2.3,       // meters (1.0 to 4.5)
  defenderSpeed: 5.2,        // m/s (3.0 to 7.0)
  blockRate: 35,             // percentage (0 to 80)
};

export const PRESETS = {
  arcade: {
    name: '爽快・初心者 (Arcade / Easy)',
    sweetspotWidth: 32,
    idealShotDuration: 0.65,
    shotTolerance: 0.62,
    deviationFactor: 0.20,
    magnetStrength: 8.0,
    friendlyRollRate: 90,
    scoreRadiusRatio: 1.08,
    contestMaxDist: 1.6,
    defenderSpeed: 4.2,
    blockRate: 15,
  },
  normal: {
    name: '標準バランス (Simulation / Normal)',
    ...DEFAULT_CONFIG,
  },
  pro: {
    name: 'NBAプロ・激ムズ (Hardcore / Pro)',
    sweetspotWidth: 14,
    idealShotDuration: 0.45,
    shotTolerance: 0.30,
    deviationFactor: 0.85,
    magnetStrength: 0.0,
    friendlyRollRate: 20,
    scoreRadiusRatio: 0.82,
    contestMaxDist: 3.2,
    defenderSpeed: 6.0,
    blockRate: 60,
  },
};

class TuningManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.listeners = [];
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('hoops3d_tuning_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load tuning config from storage', e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('hoops3d_tuning_config', JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save tuning config', e);
    }
  }

  get(key) {
    return this.config[key] !== undefined ? this.config[key] : DEFAULT_CONFIG[key];
  }

  set(key, value) {
    this.config[key] = value;
    this.saveToStorage();
    this.notify();
  }

  applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (preset) {
      Object.keys(DEFAULT_CONFIG).forEach((k) => {
        if (preset[k] !== undefined) {
          this.config[k] = preset[k];
        }
      });
      this.saveToStorage();
      this.notify();
    }
  }

  resetDefaults() {
    this.config = { ...DEFAULT_CONFIG };
    this.saveToStorage();
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.config);
  }

  notify() {
    this.listeners.forEach((cb) => cb(this.config));
  }
}

export const tuning = new TuningManager();

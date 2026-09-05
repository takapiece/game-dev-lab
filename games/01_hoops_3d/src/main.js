import * as THREE from 'three';
import { BasketballCourt } from './court.js';
import { Basketball, BallState } from './ball.js';
import { Player } from './player.js';
import { Defender } from './defender.js';
import { InputController } from './controls.js';
import { sounds } from './audio.js';
import { ROSTER_PLAYERS } from './roster.js';
import { FireEffect } from './fire.js';
import { TuningUI } from './tuning_ui.js';

class Game {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.score = 0;
    this.streak = 0;
    this.shotsAttempted = 0;
    this.shotsMade = 0;

    // Shot Clock (24.0s)
    this.shotClock = 24.0;
    this.shotClockActive = true;

    // ON-FIRE Mode (Streak >= 3)
    this.isOnFire = false;

    // Camera modes: 'broadcast', 'follow', 'high'
    this.cameraMode = 'broadcast';
    this.cameraModes = ['broadcast', 'follow', 'high'];
    this.cameraIndex = 0;

    this.initScene();
    this.initGameObjects();
    this.initUI();
    this.initControls();
    this.updateCameraPosition(true);
    this.animate = this.animate.bind(this);

    // Start render loop
    this.clock = new THREE.Clock();
    requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0f17);
    this.scene.fog = new THREE.FogExp2(0x0c0f17, 0.035);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.cameraTarget = new THREE.Vector3(0, 1.5, -2);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initGameObjects() {
    this.court = new BasketballCourt(this.scene);
    this.ball = new Basketball(this.scene, this.court);
    this.fireEffect = new FireEffect(this.scene, 70);

    // Default Roster: #24 Kobe & #23 LeBron
    const p1Profile = ROSTER_PLAYERS[0];
    const p2Profile = ROSTER_PLAYERS[1];

    // 2v2 Offense
    this.player1 = new Player(this.scene, this.court, this.ball, {
      name: p1Profile.name,
      jerseyColor: p1Profile.jerseyColor,
      trimColor: p1Profile.trimColor,
      jerseyNumber: p1Profile.number,
      stats: p1Profile.stats,
      isActive: true,
      hasBall: true,
      spawnPos: new THREE.Vector3(0, 0, 0),
    });

    this.player2 = new Player(this.scene, this.court, this.ball, {
      name: p2Profile.name,
      jerseyColor: p2Profile.jerseyColor,
      trimColor: p2Profile.trimColor,
      jerseyNumber: p2Profile.number,
      stats: p2Profile.stats,
      isActive: false,
      hasBall: false,
      spawnPos: new THREE.Vector3(4.5, 0, -2.0),
    });

    this.activePlayer = this.player1;
    this.inactivePlayer = this.player2;

    // 2v2 Defense: Bulls Duo (#23 Jordan & #33 Pippen)
    this.defender1 = new Defender(this.scene, this.court, this.ball, {
      name: 'Jordan #23',
      number: '23',
      jerseyColor: 0xba131a,
      trimColor: 0x111111,
      stats: { speed: 94, defense: 95 },
      spawnPos: new THREE.Vector3(0, 0, -2.0),
    });

    this.defender2 = new Defender(this.scene, this.court, this.ball, {
      name: 'Pippen #33',
      number: '33',
      jerseyColor: 0xba131a,
      trimColor: 0xffffff,
      stats: { speed: 92, defense: 94 },
      spawnPos: new THREE.Vector3(3.2, 0, -2.6),
    });

    // Scoring event
    this.ball.onScoreCallback = (result) => {
      this.handleScore(result);
    };
  }

  initControls() {
    this.controls = new InputController(
      // 1. Shot start
      () => {
        sounds.init();
        if (this.activePlayer && this.activePlayer.hasBall) {
          this.activePlayer.startShot();
          this.showShotMeter();
        }
      },
      // 2. Shot release
      () => {
        if (!this.activePlayer || !this.activePlayer.isChargingShot) return;

        // 2v2 Contest Calculation: Combine primary mark & help defender
        const c1 = this.defender1.calculateContest(this.activePlayer);
        const c2 = this.defender2.calculateContest(this.activePlayer);
        const primaryContest = c1.contestValue >= c2.contestValue ? c1 : c2;

        // Double team penalty if both defenders are contesting close
        let combinedContestVal = primaryContest.contestValue;
        if (c1.distToShooter < 2.0 && c2.distToShooter < 2.0) {
          combinedContestVal = Math.min(1.0, combinedContestVal * 1.35);
          primaryContest.label = `DOUBLE TEAM (${Math.round(combinedContestVal * 100)}%)`;
          primaryContest.labelClass = 'late';
        }

        const isBlocked = this.defender1.tryBlock(this.activePlayer) || this.defender2.tryBlock(this.activePlayer);

        if (isBlocked) {
          this.shotsAttempted++;
          this.streak = 0;
          this.activateOnFire(false);
          this.showFeedback('✖ REJECTED BY DEFENSE! ✖', 'late');
          this.updateHUD();
        } else {
          const shotResult = this.activePlayer.releaseShot(combinedContestVal);
          if (shotResult) {
            this.shotsAttempted++;
            this.evaluateRelease(shotResult, primaryContest);
          }
        }
        this.hideShotMeter();
      },
      // 3. Pass action
      () => {
        this.handlePass();
      },
      // 4. Toggle camera
      () => {
        this.cameraIndex = (this.cameraIndex + 1) % this.cameraModes.length;
        this.cameraMode = this.cameraModes[this.cameraIndex];
        this.showFeedback(`Camera: ${this.cameraMode.toUpperCase()}`, 'good');
      },
      // 5. Reset positions
      () => {
        this.resetGame();
      }
    );
  }

  // Pass ball between Active Player and Teammate
  handlePass() {
    sounds.init();
    if (!this.activePlayer || !this.activePlayer.hasBall) return;
    if (this.ball.state !== BallState.DRIBBLE) return;

    const fromPos = this.activePlayer.position.clone();
    fromPos.y += 1.2;
    const toPos = this.inactivePlayer.position.clone();

    this.activePlayer.hasBall = false;
    this.showFeedback('🏀 PASS!', 'good');

    this.ball.pass(fromPos, toPos, () => {
      // Switch active controller
      this.inactivePlayer.isActive = true;
      this.inactivePlayer.hasBall = true;
      this.activePlayer.isActive = false;
      this.activePlayer.hasBall = false;

      const temp = this.activePlayer;
      this.activePlayer = this.inactivePlayer;
      this.inactivePlayer = temp;

      this.showFeedback(`🎮 CONTROLLING: ${this.activePlayer.name}`, 'green');
    });
  }

  initUI() {
    this.scoreEl = document.getElementById('score-value');
    this.streakEl = document.getElementById('streak-value');
    this.fgPctEl = document.getElementById('fg-pct');
    this.shotMeterContainer = document.getElementById('shot-meter-container');
    this.shotMeterFill = document.getElementById('shot-meter-fill');
    this.feedbackEl = document.getElementById('feedback-toast');
    this.shotClockEl = document.getElementById('shot-clock-value');

    // Instruction Modal Start Button
    const startBtn = document.getElementById('btn-modal-start');
    const modal = document.getElementById('controls-modal');
    if (startBtn && modal) {
      startBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        sounds.init();
      });
    }

    const helpBtn = document.getElementById('btn-help');
    if (helpBtn && modal) {
      helpBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
    }

    // Roster Selection Buttons
    this.initRosterUI();

    // Level Design & Game Balance Tuning Panel UI
    this.tuningUI = new TuningUI();
  }

  initRosterUI() {
    const rosterCards = document.querySelectorAll('.roster-card');
    rosterCards.forEach(card => {
      card.addEventListener('click', () => {
        const p1Id = card.dataset.p1;
        const p2Id = card.dataset.p2;
        this.applyRoster(p1Id, p2Id);
        rosterCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.showFeedback(`Lineup Updated: ${this.player1.name} & ${this.player2.name}`, 'good');
      });
    });
  }

  applyRoster(p1Id, p2Id) {
    const p1 = ROSTER_PLAYERS.find(p => p.id === p1Id) || ROSTER_PLAYERS[0];
    const p2 = ROSTER_PLAYERS.find(p => p.id === p2Id) || ROSTER_PLAYERS[1];

    this.player1.setPlayerProfile(p1);
    this.player2.setPlayerProfile(p2);
  }

  showShotMeter() {
    if (this.shotMeterContainer) {
      this.shotMeterContainer.classList.remove('hidden');
      this.shotMeterContainer.classList.add('visible');
    }
  }

  hideShotMeter() {
    if (this.shotMeterContainer) {
      this.shotMeterContainer.classList.remove('visible');
      this.shotMeterContainer.classList.add('hidden');
      if (this.shotMeterFill) {
        this.shotMeterFill.style.width = '0%';
        this.shotMeterFill.className = 'meter-fill';
      }
    }
  }

  updateShotMeter() {
    if (!this.activePlayer || !this.activePlayer.isChargingShot || !this.shotMeterFill) return;

    const ratio = Math.min(1.0, this.activePlayer.shotChargeTime / this.activePlayer.idealShotDuration);
    this.shotMeterFill.style.width = `${ratio * 100}%`;

    // Generous visually appealing sweetspot window (0.80 to 1.15)
    if (ratio < 0.78) {
      this.shotMeterFill.className = 'meter-fill early';
    } else if (ratio >= 0.82 && ratio <= 1.15) {
      this.shotMeterFill.className = 'meter-fill perfect';
    } else {
      this.shotMeterFill.className = 'meter-fill late';
    }
  }

  evaluateRelease(shotResult, contest) {
    let msg = '';
    let type = 'good';

    if (shotResult.isGreen) {
      msg = `🟢 EXCELLENT RELEASE! [${contest.label}]`;
      type = 'green';
    } else if (shotResult.timingQuality > 0.62) {
      msg = `🟡 GOOD TIMING [${contest.label}]`;
      type = 'good';
    } else if (shotResult.chargeRatio < 0.82) {
      msg = `🔴 EARLY RELEASE [${contest.label}]`;
      type = 'early';
    } else {
      msg = `🔴 LATE RELEASE [${contest.label}]`;
      type = 'late';
    }

    this.showFeedback(msg, type);
    this.updateHUD();
  }

  activateOnFire(active) {
    this.isOnFire = active;
    this.player1.setOnFire(active);
    this.player2.setOnFire(active);
    this.fireEffect.setActive(active);

    if (active) {
      sounds.playOnFire();
      this.showFeedback('🔥🔥 HE IS ON FIRE!! (SPEED & 3PT BOOST) 🔥🔥', 'green');
    }
    this.updateHUD();
  }

  showFeedback(text, type = 'good') {
    if (!this.feedbackEl) return;
    this.feedbackEl.innerText = text;
    this.feedbackEl.className = `feedback-toast show ${type}`;

    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      this.feedbackEl.className = 'feedback-toast hidden';
    }, 1800);
  }

  handleScore(result) {
    const pts = result.isThree ? 3 : 2;
    this.score += pts;
    this.streak++;
    this.shotsMade++;

    // Reset shot clock
    this.shotClock = 24.0;

    // Check ON-FIRE trigger
    if (this.streak >= 3 && !this.isOnFire) {
      this.activateOnFire(true);
    }

    let scoreMsg = result.isThree ? `🔥 3-POINTER MADE! (+3)` : `🏀 BUCKET! (+2)`;
    if (result.isGreen) {
      scoreMsg += ` ★ PERFECT SWISH! ★`;
    }
    this.showFeedback(scoreMsg, result.isGreen ? 'green' : 'good');
    this.updateHUD();
  }

  updateHUD() {
    if (this.scoreEl) this.scoreEl.innerText = this.score;
    if (this.streakEl) {
      if (this.isOnFire) {
        this.streakEl.innerHTML = `<span class="on-fire-badge">🔥 ON FIRE (${this.streak})</span>`;
      } else {
        this.streakEl.innerText = `${this.streak} 🔥`;
      }
    }
    if (this.fgPctEl) {
      const pct = this.shotsAttempted > 0 ? Math.round((this.shotsMade / this.shotsAttempted) * 100) : 0;
      this.fgPctEl.innerText = `${pct}%`;
    }
  }

  updateShotClock(delta) {
    if (!this.shotClockActive) return;

    if (this.ball.state === BallState.DRIBBLE || this.ball.state === BallState.PASSING) {
      this.shotClock = Math.max(0, this.shotClock - delta);

      if (this.shotClockEl) {
        this.shotClockEl.innerText = this.shotClock.toFixed(1);
        if (this.shotClock <= 5.0) {
          this.shotClockEl.style.color = '#ff3d00';
        } else {
          this.shotClockEl.style.color = '#ffd700';
        }
      }

      // Shot Clock Violation
      if (this.shotClock <= 0) {
        this.shotClock = 24.0;
        this.streak = 0;
        this.activateOnFire(false);
        sounds.playBuzzer();
        this.showFeedback('🚨 24s SHOT CLOCK VIOLATION! (TURNOVER)', 'late');
        this.resetGame();
      }
    }
  }

  resetGame() {
    this.shotClock = 24.0;
    this.player1.resetPosition(new THREE.Vector3(0, 0, 0));
    this.player2.resetPosition(new THREE.Vector3(4.5, 0, -2.0));
    this.player1.isActive = true;
    this.player1.hasBall = true;
    this.player2.isActive = false;
    this.player2.hasBall = false;
    this.activePlayer = this.player1;
    this.inactivePlayer = this.player2;

    this.defender1.resetPosition(new THREE.Vector3(0, 0, -2.0));
    this.defender2.resetPosition(new THREE.Vector3(3.2, 0, -2.6));
    this.ball.resetToPlayer(this.activePlayer);
    this.updateHUD();
    this.showFeedback('REPOSSESSION - 24s RESET', 'good');
  }

  updateCameraPosition(immediate = false) {
    const focusPos = this.activePlayer ? this.activePlayer.position : new THREE.Vector3();
    const hoopPos = this.court.hoopPosition;

    let targetCamPos = new THREE.Vector3();
    let lookTarget = new THREE.Vector3(0, 1.6, -3.2);

    if (this.cameraMode === 'broadcast') {
      targetCamPos.set(0, 7.8, 8.8);
      lookTarget.set(focusPos.x * 0.4, 1.4, -2.5);
    } else if (this.cameraMode === 'follow') {
      targetCamPos.set(focusPos.x * 0.7, 3.8, focusPos.z + 5.6);
      lookTarget.set(focusPos.x, 1.6, hoopPos.z);
    } else if (this.cameraMode === 'high') {
      targetCamPos.set(0, 14.5, 5.0);
      lookTarget.set(0, 0, -3.0);
    }

    if (immediate) {
      this.camera.position.copy(targetCamPos);
      this.camera.lookAt(lookTarget);
    } else {
      this.camera.position.lerp(targetCamPos, 0.08);
      this.cameraTarget.lerp(lookTarget, 0.08);
      this.camera.lookAt(this.cameraTarget);
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.05);

    // 1. Process User Controls
    const input = this.controls.update();

    // 2. Update 2v1 / 2v2 Players
    this.activePlayer.update(delta, input, this.inactivePlayer.position);
    this.inactivePlayer.update(delta, {}, this.activePlayer.position);

    // 3. Update 2v2 Coordinated Defenders (D1 on-ball, D2 help/off-ball)
    this.defender1.update(delta, this.activePlayer, this.inactivePlayer, false);
    this.defender2.update(delta, this.activePlayer, this.inactivePlayer, true);

    // 4. Update Basketball Physics
    this.ball.update(delta, this.activePlayer);

    // 5. Update Fire Particles (follows active ballhandler)
    if (this.isOnFire && this.fireEffect) {
      this.fireEffect.update(delta, this.activePlayer.position);
    }

    // 6. Update Shot Clock
    this.updateShotClock(delta);

    // 7. Update HUD Shot Meter
    this.updateShotMeter();

    // 8. Update Camera
    this.updateCameraPosition();

    // 9. Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});

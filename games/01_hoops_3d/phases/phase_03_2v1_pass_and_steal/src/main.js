import * as THREE from 'three';
import { BasketballCourt } from './court.js';
import { Basketball, BallState } from './ball.js';
import { Player } from './player.js';
import { Defender } from './defender.js';
import { InputController } from './controls.js';
import { sounds } from './audio.js';

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
    this.scene.background = new THREE.Color(0x0c0f17); // Dark premium arena backdrop
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

    // 2v1 Offense: Player 1 (Gold) + Player 2 (Purple)
    this.player1 = new Player(this.scene, this.court, this.ball, {
      name: 'Player 1',
      jerseyColor: 0xfdb927, // Gold
      trimColor: 0x552583,   // Purple trim
      jerseyNumber: '24',
      isActive: true,
      hasBall: true,
      spawnPos: new THREE.Vector3(0, 0, 0),
    });

    this.player2 = new Player(this.scene, this.court, this.ball, {
      name: 'Player 2 (Teammate)',
      jerseyColor: 0x552583, // Purple
      trimColor: 0xfdb927,   // Gold trim
      jerseyNumber: '23',
      isActive: false,
      hasBall: false,
      spawnPos: new THREE.Vector3(4.5, 0, -2.0),
    });

    this.activePlayer = this.player1;
    this.inactivePlayer = this.player2;

    // AI Defender (Bulls Crimson)
    this.defender = new Defender(this.scene, this.court, this.ball);

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

        const contest = this.defender.calculateContest(this.activePlayer);
        const isBlocked = this.defender.tryBlock(this.activePlayer);

        if (isBlocked) {
          this.shotsAttempted++;
          this.streak = 0;
          this.showFeedback('✖ BLOCKED BY DEFENSE! ✖', 'late');
          this.updateHUD();
        } else {
          const shotResult = this.activePlayer.releaseShot(contest.contestValue);
          if (shotResult) {
            this.shotsAttempted++;
            this.evaluateRelease(shotResult, contest);
          }
        }
        this.hideShotMeter();
      },
      // 3. Pass button action
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

  // Pass ball from Active Player to Teammate
  handlePass() {
    sounds.init();
    if (!this.activePlayer || !this.activePlayer.hasBall) return;
    if (this.ball.state !== BallState.DRIBBLE) return;

    const fromPos = this.activePlayer.position.clone();
    fromPos.y += 1.2; // Chest release height
    const toPos = this.inactivePlayer.position.clone();

    this.activePlayer.hasBall = false;
    this.showFeedback('🏀 PASS!', 'good');

    this.ball.pass(fromPos, toPos, () => {
      // Pass arrived at teammate! Switch active control
      this.inactivePlayer.isActive = true;
      this.inactivePlayer.hasBall = true;
      this.activePlayer.isActive = false;
      this.activePlayer.hasBall = false;

      // Swap pointers
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
  }

  showShotMeter() {
    if (this.shotMeterContainer) {
      this.shotMeterContainer.classList.remove('hidden');
    }
  }

  hideShotMeter() {
    if (this.shotMeterContainer) {
      this.shotMeterContainer.classList.add('hidden');
      if (this.shotMeterFill) {
        this.shotMeterFill.style.height = '0%';
        this.shotMeterFill.className = 'meter-fill';
      }
    }
  }

  updateShotMeter() {
    if (!this.activePlayer || !this.activePlayer.isChargingShot || !this.shotMeterFill) return;

    const ratio = Math.min(1.0, this.activePlayer.shotChargeTime / this.activePlayer.idealShotDuration);
    this.shotMeterFill.style.height = `${ratio * 100}%`;

    // Dynamic color feedback
    if (ratio < 0.75) {
      this.shotMeterFill.className = 'meter-fill early';
    } else if (ratio >= 0.90 && ratio <= 1.05) {
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
    } else if (shotResult.timingQuality > 0.7) {
      msg = `🟡 GOOD TIMING [${contest.label}]`;
      type = 'good';
    } else if (shotResult.chargeRatio < 0.8) {
      msg = `🔴 SLIGHTLY EARLY [${contest.label}]`;
      type = 'early';
    } else {
      msg = `🔴 SLIGHTLY LATE [${contest.label}]`;
      type = 'late';
    }

    this.showFeedback(msg, type);
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

    // Reset shot clock on score
    this.shotClock = 24.0;

    let scoreMsg = result.isThree ? `🔥 3-POINTER MADE! (+3)` : `🏀 BUCKET! (+2)`;
    if (result.isGreen) {
      scoreMsg += ` ★ PERFECT SWISH! ★`;
    }
    this.showFeedback(scoreMsg, result.isGreen ? 'green' : 'good');
    this.updateHUD();
  }

  updateHUD() {
    if (this.scoreEl) this.scoreEl.innerText = this.score;
    if (this.streakEl) this.streakEl.innerText = this.streak;
    if (this.fgPctEl) {
      const pct = this.shotsAttempted > 0 ? Math.round((this.shotsMade / this.shotsAttempted) * 100) : 0;
      this.fgPctEl.innerText = `${pct}%`;
    }
  }

  updateShotClock(delta) {
    if (!this.shotClockActive) return;

    // Countdown only while ball is in possession or passing
    if (this.ball.state === BallState.DRIBBLE || this.ball.state === BallState.PASSING) {
      this.shotClock = Math.max(0, this.shotClock - delta);

      if (this.shotClockEl) {
        this.shotClockEl.innerText = this.shotClock.toFixed(1);
        if (this.shotClock <= 5.0) {
          this.shotClockEl.style.color = '#ff3d00'; // Warning Red
        } else {
          this.shotClockEl.style.color = '#ffd700'; // Normal Gold
        }
      }

      // Violation Check
      if (this.shotClock <= 0) {
        this.shotClock = 24.0;
        this.streak = 0;
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

    this.defender.resetPosition();
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

    // 2. Update Active & Inactive Players
    this.activePlayer.update(delta, input, this.inactivePlayer.position);
    this.inactivePlayer.update(delta, {}, this.activePlayer.position);

    // 3. Update Defender AI (Focuses on Active Ballhandler)
    this.defender.update(delta, this.activePlayer);

    // 4. Update Basketball Physics
    this.ball.update(delta, this.activePlayer);

    // 5. Update Shot Clock
    this.updateShotClock(delta);

    // 6. Update HUD Shot Meter
    this.updateShotMeter();

    // 7. Update Camera Tracking
    this.updateCameraPosition();

    // 8. Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});

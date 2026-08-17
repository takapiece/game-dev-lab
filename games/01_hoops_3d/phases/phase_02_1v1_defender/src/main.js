import * as THREE from 'three';
import { BasketballCourt } from './court.js';
import { Basketball } from './ball.js';
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
    this.player = new Player(this.scene, this.court, this.ball);
    this.defender = new Defender(this.scene, this.court, this.ball);

    // Hook scoring event
    this.ball.onScoreCallback = (result) => {
      this.handleScore(result);
    };
  }

  initControls() {
    this.controls = new InputController(
      () => {
        // Shot start
        sounds.init();
        this.player.startShot();
        this.showShotMeter();
      },
      () => {
        // Shot release
        const contest = this.defender.calculateContest(this.player);
        const isBlocked = this.defender.tryBlock(this.player);

        if (isBlocked) {
          this.shotsAttempted++;
          this.streak = 0;
          this.showFeedback('✖ BLOCKED BY DEFENSE! ✖', 'late');
          this.updateHUD();
        } else {
          const shotResult = this.player.releaseShot(contest.contestValue);
          if (shotResult) {
            this.shotsAttempted++;
            this.evaluateRelease(shotResult, contest);
          }
        }
        this.hideShotMeter();
      },
      () => {
        // Toggle camera
        this.toggleCamera();
      },
      () => {
        // Reset player & defender positions
        this.player.resetPosition();
        this.defender.resetPosition();
      }
    );
  }

  initUI() {
    this.scoreValEl = document.getElementById('score-value');
    this.streakValEl = document.getElementById('streak-value');
    this.fgPctEl = document.getElementById('fg-pct');
    this.shotMeterEl = document.getElementById('shot-meter');
    this.meterFillEl = document.getElementById('meter-fill');
    this.feedbackBannerEl = document.getElementById('feedback-banner');
    this.camModeTextEl = document.getElementById('cam-mode-text');

    // Start / Manual Modal Elements
    this.startModalEl = document.getElementById('start-modal');
    this.btnStartGameEl = document.getElementById('btn-start-game');
    this.btnOpenHelpEl = document.getElementById('btn-help');
    this.btnCloseHelpEl = document.getElementById('btn-close-help');

    if (this.btnStartGameEl && this.startModalEl) {
      const startGame = () => {
        sounds.init();
        sounds.resume();
        this.startModalEl.classList.add('hidden');
      };
      this.btnStartGameEl.addEventListener('click', startGame);
      this.btnStartGameEl.addEventListener('touchstart', startGame, { passive: true });
    }

    if (this.btnOpenHelpEl && this.startModalEl) {
      this.btnOpenHelpEl.addEventListener('click', () => {
        this.startModalEl.classList.remove('hidden');
      });
    }

    if (this.btnCloseHelpEl && this.startModalEl) {
      this.btnCloseHelpEl.addEventListener('click', () => {
        this.startModalEl.classList.add('hidden');
      });
    }
  }

  toggleCamera() {
    this.cameraIndex = (this.cameraIndex + 1) % this.cameraModes.length;
    this.cameraMode = this.cameraModes[this.cameraIndex];
    if (this.camModeTextEl) {
      this.camModeTextEl.innerText = this.cameraMode.toUpperCase();
    }
  }

  updateCameraPosition(instant = false) {
    if (!this.player) return;
    const pPos = this.player.position;
    const targetPos = new THREE.Vector3();

    if (this.cameraMode === 'broadcast') {
      // Classic 2K Sideline Broadcast Angle
      targetPos.set(pPos.x * 0.4 + 7.5, 5.2, pPos.z * 0.4 + 6.5);
      this.cameraTarget.set(pPos.x * 0.3, 1.8, -2.5 + pPos.z * 0.2);
    } else if (this.cameraMode === 'follow') {
      // Over the shoulder 3rd person
      const backward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.player.rotation
      );
      targetPos.copy(pPos).addScaledVector(backward, 3.8);
      targetPos.y += 2.2;
      this.cameraTarget.set(pPos.x, 1.6, pPos.z - 3);
    } else if (this.cameraMode === 'high') {
      // Top High Angle
      targetPos.set(pPos.x * 0.3, 10.5, pPos.z * 0.3 + 4.5);
      this.cameraTarget.set(pPos.x * 0.2, 0.5, -3);
    }

    if (instant) {
      this.camera.position.copy(targetPos);
    } else {
      this.camera.position.lerp(targetPos, 0.08);
    }
    this.camera.lookAt(this.cameraTarget);
  }

  showShotMeter() {
    if (this.shotMeterEl) {
      this.shotMeterEl.classList.add('visible');
    }
  }

  hideShotMeter() {
    if (this.shotMeterEl) {
      setTimeout(() => {
        this.shotMeterEl.classList.remove('visible');
      }, 250);
    }
  }

  evaluateRelease(shotResult, contest) {
    const ratio = shotResult.chargeRatio;
    let timingLabel = 'GOOD';
    let labelClass = 'good';

    if (shotResult.isGreen) {
      timingLabel = '★ PERFECT RELEASE ★';
      labelClass = 'green';
    } else if (ratio < 0.75) {
      timingLabel = 'VERY EARLY';
      labelClass = 'early';
    } else if (ratio < 0.92) {
      timingLabel = 'SLIGHTLY EARLY';
      labelClass = 'good';
    } else if (ratio > 1.25) {
      timingLabel = 'VERY LATE';
      labelClass = 'late';
    } else {
      timingLabel = 'SLIGHTLY LATE';
      labelClass = 'good';
    }

    const contestText = contest ? ` [${contest.label}]` : '';
    const fullText = `${timingLabel}${contestText}`;
    
    // Use contest class if it was heavily contested, otherwise timing class
    const finalClass = (contest && contest.percent > 45 && !shotResult.isGreen) ? contest.labelClass : labelClass;

    this.showFeedback(fullText, finalClass);
  }

  showFeedback(text, typeClass) {
    if (!this.feedbackBannerEl) return;
    this.feedbackBannerEl.innerText = text;
    this.feedbackBannerEl.className = `feedback-banner show ${typeClass}`;

    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      this.feedbackBannerEl.classList.remove('show');
    }, 1800);
  }

  handleScore(result) {
    const points = result.isThree ? 3 : 2;
    this.score += points;
    this.streak++;
    this.shotsMade++;

    if (result.isGreen) {
      this.showFeedback(
        `SWISH! ${result.isThree ? '3-POINTER' : '2-POINTER'} (+${points} PTS)`,
        'green'
      );
    } else {
      this.showFeedback(
        `MADE SHOT! +${points} PTS`,
        'good'
      );
    }

    this.updateHUD();
  }

  updateHUD() {
    if (this.scoreValEl) this.scoreValEl.innerText = this.score;
    if (this.streakValEl) this.streakValEl.innerText = `${this.streak} 🔥`;
    if (this.fgPctEl && this.shotsAttempted > 0) {
      const pct = Math.round((this.shotsMade / this.shotsAttempted) * 100);
      this.fgPctEl.innerText = `${pct}% (${this.shotsMade}/${this.shotsAttempted})`;
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.05);

    // 1. Update Controls & Player
    const input = this.controls.update();
    this.player.update(delta, input);

    // 2. Update AI Defender
    if (this.defender) {
      this.defender.update(delta, this.player);
    }

    // 3. Update Shot Meter fill bar during charging
    if (this.player.isChargingShot && this.meterFillEl) {
      const ratio = Math.min(1.0, this.player.shotChargeTime / (this.player.idealShotDuration * 1.35));
      this.meterFillEl.style.width = `${ratio * 100}%`;

      // Color indicator (Yellow -> Green around idealShotDuration -> Red)
      const idealRatio = this.player.shotChargeTime / this.player.idealShotDuration;
      if (idealRatio >= 0.92 && idealRatio <= 1.08) {
        this.meterFillEl.style.backgroundColor = '#00ff66';
        this.meterFillEl.style.boxShadow = '0 0 12px #00ff66';
      } else if (idealRatio > 1.15) {
        this.meterFillEl.style.backgroundColor = '#ff3333';
        this.meterFillEl.style.boxShadow = '0 0 8px #ff3333';
      } else {
        this.meterFillEl.style.backgroundColor = '#ffcc00';
        this.meterFillEl.style.boxShadow = '0 0 8px #ffcc00';
      }
    }

    // 4. Update Ball Physics
    this.ball.update(delta, this.player);

    // 5. Update Camera position & track player
    this.updateCameraPosition();

    // 6. Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Start Game on page load
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});

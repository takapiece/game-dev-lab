import * as THREE from 'three';
import { sounds } from './audio.js';

export const BallState = {
  DRIBBLE: 'dribble',
  IN_AIR: 'in_air',
  PASSING: 'passing',
  FREE_BOUNCE: 'free_bounce',
  SCORED: 'scored',
};

export class Basketball {
  constructor(scene, court) {
    this.scene = scene;
    this.court = court;
    this.radius = 0.125; // Standard basketball radius ~12cm
    this.state = BallState.DRIBBLE;

    // Physics vectors
    this.position = new THREE.Vector3(0, this.radius, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotationAxis = new THREE.Vector3(1, 0, 0);
    this.rotationSpeed = 0;

    // Passing
    this.passTargetPos = new THREE.Vector3();
    this.passDuration = 0;
    this.passTimer = 0;
    this.onCatchCallback = null;

    // Scoring & shot tracking
    this.isShotAttempt = false;
    this.shotQuality = 0; // 0..1 (1.0 = perfect green)
    this.contestFactor = 0; // 0.0 (wide open) to 1.0 (smothered)
    this.isBlocked = false;
    this.isThreePointer = false;
    this.hasHitRim = false;
    this.hasHitBackboard = false;
    this.hasScoredThisShot = false;
    this.onScoreCallback = null;

    this.initMesh();
  }

  initMesh() {
    // Procedural Basketball Texture with standard 8-panel black ribs
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Leather orange base
    ctx.fillStyle = '#d95b18';
    ctx.fillRect(0, 0, 512, 256);

    // Subtle leather pebble texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 256;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Black Seams
    ctx.strokeStyle = '#18120e';
    ctx.lineWidth = 6;

    // Horizontal equator
    ctx.beginPath();
    ctx.moveTo(0, 128);
    ctx.lineTo(512, 128);
    ctx.stroke();

    // Vertical meridian
    ctx.beginPath();
    ctx.moveTo(128, 0);
    ctx.lineTo(128, 256);
    ctx.moveTo(384, 0);
    ctx.lineTo(384, 256);
    ctx.stroke();

    // Curved ribs
    ctx.beginPath();
    ctx.arc(256, 128, 90, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    const geo = new THREE.SphereGeometry(this.radius, 24, 24);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.45,
      metalness: 0.05,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
  }

  shoot(origin, timingQuality, isThree = false, contestFactor = 0) {
    this.state = BallState.IN_AIR;
    this.isShotAttempt = true;
    this.contestFactor = contestFactor;
    this.isBlocked = false;
    this.hasHitRim = false;
    this.hasHitBackboard = false;
    this.hasScoredThisShot = false;
    this.isThreePointer = isThree;

    // Effective shot quality degraded by defensive contest
    const degradedQuality = Math.max(0, timingQuality - contestFactor * 0.35);
    this.shotQuality = degradedQuality;

    this.position.copy(origin);
    this.mesh.position.copy(this.position);

    // Calculate arc to hoop
    const target = this.court.hoopPosition.clone();
    
    // Clean green or wide-open good shots go directly to center
    const isCleanGreen = (timingQuality >= 0.88 && contestFactor < 0.4) || (timingQuality >= 0.75 && contestFactor < 0.15);
    const deviationMax = 0.18 + contestFactor * 0.22; // Much tighter spread
    const errorFactor = Math.pow(1.0 - degradedQuality, 1.3);
    const deviationX = (Math.random() - 0.5) * 2 * deviationMax * errorFactor;
    const deviationZ = (Math.random() - 0.5) * 2 * deviationMax * errorFactor;
    
    // Add small deviation only if not a clean shot
    if (!isCleanGreen) {
      target.x += deviationX;
      target.z += deviationZ;
    }

    const gravity = -18.5; // m/s^2
    const dx = target.x - origin.x;
    const dz = target.z - origin.z;
    const distXZ = Math.sqrt(dx * dx + dz * dz);

    // Desired apex height based on distance
    const peakHeight = Math.max(origin.y, target.y) + Math.min(2.5 + distXZ * 0.25, 4.2);
    const h1 = peakHeight - origin.y;
    const h2 = peakHeight - target.y;

    const tUp = Math.sqrt(Math.max(0.01, (2 * h1) / -gravity));
    const tDown = Math.sqrt(Math.max(0.01, (2 * h2) / -gravity));
    const totalTime = tUp + tDown;

    const vy = -gravity * tUp;
    const vx = dx / totalTime;
    const vz = dz / totalTime;

    this.velocity.set(vx, vy, vz);

    // Shot backspin
    this.rotationAxis.set(1, 0, 0);
    this.rotationSpeed = -12.0;
  }

  // Chest / Bounce Pass to Teammate
  pass(origin, target, onCatch = null) {
    this.state = BallState.PASSING;
    this.isShotAttempt = false;
    this.isBlocked = false;
    this.onCatchCallback = onCatch;

    this.position.copy(origin);
    this.mesh.position.copy(this.position);

    // Target is teammate's chest height (~1.15m)
    this.passTargetPos.copy(target);
    this.passTargetPos.y = 1.15;

    const dx = this.passTargetPos.x - origin.x;
    const dz = this.passTargetPos.z - origin.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Fast pass duration (0.28s to 0.42s depending on distance)
    this.passDuration = Math.min(0.45, Math.max(0.25, dist / 16.0));
    this.passTimer = 0;

    // Slight parabolic arc
    const gravity = -18.5;
    const dy = this.passTargetPos.y - origin.y;
    const vy = (dy - 0.5 * gravity * this.passDuration * this.passDuration) / this.passDuration;
    const vx = dx / this.passDuration;
    const vz = dz / this.passDuration;

    this.velocity.set(vx, vy, vz);
    this.rotationAxis.set(0, 1, 0);
    this.rotationSpeed = 8.0;
  }

  // Steal / Turnover fumble
  steal(stealerPosition) {
    this.isShotAttempt = false;
    this.state = BallState.IN_AIR;

    const awayDir = this.position.clone().sub(stealerPosition);
    awayDir.y = 0;
    awayDir.normalize();

    this.velocity.set(
      awayDir.x * 2.5 + (Math.random() - 0.5) * 1.5,
      1.8 + Math.random() * 1.5,
      awayDir.z * 2.5 + (Math.random() - 0.5) * 1.5
    );

    this.rotationAxis.set(Math.random(), Math.random(), Math.random()).normalize();
    this.rotationSpeed = 15.0;

    sounds.playSteal();
  }

  // Deflect/block ball trajectory when swatted by defender
  block(blockerPosition) {
    this.isShotAttempt = false; // Negate scoring chance
    this.isBlocked = true;
    this.state = BallState.IN_AIR;

    // Vector away from blocker
    const swatDir = this.position.clone().sub(blockerPosition);
    swatDir.y = 0;
    swatDir.normalize();

    // Deflect downwards/sideways with random spin
    this.velocity.set(
      swatDir.x * 3.5 + (Math.random() - 0.5) * 2.5,
      Math.random() * 2.0 - 2.5, // downward swat
      swatDir.z * 3.5 + (Math.random() - 0.5) * 2.5
    );

    this.rotationAxis.set(Math.random(), Math.random(), Math.random()).normalize();
    this.rotationSpeed = 20.0;

    sounds.playBlock();
  }

  update(delta, player) {
    if (this.state === BallState.DRIBBLE) {
      // Dribble position is updated directly by active player animation
      return;
    }

    if (this.state === BallState.PASSING) {
      this.passTimer += delta;
      const gravity = -18.5;
      this.velocity.y += gravity * delta;
      this.position.addScaledVector(this.velocity, delta);
      this.mesh.position.copy(this.position);

      // Check if pass arrived at receiver
      if (this.passTimer >= this.passDuration) {
        this.position.copy(this.passTargetPos);
        this.mesh.position.copy(this.position);
        this.state = BallState.DRIBBLE;
        sounds.playCatch();
        if (this.onCatchCallback) {
          this.onCatchCallback();
          this.onCatchCallback = null;
        }
      }
      return;
    }

    if (this.state === BallState.IN_AIR || this.state === BallState.FREE_BOUNCE || this.state === BallState.SCORED) {
      const gravity = -18.5;
      this.velocity.y += gravity * delta;

      // Update position
      this.position.addScaledVector(this.velocity, delta);

      // Backspin / Roll
      this.mesh.rotateOnAxis(this.rotationAxis, this.rotationSpeed * delta);

      // 1. Check Floor Collision
      if (this.position.y <= this.radius) {
        this.position.y = this.radius;
        if (Math.abs(this.velocity.y) > 0.8) {
          this.velocity.y = -this.velocity.y * 0.68; // Floor bounce restitution
          this.velocity.x *= 0.8;
          this.velocity.z *= 0.8;
          sounds.playBounce(Math.min(1.0, Math.abs(this.velocity.y) / 4.0));
        } else {
          this.velocity.set(0, 0, 0);
          this.state = BallState.FREE_BOUNCE;
        }
      }

      // 2. Check Backboard Collision (z ≈ -6.85, x in [-0.9, 0.9], y in [2.8, 3.8])
      const bbZ = this.court.backboardZ;
      if (
        Math.abs(this.position.z - bbZ) < this.radius + 0.04 &&
        Math.abs(this.position.x) < 0.9 &&
        this.position.y >= 2.75 &&
        this.position.y <= 3.85
      ) {
        if (!this.hasHitBackboard) {
          this.hasHitBackboard = true;
          sounds.playBackboard();
          this.velocity.z = Math.abs(this.velocity.z) * 0.55; // Rebound forward
          this.velocity.x += (this.position.x * 0.4);
          this.velocity.y *= 0.75;
        }
      }

      // 3. Check Hoop & Rim Collision
      const hoopPos = this.court.hoopPosition;
      const distToHoopCenterXZ = Math.sqrt(
        Math.pow(this.position.x - hoopPos.x, 2) + Math.pow(this.position.z - hoopPos.z, 2)
      );

      // Shooter's Touch (Soft Rim Magnetic Attraction for good shots)
      if (
        this.isShotAttempt &&
        !this.hasScoredThisShot &&
        this.velocity.y < 0 &&
        this.position.y <= hoopPos.y + 0.35 &&
        this.position.y >= hoopPos.y - 0.2 &&
        distToHoopCenterXZ < this.court.rimRadius * 1.35
      ) {
        if (this.shotQuality >= 0.55) {
          // Gently pull towards hoop center
          const pullStrength = Math.min(1.0, (this.shotQuality - 0.45) * 4.0);
          this.position.x += (hoopPos.x - this.position.x) * delta * 4.5 * pullStrength;
          this.position.z += (hoopPos.z - this.position.z) * delta * 4.5 * pullStrength;
        }
      }

      // Re-evaluate distance after soft attraction
      const currentDistXZ = Math.sqrt(
        Math.pow(this.position.x - hoopPos.x, 2) + Math.pow(this.position.z - hoopPos.z, 2)
      );

      // A) Score / Net Entry Detection (Generous 0.95 rim radius)
      if (
        this.isShotAttempt &&
        !this.hasScoredThisShot &&
        this.position.y <= hoopPos.y + 0.15 &&
        this.position.y >= hoopPos.y - 0.32 &&
        this.velocity.y < 0 &&
        currentDistXZ < this.court.rimRadius * 0.96
      ) {
        this.hasScoredThisShot = true;
        this.state = BallState.SCORED;
        sounds.playSwish();
        sounds.playCheer();

        // Slow ball slightly as it travels through net
        this.velocity.x *= 0.15;
        this.velocity.z *= 0.15;
        this.velocity.y *= 0.55;

        if (this.onScoreCallback) {
          this.onScoreCallback({
            isThree: this.isThreePointer,
            quality: this.shotQuality,
            isGreen: this.shotQuality >= 0.88,
            hasHitRim: this.hasHitRim,
          });
        }
      }

      // B) Steel Rim Collision
      const distFromRimCircle = Math.abs(currentDistXZ - this.court.rimRadius);
      if (
        distFromRimCircle < this.radius + 0.025 &&
        Math.abs(this.position.y - hoopPos.y) < this.radius + 0.04
      ) {
        if (!this.hasHitRim) {
          this.hasHitRim = true;
          sounds.playRim();

          if (this.shotQuality >= 0.65 && Math.random() < 0.65) {
            // Soft Friendly Roll: Drop into basket instead of hard reject
            this.velocity.x *= 0.25;
            this.velocity.z *= 0.25;
            this.velocity.y = -0.8;
          } else {
            // Elastic bounce off rim torus
            const normalX = (this.position.x - hoopPos.x) / (currentDistXZ || 1);
            const normalZ = (this.position.z - hoopPos.z) / (currentDistXZ || 1);

            this.velocity.x += normalX * 1.5;
            this.velocity.z += normalZ * 1.5;
            this.velocity.y = Math.abs(this.velocity.y) * 0.45 + 1.2;
          }
        }
      }

      this.mesh.position.copy(this.position);
    }
  }

  resetToPlayer(player) {
    this.state = BallState.DRIBBLE;
    this.isShotAttempt = false;
    this.velocity.set(0, 0, 0);
  }
}

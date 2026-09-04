import * as THREE from 'three';
import { sounds } from './audio.js';
import { BallState } from './ball.js';

export const PlayerAction = {
  IDLE: 'idle',
  RUN: 'run',
  GATHER: 'gather', // Charging shot
  JUMP_SHOOT: 'jump_shoot',
  LANDING: 'landing',
};

export class Player {
  constructor(scene, court, ball, options = {}) {
    this.scene = scene;
    this.court = court;
    this.ball = ball;

    // Role & Appearance Options
    this.name = options.name || 'Player';
    this.jerseyColorHex = options.jerseyColor !== undefined ? options.jerseyColor : 0x552583; // Default Lakers Purple
    this.trimColorHex = options.trimColor !== undefined ? options.trimColor : 0xfdb927; // Default Lakers Gold
    this.jerseyNumber = options.jerseyNumber || '23';
    this.isActive = options.isActive !== undefined ? options.isActive : true; // Controlled by user or AI
    this.hasBall = options.hasBall !== undefined ? options.hasBall : true;
    this.defaultSpawn = options.spawnPos ? options.spawnPos.clone() : new THREE.Vector3(0, 0, 0);

    // Movement & Stats Attributes
    this.stats = options.stats || { threePt: 85, speed: 85, defense: 85 };
    this.isOnFire = false;

    this.position = this.defaultSpawn.clone();
    this.velocity = new THREE.Vector3();
    this.rotation = Math.PI; // Face towards basket (-Z)
    this.targetRotation = Math.PI;
    this.sprintMultiplier = 1.45;
    this.updateStatsValues();

    // State machine
    this.action = PlayerAction.IDLE;
    this.isChargingShot = false;
    this.shotChargeTime = 0;
    this.idealShotDuration = 0.55; // Optimal release timing in seconds
    this.jumpProgress = 0;
    this.jumpHeight = 0.75;

    // Dribble animation state
    this.dribbleTimer = 0;
    this.justBounced = false;

    // Step audio timing
    this.stepTimer = 0;

    // Off-ball AI Spacing
    this.spacingTarget = new THREE.Vector3();
    this.aiReactionTimer = Math.random() * 0.3;

    this.initMesh();
    this.resetPosition();
  }

  resetPosition(spawnPos = null) {
    if (spawnPos) {
      this.position.copy(spawnPos);
    } else {
      this.position.copy(this.defaultSpawn);
    }
    this.velocity.set(0, 0, 0);
    this.rotation = Math.PI;
    this.targetRotation = Math.PI;
    this.action = PlayerAction.IDLE;
    this.isChargingShot = false;
    this.shotChargeTime = 0;
    this.jumpProgress = 0;
    this.group.position.set(this.position.x, 0, this.position.z);
    this.group.rotation.y = this.rotation;

    if (this.hasBall) {
      this.ball.resetToPlayer(this);
    }
  }

  initMesh() {
    this.group = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x8d5524,
      roughness: 0.5,
    });
    this.jerseyMat = new THREE.MeshStandardMaterial({
      color: this.jerseyColorHex,
      roughness: 0.4,
    });
    this.trimMat = new THREE.MeshStandardMaterial({
      color: this.trimColorHex,
      roughness: 0.35,
    });
    const shoesMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.3,
    });

    // 1. Head & Headband
    const headGeo = new THREE.SphereGeometry(0.14, 16, 16);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.82;
    this.head.castShadow = true;
    this.group.add(this.head);

    const headbandGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.04, 16);
    const headband = new THREE.Mesh(headbandGeo, this.trimMat);
    headband.position.y = 1.84;
    this.group.add(headband);

    // 2. Torso / Jersey
    const torsoGeo = new THREE.BoxGeometry(0.42, 0.55, 0.24);
    this.torso = new THREE.Mesh(torsoGeo, this.jerseyMat);
    this.torso.position.y = 1.38;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Number & Stripe
    const stripeGeo = new THREE.BoxGeometry(0.43, 0.05, 0.25);
    const stripe = new THREE.Mesh(stripeGeo, this.trimMat);
    stripe.position.y = 1.48;
    this.group.add(stripe);

    // 3. Arms & Hands
    this.rightArm = new THREE.Group();
    const rArmUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 8), skinMat);
    rArmUpper.position.y = -0.16;
    this.rightArm.add(rArmUpper);
    this.rightArm.position.set(0.26, 1.58, 0);
    this.group.add(this.rightArm);

    this.leftArm = new THREE.Group();
    const lArmUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 8), skinMat);
    lArmUpper.position.y = -0.16;
    this.leftArm.add(lArmUpper);
    this.leftArm.position.set(-0.26, 1.58, 0);
    this.group.add(this.leftArm);

    // 4. Shorts
    const shortsGeo = new THREE.BoxGeometry(0.44, 0.32, 0.26);
    this.shorts = new THREE.Mesh(shortsGeo, this.jerseyMat);
    this.shorts.position.y = 0.95;
    this.shorts.castShadow = true;
    this.group.add(this.shorts);

    // 5. Legs & Basketball Sneakers
    this.rightLeg = new THREE.Group();
    const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.55, 8), skinMat);
    rLegMesh.position.y = -0.27;
    rLegMesh.castShadow = true;
    this.rightLeg.add(rLegMesh);
    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.26), shoesMat);
    rShoe.position.set(0, -0.52, 0.05);
    this.rightLeg.add(rShoe);
    this.rightLeg.position.set(0.14, 0.8, 0);
    this.group.add(this.rightLeg);

    this.leftLeg = new THREE.Group();
    const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.55, 8), skinMat);
    lLegMesh.position.y = -0.27;
    lLegMesh.castShadow = true;
    this.leftLeg.add(lLegMesh);
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.26), shoesMat);
    lShoe.position.set(0, -0.52, 0.05);
    this.leftLeg.add(lShoe);
    this.leftLeg.position.set(-0.14, 0.8, 0);
    this.group.add(this.leftLeg);

    // 6. Ground Indicator Ring (Gold for User, Cyan for Pass Target)
    const ringGeo = new THREE.RingGeometry(0.55, 0.65, 32);
    this.ringMat = new THREE.MeshBasicMaterial({
      color: 0xfdb927,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    this.indicatorRing = new THREE.Mesh(ringGeo, this.ringMat);
    this.indicatorRing.rotation.x = -Math.PI / 2;
    this.indicatorRing.position.y = 0.02;
    this.group.add(this.indicatorRing);

    this.scene.add(this.group);
  }

  updateStatsValues() {
    const baseSpeed = 3.6 + ((this.stats?.speed || 85) / 100) * 1.8;
    this.speed = baseSpeed * (this.isOnFire ? 1.22 : 1.0);

    const baseTolerance = 0.25 + ((this.stats?.threePt || 85) / 100) * 0.16;
    this.shotTolerance = baseTolerance * (this.isOnFire ? 1.45 : 1.0);
  }

  setOnFire(onFire) {
    this.isOnFire = onFire;
    this.updateStatsValues();
  }

  setPlayerProfile(profile) {
    if (!profile) return;
    this.name = profile.name;
    this.jerseyNumber = profile.number;
    this.stats = profile.stats || this.stats;

    if (profile.jerseyColor !== undefined) {
      this.jerseyColorHex = profile.jerseyColor;
      if (this.jerseyMat) this.jerseyMat.color.setHex(this.jerseyColorHex);
    }
    if (profile.trimColor !== undefined) {
      this.trimColorHex = profile.trimColor;
      if (this.trimMat) this.trimMat.color.setHex(this.trimColorHex);
    }
    this.updateStatsValues();
  }

  // Handle start of shot button press
  startShot() {
    if (!this.isActive || !this.hasBall) return;
    if (this.action === PlayerAction.JUMP_SHOOT || this.ball.state !== BallState.DRIBBLE) return;
    this.isChargingShot = true;
    this.shotChargeTime = 0;
    this.action = PlayerAction.GATHER;
  }

  // Handle release of shot button
  releaseShot(contestFactor = 0) {
    if (!this.isChargingShot) return;
    this.isChargingShot = false;

    // Calculate timing quality (0.0 to 1.0) with player-specific shotTolerance
    const error = Math.abs(this.shotChargeTime - this.idealShotDuration);
    const maxTolerance = this.shotTolerance || 0.35;
    const rawQuality = Math.max(0, 1.0 - error / maxTolerance);
    const timingQuality = Math.pow(rawQuality, 1.4);

    this.action = PlayerAction.JUMP_SHOOT;
    this.jumpProgress = 0;

    // Check if player is outside 3-point line
    const hoopPos = this.court.hoopPosition;
    const distToHoop = Math.sqrt(
      Math.pow(this.position.x - hoopPos.x, 2) + Math.pow(this.position.z - hoopPos.z, 2)
    );
    const isThree = distToHoop >= 6.75;

    // Sound chime if perfect green with light or no contest
    const isGreen = timingQuality >= 0.92 && contestFactor < 0.35;
    if (isGreen) {
      sounds.playGreenChime();
    }

    // Launch Ball from elevated hand position
    const releaseOrigin = this.position.clone();
    releaseOrigin.y += 2.4; // High release point
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
    releaseOrigin.addScaledVector(forward, 0.4);

    this.hasBall = false;
    this.ball.shoot(releaseOrigin, timingQuality, isThree, contestFactor);

    return {
      timingQuality,
      isGreen,
      chargeRatio: this.shotChargeTime / this.idealShotDuration,
      isThree,
      contestFactor,
    };
  }

  update(delta, input = {}, otherPlayerPos = null) {
    // 1. Update Indicator Ring Appearance
    if (this.isActive) {
      this.ringMat.color.setHex(0xfdb927); // Gold
      this.ringMat.opacity = 0.85;
      this.indicatorRing.rotation.z += delta * 2.0;
    } else {
      this.ringMat.color.setHex(0x00e676); // Green / Pass Target
      this.ringMat.opacity = 0.45 + Math.sin(Date.now() * 0.008) * 0.25;
    }

    // 2. Auto Ball Pick Up / Re-possession after shot or score
    if (this.ball.state === BallState.FREE_BOUNCE || this.ball.state === BallState.SCORED) {
      if (this.isActive) {
        this.freeBallTimer = (this.freeBallTimer || 0) + delta;
        const distToBall = this.position.distanceTo(this.ball.position);

        // Auto return ball to active shooter after brief floor bounce (0.75s) or if close
        if (this.freeBallTimer > 0.75 || distToBall < 1.4 || (this.freeBallTimer > 0.3 && this.ball.position.y < 0.25)) {
          this.hasBall = true;
          this.freeBallTimer = 0;
          this.ball.resetToPlayer(this);
        }
      }
    } else {
      this.freeBallTimer = 0;
    }

    // 3. Branch: Active User Controller vs Off-Ball AI Spacing
    if (this.isActive) {
      this.updateActiveUser(delta, input);
    } else {
      this.updateOffBallAI(delta, otherPlayerPos);
    }

    // 4. Position & Rotation sync to Three.js Group
    this.group.position.set(this.position.x, 0, this.position.z);
    this.group.rotation.y = this.rotation;

    // 5. Dribble Ball Animation Sync (Only if this player currently holds ball)
    if (this.hasBall && this.ball.state === BallState.DRIBBLE) {
      if (this.isChargingShot) {
        // Gather pose
        this.rightArm.rotation.x = -Math.PI * 0.45;
        this.leftArm.rotation.x = -Math.PI * 0.45;

        const chestPos = this.position.clone();
        chestPos.y = 1.35;
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        chestPos.addScaledVector(forward, 0.32);
        this.ball.position.copy(chestPos);
        this.ball.mesh.position.copy(chestPos);
      } else {
        // Dribbling
        const isMoving = this.action === PlayerAction.RUN;
        const dribbleRate = isMoving ? (input.sprint ? 14 : 10) : 7;
        this.dribbleTimer += delta * dribbleRate;

        this.rightArm.rotation.x = Math.sin(this.dribbleTimer) * 0.35 - 0.2;
        this.leftArm.rotation.x = 0;

        const bouncePhase = (Math.sin(this.dribbleTimer) + 1) / 2;
        const ballHeight = this.ball.radius + Math.pow(bouncePhase, 0.8) * 0.75;

        if (bouncePhase < 0.06 && !this.justBounced) {
          sounds.playBounce(0.7);
          this.justBounced = true;
        } else if (bouncePhase > 0.3) {
          this.justBounced = false;
        }

        const ballOffset = new THREE.Vector3(0.38, 0, 0.2).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          this.rotation
        );
        const currentBallPos = this.position.clone().add(ballOffset);
        currentBallPos.y = ballHeight;

        this.ball.position.copy(currentBallPos);
        this.ball.mesh.position.copy(currentBallPos);
      }
    }
  }

  // Active User Controlled Movement
  updateActiveUser(delta, input) {
    if (this.isChargingShot) {
      this.shotChargeTime += delta;
      if (this.shotChargeTime > 1.2) {
        this.releaseShot();
      }
    }

    if (this.action === PlayerAction.JUMP_SHOOT) {
      this.jumpProgress += delta * 2.8;
      const jumpPhase = Math.sin(Math.min(Math.PI, this.jumpProgress * Math.PI));
      this.group.position.y = jumpPhase * this.jumpHeight;

      this.rightArm.rotation.x = -Math.PI * 0.75;
      this.leftArm.rotation.x = -Math.PI * 0.65;

      if (this.jumpProgress >= 1.0) {
        this.group.position.y = 0;
        this.action = PlayerAction.IDLE;
        this.rightArm.rotation.x = 0;
        this.leftArm.rotation.x = 0;
      }
      return;
    }

    let moveX = input.moveX || 0;
    let moveZ = input.moveZ || 0;
    const isMoving = Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05;

    if (isMoving && !this.isChargingShot) {
      this.action = PlayerAction.RUN;
      const moveSpeed = this.speed * (input.sprint ? this.sprintMultiplier : 1.0);

      this.velocity.x = moveX * moveSpeed;
      this.velocity.z = moveZ * moveSpeed;

      this.position.x += this.velocity.x * delta;
      this.position.z += this.velocity.z * delta;

      // Boundary limits
      this.position.x = Math.max(-7.2, Math.min(7.2, this.position.x));
      this.position.z = Math.max(-7.2, Math.min(7.2, this.position.z));

      this.targetRotation = Math.atan2(moveX, moveZ);
      const angleDiff = (this.targetRotation - this.rotation + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      this.rotation += angleDiff * 14 * delta;

      this.stepTimer += delta * (input.sprint ? 12 : 8);
      if (this.stepTimer > Math.PI) {
        this.stepTimer = 0;
        if (Math.random() < 0.35) {
          sounds.playSqueak();
        }
      }

      const legPhase = Math.sin(Date.now() * 0.012);
      this.rightLeg.rotation.x = legPhase * 0.7;
      this.leftLeg.rotation.x = -legPhase * 0.7;
    } else {
      this.action = this.isChargingShot ? PlayerAction.GATHER : PlayerAction.IDLE;
      this.velocity.set(0, 0, 0);
      this.rightLeg.rotation.x = 0;
      this.leftLeg.rotation.x = 0;

      const dx = this.court.hoopPosition.x - this.position.x;
      const dz = this.court.hoopPosition.z - this.position.z;
      this.targetRotation = Math.atan2(dx, dz);
      const angleDiff = (this.targetRotation - this.rotation + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      this.rotation += angleDiff * 10 * delta;
    }
  }

  // Off-Ball Teammate Autonomous Spacing AI
  updateOffBallAI(delta, ballHandlerPos) {
    if (!ballHandlerPos) return;

    this.aiReactionTimer -= delta;
    if (this.aiReactionTimer <= 0) {
      this.aiReactionTimer = 0.25 + Math.random() * 0.15;

      // Calculate optimal spacing position: Opposite wing/corner outside 3pt line
      const hoop = this.court.hoopPosition;
      const handlerX = ballHandlerPos.x;

      // If ballhandler is on right (x > 0), spacing AI moves to left wing (x ≈ -4.5), and vice versa
      const targetSideX = handlerX > 0 ? -4.6 : 4.6;
      const targetZ = -2.2 + (Math.sin(Date.now() * 0.001) * 0.8); // Hover around 3pt wing arc

      this.spacingTarget.set(targetSideX, 0, targetZ);
    }

    const toTarget = this.spacingTarget.clone().sub(this.position);
    toTarget.y = 0;
    const distToTarget = toTarget.length();

    if (distToTarget > 0.4) {
      this.action = PlayerAction.RUN;
      toTarget.normalize();

      const aiMoveSpeed = 3.6;
      this.position.addScaledVector(toTarget, aiMoveSpeed * delta);

      // Rotate to move direction
      this.targetRotation = Math.atan2(toTarget.x, toTarget.z);
      const angleDiff = (this.targetRotation - this.rotation + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      this.rotation += angleDiff * 10 * delta;

      const legPhase = Math.sin(Date.now() * 0.01);
      this.rightLeg.rotation.x = legPhase * 0.6;
      this.leftLeg.rotation.x = -legPhase * 0.6;
    } else {
      this.action = PlayerAction.IDLE;
      this.rightLeg.rotation.x = 0;
      this.leftLeg.rotation.x = 0;

      // Face the ball handler ready to catch pass
      const toBall = ballHandlerPos.clone().sub(this.position);
      this.targetRotation = Math.atan2(toBall.x, toBall.z);
      const angleDiff = (this.targetRotation - this.rotation + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      this.rotation += angleDiff * 8 * delta;

      // Ready hands pose
      this.rightArm.rotation.x = -Math.PI * 0.25;
      this.leftArm.rotation.x = -Math.PI * 0.25;
    }
  }
}

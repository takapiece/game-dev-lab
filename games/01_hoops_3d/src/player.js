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
  constructor(scene, court, ball) {
    this.scene = scene;
    this.court = court;
    this.ball = ball;

    // Movement attributes
    this.position = new THREE.Vector3(0, 0, 0); // Center at top of key
    this.velocity = new THREE.Vector3();
    this.rotation = 0; // Facing angle (radians)
    this.targetRotation = 0;
    this.speed = 4.8;
    this.sprintMultiplier = 1.45;

    // State machine
    this.action = PlayerAction.IDLE;
    this.isChargingShot = false;
    this.shotChargeTime = 0;
    this.idealShotDuration = 0.55; // Optimal release timing in seconds
    this.jumpProgress = 0;
    this.jumpHeight = 0.75;

    // Dribble animation state
    this.dribbleTimer = 0;
    this.dribbleHand = 1; // 1 = right, -1 = left

    // Step audio timing
    this.stepTimer = 0;

    this.initMesh();
    this.resetPosition();
  }

  resetPosition() {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.rotation = Math.PI; // Face towards the basket (-Z direction)
    this.targetRotation = Math.PI;
    this.action = PlayerAction.IDLE;
    this.ball.resetToPlayer(this);
  }

  initMesh() {
    this.group = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x8d5524,
      roughness: 0.5,
    });
    const jerseyMat = new THREE.MeshStandardMaterial({
      color: 0x552583, // Lakers Purple #23
      roughness: 0.4,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfdb927, // Lakers Gold
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
    const headband = new THREE.Mesh(headbandGeo, goldMat);
    headband.position.y = 1.84;
    this.group.add(headband);

    // 2. Torso / Jersey
    const torsoGeo = new THREE.BoxGeometry(0.42, 0.55, 0.24);
    this.torso = new THREE.Mesh(torsoGeo, jerseyMat);
    this.torso.position.y = 1.38;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Number 23 & Stripe
    const stripeGeo = new THREE.BoxGeometry(0.43, 0.05, 0.25);
    const stripe = new THREE.Mesh(stripeGeo, goldMat);
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
    this.shorts = new THREE.Mesh(shortsGeo, jerseyMat);
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

    this.scene.add(this.group);
  }

  // Handle start of shot button press
  startShot() {
    if (this.action === PlayerAction.JUMP_SHOOT || this.ball.state !== BallState.DRIBBLE) return;
    this.isChargingShot = true;
    this.shotChargeTime = 0;
    this.action = PlayerAction.GATHER;
  }

  // Handle release of shot button
  releaseShot(contestFactor = 0) {
    if (!this.isChargingShot) return;
    this.isChargingShot = false;

    // Calculate timing quality (0.0 to 1.0)
    // 1.0 is exact match with idealShotDuration (0.55s)
    const error = Math.abs(this.shotChargeTime - this.idealShotDuration);
    const maxTolerance = 0.35;
    const rawQuality = Math.max(0, 1.0 - error / maxTolerance);
    // Exponential curve for rewarding precision
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

    this.ball.shoot(releaseOrigin, timingQuality, isThree, contestFactor);

    return {
      timingQuality,
      isGreen,
      chargeRatio: this.shotChargeTime / this.idealShotDuration,
      isThree,
      contestFactor,
    };
  }

  update(delta, input) {
    // 1. Check ball pickup if ball is free
    if (this.ball.state === BallState.FREE_BOUNCE || this.ball.state === BallState.SCORED) {
      const distToBall = this.position.distanceTo(this.ball.position);
      if (distToBall < 1.3 || this.ball.position.y < 0.2) {
        // Auto pick up ball
        this.ball.resetToPlayer(this);
      }
    }

    // 2. Shot Charging Update
    if (this.isChargingShot) {
      this.shotChargeTime += delta;
      // Auto release if held too long (forced late release)
      if (this.shotChargeTime > 1.2) {
        this.releaseShot();
      }
    }

    // 3. Jump Shot Animation Loop
    if (this.action === PlayerAction.JUMP_SHOOT) {
      this.jumpProgress += delta * 2.8;
      const jumpPhase = Math.sin(Math.min(Math.PI, this.jumpProgress * Math.PI));
      this.group.position.y = jumpPhase * this.jumpHeight;

      // Arms follow through pose
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

    // 4. Locomotion Movement (Keyboard / Joystick)
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

      // Boundary limits (Court boundaries)
      this.position.x = Math.max(-7.2, Math.min(7.2, this.position.x));
      this.position.z = Math.max(-7.2, Math.min(7.2, this.position.z));

      // Smooth Rotation to movement direction
      this.targetRotation = Math.atan2(moveX, moveZ);
      const angleDiff = (this.targetRotation - this.rotation + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      this.rotation += angleDiff * 14 * delta;

      // Sneaker Squeaks & Footsteps
      this.stepTimer += delta * (input.sprint ? 12 : 8);
      if (this.stepTimer > Math.PI) {
        this.stepTimer = 0;
        if (Math.random() < 0.4) {
          sounds.playSqueak();
        }
      }

      // Running Leg Swing Animation
      const legPhase = Math.sin(Date.now() * 0.012);
      this.rightLeg.rotation.x = legPhase * 0.7;
      this.leftLeg.rotation.x = -legPhase * 0.7;
    } else {
      this.action = this.isChargingShot ? PlayerAction.GATHER : PlayerAction.IDLE;
      this.velocity.set(0, 0, 0);
      this.rightLeg.rotation.x = 0;
      this.leftLeg.rotation.x = 0;

      // Face basket when idle or shooting
      const dx = this.court.hoopPosition.x - this.position.x;
      const dz = this.court.hoopPosition.z - this.position.z;
      this.targetRotation = Math.atan2(dx, dz);
      const angleDiff = (this.targetRotation - this.rotation + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      this.rotation += angleDiff * 10 * delta;
    }

    // Apply Player position & rotation
    this.group.position.set(this.position.x, 0, this.position.z);
    this.group.rotation.y = this.rotation;

    // 5. Dribble Ball Animation Sync
    if (this.ball.state === BallState.DRIBBLE) {
      if (this.isChargingShot) {
        // Gather pose: ball held in both hands at chest level
        this.rightArm.rotation.x = -Math.PI * 0.45;
        this.leftArm.rotation.x = -Math.PI * 0.45;

        const chestPos = this.position.clone();
        chestPos.y = 1.35;
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
        chestPos.addScaledVector(forward, 0.32);
        this.ball.position.copy(chestPos);
        this.ball.mesh.position.copy(chestPos);
      } else {
        // Active Dribbling Cycle
        const dribbleRate = isMoving ? (input.sprint ? 14 : 10) : 7;
        this.dribbleTimer += delta * dribbleRate;

        // Arm motion
        this.rightArm.rotation.x = Math.sin(this.dribbleTimer) * 0.35 - 0.2;
        this.leftArm.rotation.x = 0;

        // Parabolic bounce height
        const bouncePhase = (Math.sin(this.dribbleTimer) + 1) / 2; // 0..1
        const ballHeight = this.ball.radius + Math.pow(bouncePhase, 0.8) * 0.75;

        // Sound on floor contact
        if (bouncePhase < 0.06 && !this.justBounced) {
          sounds.playBounce(0.7);
          this.justBounced = true;
        } else if (bouncePhase > 0.3) {
          this.justBounced = false;
        }

        // Offset ball to right side of player
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
}

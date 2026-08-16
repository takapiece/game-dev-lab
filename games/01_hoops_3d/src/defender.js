import * as THREE from 'three';
import { sounds } from './audio.js';
import { PlayerAction } from './player.js';
import { BallState } from './ball.js';

export const DefenderState = {
  GUARD: 'guard',         // Marking player, sliding between player and hoop
  CONTEST: 'contest',     // Raising hands / jumping to contest shot
  REBOUND: 'rebound',     // Chasing free ball or rebound
  RECOVER: 'recover',     // Repositioning after play
};

export class Defender {
  constructor(scene, court, ball) {
    this.scene = scene;
    this.court = court;
    this.ball = ball;

    // Movement & Positioning
    this.position = new THREE.Vector3(0, 0, -2.2);
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.speed = 4.2; // Slightly agile to challenge player
    this.guardDistance = 1.65; // Optimal defensive cushion

    // State machine
    this.state = DefenderState.GUARD;
    this.stateTimer = 0;
    this.reactionDelay = 0.12; // Reaction delay in seconds before jumping to contest
    this.reactionTimer = 0;

    // Jump / Block physics
    this.jumpProgress = 0;
    this.jumpHeight = 0.85; // Defender has good vertical reach
    this.isJumping = false;

    // Animation timers
    this.slideTimer = 0;
    this.stepTimer = 0;

    this.initMesh();
    this.resetPosition();
  }

  resetPosition() {
    this.position.set(0, 0, -2.2);
    this.velocity.set(0, 0, 0);
    this.rotation = 0; // Face towards player (+Z direction)
    this.state = DefenderState.GUARD;
    this.jumpProgress = 0;
    this.isJumping = false;
    this.group.position.set(0, 0, -2.2);
  }

  initMesh() {
    this.group = new THREE.Group();

    // Materials - Bulls/Heat inspired Black & Crimson Theme
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x6e4321,
      roughness: 0.55,
    });
    const jerseyMat = new THREE.MeshStandardMaterial({
      color: 0xba131a, // Crimson Red
      roughness: 0.4,
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x181818, // Matte Black
      roughness: 0.35,
    });
    const shoesMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee, // White & Red Sneakers
      roughness: 0.25,
    });

    // 1. Head & Hair
    const headGeo = new THREE.SphereGeometry(0.14, 16, 16);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.84;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Black Headband
    const headbandGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.04, 16);
    const headband = new THREE.Mesh(headbandGeo, blackMat);
    headband.position.y = 1.86;
    this.group.add(headband);

    // 2. Torso / Jersey (Away Red #91)
    const torsoGeo = new THREE.BoxGeometry(0.44, 0.56, 0.24);
    this.torso = new THREE.Mesh(torsoGeo, jerseyMat);
    this.torso.position.y = 1.38;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Black Side Stripes
    const stripeGeo = new THREE.BoxGeometry(0.45, 0.06, 0.25);
    const stripe = new THREE.Mesh(stripeGeo, blackMat);
    stripe.position.y = 1.48;
    this.group.add(stripe);

    // 3. Long Wingspan Arms & Hands
    this.rightArm = new THREE.Group();
    const rArmUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.36, 8), skinMat);
    rArmUpper.position.y = -0.18;
    this.rightArm.add(rArmUpper);
    this.rightArm.position.set(0.28, 1.58, 0);
    this.group.add(this.rightArm);

    this.leftArm = new THREE.Group();
    const lArmUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.36, 8), skinMat);
    lArmUpper.position.y = -0.18;
    this.leftArm.add(lArmUpper);
    this.leftArm.position.set(-0.28, 1.58, 0);
    this.group.add(this.leftArm);

    // 4. Shorts
    const shortsGeo = new THREE.BoxGeometry(0.46, 0.34, 0.26);
    this.shorts = new THREE.Mesh(shortsGeo, blackMat);
    this.shorts.position.y = 0.95;
    this.shorts.castShadow = true;
    this.group.add(this.shorts);

    // 5. Legs & Sneakers
    this.rightLeg = new THREE.Group();
    const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.55, 8), skinMat);
    rLegMesh.position.y = -0.27;
    rLegMesh.castShadow = true;
    this.rightLeg.add(rLegMesh);
    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.26), shoesMat);
    rShoe.position.set(0, -0.52, 0.05);
    this.rightLeg.add(rShoe);
    this.rightLeg.position.set(0.15, 0.8, 0);
    this.group.add(this.rightLeg);

    this.leftLeg = new THREE.Group();
    const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.55, 8), skinMat);
    lLegMesh.position.y = -0.27;
    lLegMesh.castShadow = true;
    this.leftLeg.add(lLegMesh);
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.26), shoesMat);
    lShoe.position.set(0, -0.52, 0.05);
    this.leftLeg.add(lShoe);
    this.leftLeg.position.set(-0.15, 0.8, 0);
    this.group.add(this.leftLeg);

    this.scene.add(this.group);
  }

  // Calculate shot contest intensity (0.0 to 1.0) and description
  calculateContest(player) {
    const hoopPos = this.court.hoopPosition;
    const playerPos = player.position;
    const defPos = this.position;

    // 1. Distance between shooter and defender
    const distToShooter = playerPos.distanceTo(defPos);

    // 2. Alignment factor: Is defender between shooter and basket?
    const shooterToHoop = hoopPos.clone().sub(playerPos).setY(0).normalize();
    const shooterToDef = defPos.clone().sub(playerPos).setY(0).normalize();
    const alignment = Math.max(0, shooterToHoop.dot(shooterToDef)); // 1.0 = directly in front

    // 3. Hand / Jump contest factor (height bonus if jumping or raising hands)
    let handHeightFactor = 0.5; // Base standing hands-up
    if (this.isJumping) {
      handHeightFactor = 1.0; // Full jump block contest
    } else if (this.state === DefenderState.CONTEST) {
      handHeightFactor = 0.8;
    }

    // Distance decay: Max contest at <= 1.2m, drops to 0 at >= 3.8m
    const maxContestDist = 3.8;
    const minContestDist = 1.1;
    const distFactor = Math.max(0, Math.min(1.0, 1.0 - (distToShooter - minContestDist) / (maxContestDist - minContestDist)));

    // Combined contest percentage (0.0 to 1.0)
    let contest = distFactor * alignment * handHeightFactor;
    contest = Math.min(1.0, Math.max(0.0, contest));

    let label = 'WIDE OPEN';
    let labelClass = 'green';
    let percent = Math.round(contest * 100);

    if (percent < 12) {
      label = 'WIDE OPEN';
      labelClass = 'green';
    } else if (percent < 35) {
      label = `OPEN (${percent}%)`;
      labelClass = 'good';
    } else if (percent < 70) {
      label = `CONTESTED (${percent}%)`;
      labelClass = 'early';
    } else {
      label = `SMOTHERED (${percent}%)`;
      labelClass = 'late';
    }

    return {
      contestValue: contest,
      percent,
      label,
      labelClass,
      distToShooter,
    };
  }

  // Attempt a defensive block on a close-range shot
  tryBlock(player) {
    const contestInfo = this.calculateContest(player);
    
    // Block condition: Close distance (< 1.35m), high alignment (> 0.7), and defender jumping near peak
    if (
      contestInfo.distToShooter < 1.35 &&
      this.isJumping &&
      this.jumpProgress > 0.15 &&
      this.jumpProgress < 0.85
    ) {
      // 75% block probability if conditions are met
      if (Math.random() < 0.75) {
        this.ball.block(this.position);
        return true;
      }
    }
    return false;
  }

  update(delta, player) {
    const hoopPos = this.court.hoopPosition;
    const playerPos = player.position;

    // 1. Check AI State Transitions
    if (this.ball.state === BallState.FREE_BOUNCE || this.ball.state === BallState.SCORED) {
      this.state = DefenderState.REBOUND;
    } else if (player.isChargingShot || player.action === PlayerAction.JUMP_SHOOT) {
      if (this.state !== DefenderState.CONTEST) {
        this.state = DefenderState.CONTEST;
        this.reactionTimer = 0;
      }
    } else {
      this.state = DefenderState.GUARD;
    }

    // 2. State-Specific AI Behavior
    if (this.state === DefenderState.GUARD) {
      // Normal Defensive Stance
      this.isJumping = false;
      this.jumpProgress = 0;
      this.group.position.y = 0;

      // Defensive posture: Arms slightly flared out
      this.rightArm.rotation.x = -Math.PI * 0.2;
      this.rightArm.rotation.z = Math.PI * 0.35;
      this.leftArm.rotation.x = -Math.PI * 0.2;
      this.leftArm.rotation.z = -Math.PI * 0.35;

      // Calculate Target Guard Position (Between player and basket)
      const toHoop = hoopPos.clone().sub(playerPos).setY(0);
      const distToHoop = toHoop.length();
      toHoop.normalize();

      // Maintain cushion distance from player towards hoop
      const targetCushion = Math.min(this.guardDistance, Math.max(1.0, distToHoop * 0.45));
      const targetPos = playerPos.clone().addScaledVector(toHoop, targetCushion);
      targetPos.y = 0;

      // Move smoothly towards target position (with slight inertia)
      const moveDelta = targetPos.clone().sub(this.position);
      moveDelta.y = 0;
      const moveDist = moveDelta.length();

      if (moveDist > 0.08) {
        moveDelta.normalize();
        const moveSpeed = Math.min(this.speed, moveDist * 5.0);
        this.velocity.copy(moveDelta.multiplyScalar(moveSpeed));
        this.position.addScaledVector(this.velocity, delta);

        // Slide step animation
        this.slideTimer += delta * 12;
        this.rightLeg.rotation.x = Math.sin(this.slideTimer) * 0.4;
        this.leftLeg.rotation.x = -Math.sin(this.slideTimer) * 0.4;

        // Sneaker squeak during intense defensive sliding
        this.stepTimer += delta * 8;
        if (this.stepTimer > Math.PI * 1.5) {
          this.stepTimer = 0;
          if (Math.random() < 0.25) {
            sounds.playSqueak();
          }
        }
      } else {
        this.velocity.set(0, 0, 0);
        this.rightLeg.rotation.x = 0;
        this.leftLeg.rotation.x = 0;
      }

      // Always face the player
      const dx = playerPos.x - this.position.x;
      const dz = playerPos.z - this.position.z;
      this.rotation = Math.atan2(dx, dz);

    } else if (this.state === DefenderState.CONTEST) {
      // Shooter is gathering or in air!
      this.reactionTimer += delta;

      // Trigger jump contest after reaction delay
      if (this.reactionTimer >= this.reactionDelay && !this.isJumping) {
        this.isJumping = true;
        this.jumpProgress = 0;
      }

      if (this.isJumping) {
        this.jumpProgress += delta * 2.6;
        const jumpPhase = Math.sin(Math.min(Math.PI, this.jumpProgress * Math.PI));
        this.group.position.y = jumpPhase * this.jumpHeight;

        // Hands straight up in the air to contest/block
        this.rightArm.rotation.x = -Math.PI * 0.85;
        this.rightArm.rotation.z = Math.PI * 0.15;
        this.leftArm.rotation.x = -Math.PI * 0.85;
        this.leftArm.rotation.z = -Math.PI * 0.15;

        // Drift slightly towards player during contest jump
        const forwardToPlayer = playerPos.clone().sub(this.position).setY(0).normalize();
        this.position.addScaledVector(forwardToPlayer, delta * 0.8);

        if (this.jumpProgress >= 1.0) {
          this.isJumping = false;
          this.group.position.y = 0;
        }
      } else {
        // Hands up high while on ground
        this.rightArm.rotation.x = -Math.PI * 0.7;
        this.rightArm.rotation.z = Math.PI * 0.2;
        this.leftArm.rotation.x = -Math.PI * 0.7;
        this.leftArm.rotation.z = -Math.PI * 0.2;
      }

      // Face shooter
      const dx = playerPos.x - this.position.x;
      const dz = playerPos.z - this.position.z;
      this.rotation = Math.atan2(dx, dz);

    } else if (this.state === DefenderState.REBOUND) {
      // Move towards bouncing ball
      this.isJumping = false;
      this.group.position.y = 0;
      this.rightArm.rotation.set(0, 0, 0);
      this.leftArm.rotation.set(0, 0, 0);

      const targetPos = this.ball.position.clone();
      targetPos.y = 0;
      const toBall = targetPos.sub(this.position);
      const dist = toBall.length();

      if (dist > 0.4) {
        toBall.normalize();
        this.position.addScaledVector(toBall, this.speed * 0.85 * delta);
        this.rotation = Math.atan2(toBall.x, toBall.z);

        const legPhase = Math.sin(Date.now() * 0.012);
        this.rightLeg.rotation.x = legPhase * 0.6;
        this.leftLeg.rotation.x = -legPhase * 0.6;
      }
    }

    // Court boundary limits
    this.position.x = Math.max(-7.2, Math.min(7.2, this.position.x));
    this.position.z = Math.max(-7.2, Math.min(7.2, this.position.z));

    // Apply 3D Transform
    this.group.position.x = this.position.x;
    this.group.position.z = this.position.z;
    this.group.rotation.y = this.rotation;
  }
}

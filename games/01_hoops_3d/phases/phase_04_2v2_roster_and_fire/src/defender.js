import * as THREE from 'three';
import { sounds } from './audio.js';
import { PlayerAction } from './player.js';
import { BallState } from './ball.js';

export const DefenderState = {
  GUARD: 'guard',         // Marking assigned player
  HELP: 'help',           // Helping in the paint against driving ballhandler
  CONTEST: 'contest',     // Raising hands / jumping to contest shot
  INTERCEPT: 'intercept', // Rushing to cut pass trajectory
  REBOUND: 'rebound',     // Chasing free ball or rebound
};

export class Defender {
  constructor(scene, court, ball, options = {}) {
    this.scene = scene;
    this.court = court;
    this.ball = ball;

    // Attributes & Profile
    this.name = options.name || 'Defender';
    this.jerseyNumber = options.number || '91';
    this.jerseyColorHex = options.jerseyColor !== undefined ? options.jerseyColor : 0xba131a; // Bulls Red
    this.trimColorHex = options.trimColor !== undefined ? options.trimColor : 0x181818; // Black trim
    this.defaultSpawn = options.spawnPos ? options.spawnPos.clone() : new THREE.Vector3(0, 0, -2.2);
    this.stats = options.stats || { speed: 90, defense: 92 };

    // Movement & Positioning
    this.position = this.defaultSpawn.clone();
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.speed = 3.8 + (this.stats.speed / 100) * 1.6; // 5.2m/s
    this.guardDistance = 1.65; // Optimal defensive cushion

    // State machine
    this.state = DefenderState.GUARD;
    this.reactionDelay = 0.12;
    this.reactionTimer = 0;

    // Jump / Block physics
    this.jumpProgress = 0;
    this.jumpHeight = 0.85;
    this.isJumping = false;

    // Steal cooldown
    this.stealCooldown = 0;

    // Animation timers
    this.slideTimer = 0;
    this.stepTimer = 0;

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
    this.rotation = 0; // Face towards player (+Z direction)
    this.state = DefenderState.GUARD;
    this.jumpProgress = 0;
    this.isJumping = false;
    this.stealCooldown = 0;
    this.group.position.set(this.position.x, 0, this.position.z);
  }

  initMesh() {
    this.group = new THREE.Group();

    // Materials - Bulls inspired Black & Crimson Theme
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x6e4321,
      roughness: 0.55,
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
      color: 0xeeeeee,
      roughness: 0.25,
    });

    // 1. Head & Hair
    const headGeo = new THREE.SphereGeometry(0.14, 16, 16);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.84;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Headband
    const headbandGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.04, 16);
    const headband = new THREE.Mesh(headbandGeo, this.trimMat);
    headband.position.y = 1.86;
    this.group.add(headband);

    // 2. Torso / Jersey
    const torsoGeo = new THREE.BoxGeometry(0.44, 0.56, 0.24);
    this.torso = new THREE.Mesh(torsoGeo, this.jerseyMat);
    this.torso.position.y = 1.38;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Side Stripe
    const stripeGeo = new THREE.BoxGeometry(0.45, 0.06, 0.25);
    const stripe = new THREE.Mesh(stripeGeo, this.trimMat);
    stripe.position.y = 1.48;
    this.group.add(stripe);

    // 3. Arms & Hands (Long wingspan)
    this.rightArm = new THREE.Group();
    const rArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.38, 8), skinMat);
    rArmMesh.position.y = -0.19;
    this.rightArm.add(rArmMesh);
    this.rightArm.position.set(0.28, 1.58, 0);
    this.group.add(this.rightArm);

    this.leftArm = new THREE.Group();
    const lArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.38, 8), skinMat);
    lArmMesh.position.y = -0.19;
    this.leftArm.add(lArmMesh);
    this.leftArm.position.set(-0.28, 1.58, 0);
    this.group.add(this.leftArm);

    // 4. Shorts
    const shortsGeo = new THREE.BoxGeometry(0.46, 0.34, 0.26);
    this.shorts = new THREE.Mesh(shortsGeo, this.trimMat);
    this.shorts.position.y = 0.95;
    this.shorts.castShadow = true;
    this.group.add(this.shorts);

    // 5. Legs & Sneakers
    this.rightLeg = new THREE.Group();
    const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.58, 8), skinMat);
    rLegMesh.position.y = -0.29;
    rLegMesh.castShadow = true;
    this.rightLeg.add(rLegMesh);
    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.28), shoesMat);
    rShoe.position.set(0, -0.54, 0.05);
    this.rightLeg.add(rShoe);
    this.rightLeg.position.set(0.15, 0.8, 0);
    this.group.add(this.rightLeg);

    this.leftLeg = new THREE.Group();
    const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.58, 8), skinMat);
    lLegMesh.position.y = -0.29;
    lLegMesh.castShadow = true;
    this.leftLeg.add(lLegMesh);
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.28), shoesMat);
    lShoe.position.set(0, -0.54, 0.05);
    this.leftLeg.add(lShoe);
    this.leftLeg.position.set(-0.15, 0.8, 0);
    this.group.add(this.leftLeg);

    this.scene.add(this.group);
  }

  // Calculate shot contest intensity (0.0 to 1.0)
  calculateContest(player) {
    const hoopPos = this.court.hoopPosition;
    const playerPos = player.position;
    const defPos = this.position;

    const distToShooter = playerPos.distanceTo(defPos);

    const shooterToHoop = hoopPos.clone().sub(playerPos).setY(0).normalize();
    const shooterToDef = defPos.clone().sub(playerPos).setY(0).normalize();
    const alignment = Math.max(0, shooterToHoop.dot(shooterToDef));

    let handHeightFactor = 0.5;
    if (this.isJumping) {
      handHeightFactor = 1.0;
    } else if (this.state === DefenderState.CONTEST) {
      handHeightFactor = 0.8;
    }

    const maxContestDist = 3.8;
    const minContestDist = 1.1;
    const distFactor = Math.max(0, Math.min(1.0, 1.0 - (distToShooter - minContestDist) / (maxContestDist - minContestDist)));

    const defSkillBonus = (this.stats.defense / 100);
    let contest = distFactor * alignment * handHeightFactor * (0.8 + defSkillBonus * 0.4);
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
    if (
      contestInfo.distToShooter < 1.45 &&
      this.isJumping &&
      this.jumpProgress > 0.15 &&
      this.jumpProgress < 0.85
    ) {
      const blockRate = 0.65 + (this.stats.defense / 100) * 0.25;
      if (Math.random() < blockRate) {
        this.ball.block(this.position);
        return true;
      }
    }
    return false;
  }

  // On-Ball Dribble Steal check
  checkSteal(activePlayer) {
    if (this.stealCooldown > 0) return false;
    if (!activePlayer || !activePlayer.hasBall || this.ball.state !== BallState.DRIBBLE) return false;

    const dist = this.position.distanceTo(activePlayer.position);
    if (dist < 0.95) {
      this.stealCooldown = 1.2;
      const stealRate = 0.4 + (this.stats.defense / 100) * 0.3;
      if (Math.random() < stealRate) {
        activePlayer.hasBall = false;
        this.ball.steal(this.position);
        return true;
      }
    }
    return false;
  }

  // Pass Cut / Interception check
  checkPassCut(ball) {
    if (ball.state !== BallState.PASSING) return false;

    const distToBall = this.position.distanceTo(ball.position);
    if (distToBall < 1.0 && ball.position.y < 2.0) {
      ball.steal(this.position);
      return true;
    }
    return false;
  }

  // 2v2 Coordinated AI Update
  update(delta, ballHandler, offBallPlayer, isHelpRole = false) {
    if (this.stealCooldown > 0) {
      this.stealCooldown -= delta;
    }

    const hoopPos = this.court.hoopPosition;
    const targetPlayer = isHelpRole ? (offBallPlayer || ballHandler) : ballHandler;
    const playerPos = targetPlayer.position;

    // 1. State Transitions
    if (this.ball.state === BallState.FREE_BOUNCE || this.ball.state === BallState.SCORED) {
      this.state = DefenderState.REBOUND;
    } else if (this.ball.state === BallState.PASSING) {
      this.state = DefenderState.INTERCEPT;
    } else if (ballHandler.isChargingShot || ballHandler.action === PlayerAction.JUMP_SHOOT) {
      // Contest if close to shooter
      if (this.position.distanceTo(ballHandler.position) < 3.2) {
        if (this.state !== DefenderState.CONTEST) {
          this.state = DefenderState.CONTEST;
          this.reactionTimer = 0;
        }
      } else {
        this.state = DefenderState.GUARD;
      }
    } else if (isHelpRole && ballHandler.position.distanceTo(hoopPos) < 4.2 && ballHandler.position.z < -1.0) {
      // Help defense in paint against driving ballhandler
      this.state = DefenderState.HELP;
    } else {
      this.state = DefenderState.GUARD;
    }

    // 2. State-Specific AI Behavior
    if (this.state === DefenderState.GUARD || this.state === DefenderState.HELP) {
      this.isJumping = false;
      this.jumpProgress = 0;
      this.group.position.y = 0;

      // Defensive posture
      this.rightArm.rotation.x = -Math.PI * 0.2;
      this.rightArm.rotation.z = Math.PI * 0.35;
      this.leftArm.rotation.x = -Math.PI * 0.2;
      this.leftArm.rotation.z = -Math.PI * 0.35;

      let targetPos;

      if (this.state === DefenderState.HELP) {
        // Drop into key between driving ballhandler and hoop
        const toHoop = hoopPos.clone().sub(ballHandler.position).setY(0).normalize();
        targetPos = ballHandler.position.clone().addScaledVector(toHoop, 1.2);
      } else {
        // Normal guard positioning
        const toHoop = hoopPos.clone().sub(playerPos).setY(0);
        const distToHoop = toHoop.length();
        toHoop.normalize();

        const cushion = isHelpRole ? 2.2 : Math.min(this.guardDistance, Math.max(1.0, distToHoop * 0.45));
        targetPos = playerPos.clone().addScaledVector(toHoop, cushion);
      }

      targetPos.y = 0;

      const moveDelta = targetPos.clone().sub(this.position);
      moveDelta.y = 0;
      const moveDist = moveDelta.length();

      if (moveDist > 0.05) {
        moveDelta.normalize();
        const moveSpeed = Math.min(this.speed, moveDist * 6.5);
        this.velocity.copy(moveDelta.multiplyScalar(moveSpeed));
        this.position.addScaledVector(this.velocity, delta);

        this.slideTimer += delta * 14;
        this.rightLeg.rotation.x = Math.sin(this.slideTimer) * 0.4;
        this.leftLeg.rotation.x = -Math.sin(this.slideTimer) * 0.4;

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

      // Face current mark or ballhandler
      const faceTarget = (this.state === DefenderState.HELP) ? ballHandler.position : playerPos;
      const dx = faceTarget.x - this.position.x;
      const dz = faceTarget.z - this.position.z;
      this.rotation = Math.atan2(dx, dz);

      // Steal check against ballhandler if in reach
      if (this.position.distanceTo(ballHandler.position) < 1.0) {
        this.checkSteal(ballHandler);
      }

    } else if (this.state === DefenderState.INTERCEPT) {
      const toBall = this.ball.position.clone().sub(this.position);
      toBall.y = 0;
      if (toBall.length() > 0.2) {
        toBall.normalize();
        this.position.addScaledVector(toBall, this.speed * 1.1 * delta);
        this.rotation = Math.atan2(toBall.x, toBall.z);
      }
      this.rightArm.rotation.x = -Math.PI * 0.5;
      this.leftArm.rotation.x = -Math.PI * 0.5;

      this.checkPassCut(this.ball);

    } else if (this.state === DefenderState.CONTEST) {
      this.reactionTimer += delta;

      if (this.reactionTimer >= this.reactionDelay && !this.isJumping) {
        this.isJumping = true;
        this.jumpProgress = 0;
      }

      if (this.isJumping) {
        this.jumpProgress += delta * 2.6;
        const jumpPhase = Math.sin(Math.min(Math.PI, this.jumpProgress * Math.PI));
        this.group.position.y = jumpPhase * this.jumpHeight;

        this.rightArm.rotation.x = -Math.PI * 0.85;
        this.rightArm.rotation.z = Math.PI * 0.15;
        this.leftArm.rotation.x = -Math.PI * 0.85;
        this.leftArm.rotation.z = -Math.PI * 0.15;

        const forwardToShooter = ballHandler.position.clone().sub(this.position).setY(0).normalize();
        this.position.addScaledVector(forwardToShooter, delta * 0.8);

        if (this.jumpProgress >= 1.0) {
          this.isJumping = false;
          this.group.position.y = 0;
        }
      } else {
        this.rightArm.rotation.x = -Math.PI * 0.7;
        this.rightArm.rotation.z = Math.PI * 0.2;
        this.leftArm.rotation.x = -Math.PI * 0.7;
        this.leftArm.rotation.z = -Math.PI * 0.2;
      }

      const dx = ballHandler.position.x - this.position.x;
      const dz = ballHandler.position.z - this.position.z;
      this.rotation = Math.atan2(dx, dz);

    } else if (this.state === DefenderState.REBOUND) {
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

    // Court boundaries
    this.position.x = Math.max(-7.2, Math.min(7.2, this.position.x));
    this.position.z = Math.max(-7.2, Math.min(7.2, this.position.z));

    this.group.position.x = this.position.x;
    this.group.position.z = this.position.z;
    this.group.rotation.y = this.rotation;
  }
}

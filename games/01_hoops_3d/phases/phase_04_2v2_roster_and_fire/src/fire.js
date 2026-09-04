import * as THREE from 'three';

export class FireEffect {
  constructor(scene, count = 60) {
    this.scene = scene;
    this.count = count;
    this.active = false;

    this.particles = [];
    this.initMesh();
  }

  initMesh() {
    // Procedural Circular Glow Sprite Texture (no external image needed)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 180, 20, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 50, 0, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100; // Hidden initially
      positions[i * 3 + 2] = 0;

      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.4;
      colors[i * 3 + 2] = 0.1;

      sizes[i] = 0.2 + Math.random() * 0.25;

      this.particles.push({
        vx: (Math.random() - 0.5) * 0.8,
        vy: 1.5 + Math.random() * 2.2, // Upward floating velocity
        vz: (Math.random() - 0.5) * 0.8,
        life: Math.random(), // 0..1
        maxLife: 0.4 + Math.random() * 0.3,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.45,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  setActive(active) {
    this.active = active;
    if (!active) {
      // Hide all particles below floor
      const posAttr = this.points.geometry.attributes.position;
      for (let i = 0; i < this.count; i++) {
        posAttr.array[i * 3 + 1] = -100;
      }
      posAttr.needsUpdate = true;
    }
  }

  update(delta, targetPosition) {
    if (!this.active || !targetPosition) return;

    const posAttr = this.points.geometry.attributes.position;
    const colAttr = this.points.geometry.attributes.color;

    for (let i = 0; i < this.count; i++) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        // Respawn particle at target base
        p.life = 0;
        p.maxLife = 0.35 + Math.random() * 0.3;

        const offsetRad = 0.35;
        posAttr.array[i * 3] = targetPosition.x + (Math.random() - 0.5) * offsetRad;
        posAttr.array[i * 3 + 1] = targetPosition.y + 0.1 + Math.random() * 0.3;
        posAttr.array[i * 3 + 2] = targetPosition.z + (Math.random() - 0.5) * offsetRad;

        p.vx = (Math.random() - 0.5) * 0.6;
        p.vy = 1.6 + Math.random() * 2.0;
        p.vz = (Math.random() - 0.5) * 0.6;
      } else {
        // Float upwards and drift
        posAttr.array[i * 3] += p.vx * delta;
        posAttr.array[i * 3 + 1] += p.vy * delta;
        posAttr.array[i * 3 + 2] += p.vz * delta;

        // Color shifts from yellow-white to red to dark as it cools
        const progress = p.life / p.maxLife; // 0..1
        colAttr.array[i * 3] = 1.0;
        colAttr.array[i * 3 + 1] = Math.max(0, 0.9 - progress * 0.85); // Yellow fades to red
        colAttr.array[i * 3 + 2] = Math.max(0, 0.4 - progress * 0.4);
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }
}

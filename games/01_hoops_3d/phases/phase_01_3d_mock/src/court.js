import * as THREE from 'three';

export class BasketballCourt {
  constructor(scene) {
    this.scene = scene;
    this.hoopPosition = new THREE.Vector3(0, 3.05, -6.5); // Center of rim
    this.rimRadius = 0.25;
    this.backboardZ = -6.85;
    this.init();
  }

  init() {
    this.createFloor();
    this.createHoop();
    this.createArenaEnvironment();
  }

  // Procedural Wood Court with lines texture
  createFloor() {
    const width = 16;
    const length = 16;

    // Create high-res canvas texture for court markings
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Wood floor background gradient & planks
    const woodGrad = ctx.createLinearGradient(0, 0, 0, 2048);
    woodGrad.addColorStop(0, '#c68b59');
    woodGrad.addColorStop(0.5, '#b97a47');
    woodGrad.addColorStop(1, '#c68b59');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, 0, 2048, 2048);

    // Subtle wood planks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.035)';
    for (let y = 0; y < 2048; y += 16) {
      if (Math.sin(y * 0.1) > 0) {
        ctx.fillRect(0, y, 2048, 8);
      }
    }

    // Paint Area (The Key) - NBA Style Dark Mahogany/Navy accent
    const courtCenterX = 1024;
    const baselineY = 2048 - 180; // Baseline is near bottom of half-court texture

    // Key dimensions on canvas
    const keyWidth = 480;
    const keyHeight = 700;
    const keyLeft = courtCenterX - keyWidth / 2;
    const keyTop = baselineY - keyHeight;

    // Filled paint key
    ctx.fillStyle = '#9e472a';
    ctx.fillRect(keyLeft, keyTop, keyWidth, keyHeight);

    // Free throw circle
    ctx.beginPath();
    ctx.arc(courtCenterX, keyTop, keyWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#8f3e24';
    ctx.fill();

    // Restricted area arc (under basket)
    const hoopCanvasY = baselineY - 140;
    ctx.beginPath();
    ctx.arc(courtCenterX, hoopCanvasY, 140, Math.PI, 0, false);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Court Lines (Crisp White)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;

    // Perimeter boundary line
    ctx.strokeRect(100, 100, 1848, 1848);

    // Paint / Key outline
    ctx.strokeRect(keyLeft, keyTop, keyWidth, keyHeight);

    // Free Throw Circle outline
    ctx.beginPath();
    ctx.arc(courtCenterX, keyTop, keyWidth / 2, 0, Math.PI * 2);
    ctx.stroke();

    // 3-Point Arc
    const threePtRadius = 820;
    const cornerLineLength = 280;

    // Left straight corner 3
    ctx.beginPath();
    ctx.moveTo(courtCenterX - 720, baselineY);
    ctx.lineTo(courtCenterX - 720, baselineY - cornerLineLength);
    ctx.stroke();

    // Right straight corner 3
    ctx.beginPath();
    ctx.moveTo(courtCenterX + 720, baselineY);
    ctx.lineTo(courtCenterX + 720, baselineY - cornerLineLength);
    ctx.stroke();

    // Arc connecting corners
    ctx.beginPath();
    ctx.arc(courtCenterX, hoopCanvasY, threePtRadius, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();

    // Center court half circle
    ctx.beginPath();
    ctx.arc(courtCenterX, 100, 240, 0, Math.PI);
    ctx.stroke();

    // Court Logo at center
    ctx.font = 'bold 70px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillText('★ HOOPS ARENA ★', courtCenterX, baselineY - 450);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floorMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.25,
      metalness: 0.1,
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.floorMesh = floor;

    // Surrounding black arena floor border
    const borderGeo = new THREE.PlaneGeometry(36, 36);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.8,
    });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.set(0, -0.01, 0);
    border.receiveShadow = true;
    this.scene.add(border);
  }

  // 3D Basketball Hoop Assembly
  createHoop() {
    this.hoopGroup = new THREE.Group();

    // 1. Heavy padded stanchion base
    const baseGeo = new THREE.BoxGeometry(1.2, 1.4, 1.4);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1a233a, // Deep navy padding
      roughness: 0.6,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 0.7, -8.4);
    base.castShadow = true;
    this.hoopGroup.add(base);

    // 2. Main angled support boom arm
    const armGeo = new THREE.CylinderGeometry(0.09, 0.11, 3.6, 16);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x2c3440,
      metalness: 0.8,
      roughness: 0.2,
    });
    const arm = new THREE.Mesh(armGeo, metalMat);
    arm.position.set(0, 2.5, -7.6);
    arm.rotation.x = 0.55;
    arm.castShadow = true;
    this.hoopGroup.add(arm);

    // 3. Backboard (Clear tempered glass with white/orange border)
    const bbWidth = 1.8;
    const bbHeight = 1.05;
    const bbThickness = 0.04;

    const bbGeo = new THREE.BoxGeometry(bbWidth, bbHeight, bbThickness);
    const bbMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      transmission: 0.7,
      thickness: 0.2,
      reflectivity: 0.9,
    });
    const backboard = new THREE.Mesh(bbGeo, bbMat);
    backboard.position.set(0, 3.3, this.backboardZ);
    backboard.castShadow = true;
    this.hoopGroup.add(backboard);
    this.backboardMesh = backboard;

    // Backboard inner target square & outer frame
    const frameGeo = new THREE.BoxGeometry(0.59, 0.45, 0.02);
    const frameEdges = new THREE.EdgesGeometry(frameGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff3b14, linewidth: 3 });
    const targetBox = new THREE.LineSegments(frameEdges, lineMat);
    targetBox.position.set(0, 3.22, this.backboardZ + 0.03);
    this.hoopGroup.add(targetBox);

    // 4. Solid Steel Orange Rim
    const rimRadius = this.rimRadius;
    const tubeRadius = 0.022;
    const rimGeo = new THREE.TorusGeometry(rimRadius, tubeRadius, 16, 32);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xff4d00, // Vibrant orange
      metalness: 0.85,
      roughness: 0.2,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.copy(this.hoopPosition);
    rim.castShadow = true;
    this.hoopGroup.add(rim);
    this.rimMesh = rim;

    // Rim bracket connecting to backboard
    const bracketGeo = new THREE.BoxGeometry(0.12, 0.06, 0.22);
    const bracket = new THREE.Mesh(bracketGeo, rimMat);
    bracket.position.set(0, 3.05, -6.74);
    this.hoopGroup.add(bracket);

    // 5. White Braided Net
    const netGeo = new THREE.CylinderGeometry(rimRadius * 0.98, rimRadius * 0.55, 0.45, 16, 6, true);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(this.hoopPosition.x, this.hoopPosition.y - 0.22, this.hoopPosition.z);
    this.hoopGroup.add(net);
    this.netMesh = net;

    this.scene.add(this.hoopGroup);
  }

  // Arena Lighting and Background Environment
  createArenaEnvironment() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    // Main stadium overhead floodlights (with soft shadows)
    const mainLight = new THREE.DirectionalLight(0xfff7ea, 1.4);
    mainLight.position.set(6, 16, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 35;
    mainLight.shadow.camera.left = -12;
    mainLight.shadow.camera.right = 12;
    mainLight.shadow.camera.top = 12;
    mainLight.shadow.camera.bottom = -12;
    mainLight.shadow.bias = -0.0005;
    this.scene.add(mainLight);

    // Rim accent rimlight from behind basket
    const backRimLight = new THREE.DirectionalLight(0x7da4ff, 0.7);
    backRimLight.position.set(-6, 12, -12);
    this.scene.add(backRimLight);

    // Warm court spotlight
    const courtSpot = new THREE.SpotLight(0xffe8c2, 1.2, 28, Math.PI / 3.5, 0.4);
    courtSpot.position.set(0, 14, 0);
    courtSpot.target.position.set(0, 0, -2);
    this.scene.add(courtSpot);
    this.scene.add(courtSpot.target);
  }
}

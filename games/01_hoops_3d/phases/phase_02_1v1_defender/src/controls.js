export class InputController {
  constructor(onShotStart, onShotRelease, onCameraToggle, onReset) {
    this.moveX = 0;
    this.moveZ = 0;
    this.sprint = false;
    this.isShooting = false;

    this.onShotStart = onShotStart;
    this.onShotRelease = onShotRelease;
    this.onCameraToggle = onCameraToggle;
    this.onReset = onReset;

    this.keys = {};
    this.initKeyboard();
    this.initTouchControls();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if ((e.code === 'Space' || e.code === 'KeyJ') && !e.repeat) {
        e.preventDefault();
        this.isShooting = true;
        if (this.onShotStart) this.onShotStart();
      }

      if (e.code === 'KeyC' && !e.repeat) {
        if (this.onCameraToggle) this.onCameraToggle();
      }

      if (e.code === 'KeyR' && !e.repeat) {
        if (this.onReset) this.onReset();
      }

      if ((e.code === 'Escape' || e.code === 'KeyM') && !e.repeat) {
        window.location.href = '../../index.html';
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;

      if (e.code === 'Space' || e.code === 'KeyJ') {
        e.preventDefault();
        this.isShooting = false;
        if (this.onShotRelease) this.onShotRelease();
      }
    });
  }

  initTouchControls() {
    // Virtual Joystick container
    const joystickZone = document.getElementById('joystick-zone');
    const joystickThumb = document.getElementById('joystick-thumb');
    const shootBtn = document.getElementById('btn-shoot');
    const sprintBtn = document.getElementById('btn-sprint');
    const camBtn = document.getElementById('btn-camera');
    const resetBtn = document.getElementById('btn-reset');

    if (!joystickZone || !joystickThumb) return;

    let touchId = null;
    let startX = 0;
    let startY = 0;
    const maxRadius = 45;

    joystickZone.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        const rect = joystickZone.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
      },
      { passive: false }
    );

    window.addEventListener(
      'touchmove',
      (e) => {
        if (touchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === touchId) {
            let dx = touch.clientX - startX;
            let dy = touch.clientY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > maxRadius) {
              dx = (dx / dist) * maxRadius;
              dy = (dy / dist) * maxRadius;
            }

            joystickThumb.style.transform = `translate(${dx}px, ${dy}px)`;

            // Normalize input -1 to 1 (Y inverted for 3D Z-axis)
            this.touchMoveX = dx / maxRadius;
            this.touchMoveZ = dy / maxRadius;
          }
        }
      },
      { passive: false }
    );

    const resetJoystick = (e) => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          joystickThumb.style.transform = `translate(0px, 0px)`;
          this.touchMoveX = 0;
          this.touchMoveZ = 0;
        }
      }
    };

    window.addEventListener('touchend', resetJoystick);
    window.addEventListener('touchcancel', resetJoystick);

    // Mobile Action Buttons
    if (shootBtn) {
      // Pointer Events でマウス・タッチ・ペンを同じ入力として扱います。
      // setPointerCapture により、押した指がボタン外へずれても pointerup を受け取れます。
      const startShot = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        if (this.isShooting) return;

        this.isShooting = true;
        shootBtn.classList.add('active');
        if (shootBtn.setPointerCapture) {
          shootBtn.setPointerCapture(e.pointerId);
        }
        if (this.onShotStart) this.onShotStart();
      };

      const releaseShot = (e) => {
        if (!this.isShooting) return;
        if (e?.preventDefault) e.preventDefault();

        this.isShooting = false;
        shootBtn.classList.remove('active');
        if (this.onShotRelease) this.onShotRelease();
      };

      shootBtn.addEventListener('pointerdown', startShot);
      shootBtn.addEventListener('pointerup', releaseShot);
      shootBtn.addEventListener('pointercancel', releaseShot);
      shootBtn.addEventListener('lostpointercapture', releaseShot);
      window.addEventListener('blur', releaseShot);
    }

    if (sprintBtn) {
      sprintBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchSprint = true;
        sprintBtn.classList.add('active');
      });
      sprintBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.touchSprint = false;
        sprintBtn.classList.remove('active');
      });
    }

    if (camBtn) {
      camBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.onCameraToggle) this.onCameraToggle();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.onReset) this.onReset();
      });
    }
  }

  update() {
    let x = 0;
    let z = 0;

    // Keyboard inputs (WASD / Arrows)
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) z -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) z += 1;

    // Normalize diagonal keyboard speed
    const len = Math.sqrt(x * x + z * z);
    if (len > 0) {
      x /= len;
      z /= len;
    }

    // Combine with touch joystick
    if (this.touchMoveX || this.touchMoveZ) {
      x = this.touchMoveX || 0;
      z = this.touchMoveZ || 0;
    }

    this.moveX = x;
    this.moveZ = z;
    this.sprint = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touchSprint);

    return {
      moveX: this.moveX,
      moveZ: this.moveZ,
      sprint: this.sprint,
      isShooting: this.isShooting,
    };
  }
}

// ===== DICE-3D.JS - Three.js Realistic 3D Dice =====
// Simplified and reliable dice rotation

class Dice3D {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.dice = null;
    this.isRolling = false;
    this.result = 0;
    this.onRollComplete = null;
    this.animationId = null;
    this.destroyed = false;

    this._init();
  }

  _init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded');
      return;
    }

    // Scene
    this.scene = new THREE.Scene();

    // Camera - Top-down view
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(0, 6, 0); // Looking from above
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0);

    const w = this.container.clientWidth || 400;
    const h = this.container.clientHeight || 400;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.container.appendChild(this.renderer.domElement);

    // Lighting
    this._setupLights();

    // Create dice
    this._createDice();

    // Start render loop
    this._animate();

    // Handle resize
    this._resizeObserver = new ResizeObserver(() => {
      if (this.destroyed) return;
      const w2 = this.container.clientWidth;
      const h2 = this.container.clientHeight;
      if (w2 > 0 && h2 > 0) {
        this.renderer.setSize(w2, h2);
        this.camera.aspect = w2 / h2;
        this.camera.updateProjectionMatrix();
      }
    });
    this._resizeObserver.observe(this.container);
  }

  _setupLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(3, 5, 5);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const rim = new THREE.PointLight(0x6c5ce7, 0.6, 15);
    rim.position.set(-3, 2, -3);
    this.scene.add(rim);
  }

  _createDice() {
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    
    // Create materials for each face with numbers
    // BoxGeometry face order: [+X(right), -X(left), +Y(top), -Y(bottom), +Z(front), -Z(back)]
    // Standard dice mapping: top=3, bottom=4, front=1, back=6, right=2, left=5
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }), // +X (right) = 2
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }), // -X (left) = 5
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }), // +Y (top) = 3
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }), // -Y (bottom) = 4
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }), // +Z (front) = 1
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }), // -Z (back) = 6
    ];

    this.dice = new THREE.Mesh(geometry, materials);
    this.dice.castShadow = true;
    this.dice.receiveShadow = true;

    // Add dots to each face
    this._addDots();

    this.scene.add(this.dice);
  }

  _addDots() {
    const dotGeo = new THREE.CircleGeometry(0.12, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e });

    // BoxGeometry faces: [+X, -X, +Y, -Y, +Z, -Z]
    // Standard dice: 1 opposite 6, 2 opposite 5, 3 opposite 4
    // Mapping: +Z=1, -Z=6, +X=2, -X=5, +Y=3, -Y=4
    
    // Face 1 (+Z front): 1 dot center
    this._addFaceDots(0, 0, 0.76, [0, 0, 0], [[0, 0]]);
    
    // Face 6 (-Z back): 6 dots (2 columns of 3)
    this._addFaceDots(0, 0, -0.76, [0, Math.PI, 0], [
      [-0.25, 0.25], [0.25, 0.25],
      [-0.25, 0], [0.25, 0],
      [-0.25, -0.25], [0.25, -0.25]
    ]);
    
    // Face 2 (+X right): 2 dots diagonal
    this._addFaceDots(0.76, 0, 0, [0, Math.PI/2, 0], [
      [-0.25, 0.25], [0.25, -0.25]
    ]);
    
    // Face 5 (-X left): 5 dots (4 corners + center)
    this._addFaceDots(-0.76, 0, 0, [0, -Math.PI/2, 0], [
      [-0.25, 0.25], [0.25, 0.25],
      [0, 0],
      [-0.25, -0.25], [0.25, -0.25]
    ]);
    
    // Face 3 (+Y top): 3 dots diagonal
    this._addFaceDots(0, 0.76, 0, [-Math.PI/2, 0, 0], [
      [-0.25, 0.25], [0, 0], [0.25, -0.25]
    ]);
    
    // Face 4 (-Y bottom): 4 dots (4 corners)
    this._addFaceDots(0, -0.76, 0, [Math.PI/2, 0, 0], [
      [-0.25, 0.25], [0.25, 0.25],
      [-0.25, -0.25], [0.25, -0.25]
    ]);
  }

  _addFaceDots(x, y, z, rot, dotPositions) {
    const dotGeo = new THREE.CircleGeometry(0.12, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e });
    
    dotPositions.forEach(([u, v]) => {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      
      // Adjust position on the face
      if (Math.abs(x) > 0.5) {
        dot.position.y += v;
        dot.position.z += u;
        dot.rotation.y = rot[1];
      } else if (Math.abs(y) > 0.5) {
        dot.position.x += u;
        dot.position.z += v;
        dot.rotation.x = rot[0];
      } else {
        dot.position.x += u;
        dot.position.y += v;
        dot.rotation.y = rot[1];
      }
      
      this.dice.add(dot);
    });
  }

  _animate() {
    if (this.destroyed) return;
    this.animationId = requestAnimationFrame(() => this._animate());

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Roll the dice with reliable rotation
  roll(callback) {
    if (this.isRolling) return;
    this.isRolling = true;
    this.onRollComplete = callback;

    // Random result 1-6
    this.result = Math.floor(Math.random() * 6) + 1;
    
    console.log('Rolling for result:', this.result);

    // Define target rotations for each face to show from top-down view
    // Camera is looking from +Y down toward origin
    // The face pointing UP (+Y) is what we see
    // Default: +Y (top) shows face 3
    // We need to rotate the dice so the desired face points to +Y
    const targetRotations = {
      1: { x: -Math.PI/2, y: 0, z: 0 },    // Rotate front (+Z) to top: -90° around X
      2: { x: 0, y: 0, z: Math.PI/2 },     // Rotate right (+X) to top: +90° around Z
      3: { x: 0, y: 0, z: 0 },             // Top (+Y) already up: no rotation
      4: { x: Math.PI, y: 0, z: 0 },       // Rotate bottom (-Y) to top: 180° around X
      5: { x: 0, y: 0, z: -Math.PI/2 },    // Rotate left (-X) to top: -90° around Z
      6: { x: Math.PI/2, y: 0, z: 0 }      // Rotate back (-Z) to top: +90° around X
    };

    const target = targetRotations[this.result];
    
    // Add random full rotations (4-7 full spins)
    const spinsX = 4 + Math.floor(Math.random() * 4);
    const spinsY = 4 + Math.floor(Math.random() * 4);
    const spinsZ = 4 + Math.floor(Math.random() * 4);
    
    const startX = this.dice.rotation.x;
    const startY = this.dice.rotation.y;
    const startZ = this.dice.rotation.z;
    
    const endX = (target.x || 0) + spinsX * Math.PI * 2;
    const endY = (target.y || 0) + spinsY * Math.PI * 2;
    const endZ = (target.z || 0) + spinsZ * Math.PI * 2;

    // Animate
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const animateRoll = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const ease = 1 - Math.pow(1 - progress, 3);
      
      // Current rotation
      this.dice.rotation.x = startX + (endX - startX) * ease;
      this.dice.rotation.y = startY + (endY - startY) * ease;
      this.dice.rotation.z = startZ + (endZ - startZ) * ease;
      
      // Add some bounce
      if (progress < 1) {
        this.dice.position.y = Math.sin(progress * Math.PI * 4) * 0.3 * (1 - progress);
        requestAnimationFrame(animateRoll);
      } else {
        // Animation complete
        this.dice.position.y = 0;
        // Ensure exact final rotation
        this.dice.rotation.x = target.x || 0;
        this.dice.rotation.y = target.y || 0;
        this.dice.rotation.z = target.z || 0;
        
        this.isRolling = false;
        if (this.onRollComplete) {
          this.onRollComplete(this.result);
        }
      }
    };

    audio.play('roll');
    animateRoll();
    setTimeout(() => audio.play('land'), 2000);
  }

  destroy() {
    this.destroyed = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    this.dice = null;
  }
}

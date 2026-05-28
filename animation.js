/**
 * ============================================================
 * PARTICLE SYSTEMS & VISUAL FX
 * Patlama kıvılcımları ve klasik WebGL akışkanlık efektleri.
 * ============================================================
 */

let fragments = [];
const fragGroup = new THREE.Group();

function initParticleSystems() {
  scene.add(fragGroup);
}

function build3DFragments() {
  fragGroup.clear();
  fragments = [];

  for (let i = 0; i < 60; i++) {
    const size = MathUtils.rand(0.1, 0.4);
    const geometry = new THREE.IcosahedronGeometry(size, 0);
    const color = BayramConfig.colors.particleColors[MathUtils.randInt(0, BayramConfig.colors.particleColors.length)];
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(0);
    fragGroup.add(mesh);

    const speed = MathUtils.rand(8, 20);
    const theta = Math.random() * BayramConfig.TAU;
    const phi = Math.random() * Math.PI;

    fragments.push({
      mesh, material,
      vx: speed * Math.sin(phi) * Math.cos(theta),
      vy: speed * Math.sin(phi) * Math.sin(theta),
      vz: speed * Math.cos(phi),
      life: 0, maxLife: MathUtils.rand(1.5, 3), active: false
    });
  }
}

function triggerCssExplosion(centerX, centerY) {
  for (let i = 0; i < 50; i++) {
    const p = DOM.create('div');
    p.className = 'candy-burst-particle';
    const size = MathUtils.rand(8, 20);
    const angle = Math.random() * BayramConfig.TAU;
    const dist = MathUtils.rand(100, 400);
    const dur = MathUtils.rand(1, 2);
    const color = BayramConfig.colors.particleColors[MathUtils.randInt(0, BayramConfig.colors.particleColors.length)];

    p.style.cssText = `
      left: ${centerX}px; top: ${centerY}px; width: ${size}px; height: ${size}px;
      background: ${color}; box-shadow: 0 0 ${size}px ${color};
      --tx: ${Math.cos(angle) * dist}px; --ty: ${Math.sin(angle) * dist}px; --dur: ${dur}s;
    `;
    DOM.append(document.body, p);
    setTimeout(() => p.remove(), dur * 1000);
  }
}

function updateParticles(delta) {
  fragments.forEach(f => {
    if (!f.active) return;
    f.life += delta;
    if (f.life > f.maxLife) { f.active = false; return; }

    const p = f.life / f.maxLife;
    f.mesh.position.x += f.vx * delta;
    f.mesh.position.y += (f.vy - 4 * f.life) * delta; // Hafif yerçekimi
    f.mesh.position.z += f.vz * delta;
    f.mesh.scale.setScalar(1 - p);
    f.material.opacity = 1 - p;
  });
}

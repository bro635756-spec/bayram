/**
 * ============================================================
 * PARTICLE SYSTEMS & ADVANCED CSS BURST DYNAMICS
 * WebGL fragman patlamaları, genişleyen halka dalgaları,
 * gelişmiş patlama emojileri ve CSS parçacık fiziği yönetimi.
 * ============================================================
 */

let fragments = [];
let rings = [];
const fragGroup = new THREE.Group();

function initParticleSystems() {
  scene.add(fragGroup);
  build3DFragments();
}

// 3D Küresel Parçacık Havuzunun Oluşturulması
function build3DFragments() {
  fragGroup.clear();
  fragments = [];

  for (let i = 0; i < 95; i++) {
    const size = MathUtils.rand(0.14, 0.58);
    // Geometrik çeşitlilik optimizasyonu
    const geometry = Math.random() > 0.5 
      ? new THREE.IcosahedronGeometry(size, 0) 
      : new THREE.ConeGeometry(size, size * 2, 4);

    const randomColor = BayramConfig.colors.particleColors[MathUtils.randInt(0, BayramConfig.colors.particleColors.length)];
    
    const material = new THREE.MeshPhysicalMaterial({
      color: randomColor,
      metalness: 0.4,
      roughness: 0.15,
      emissive: randomColor,
      emissiveIntensity: 0.75,
      transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(0); // Patlama anına kadar ölçek sıfır
    fragGroup.add(mesh);

    // Fiziksel Hız Vektörleri Hesabı (Küresel Dağılım)
    const speed = MathUtils.rand(9, 25);
    const theta = MathUtils.rand(0, BayramConfig.TAU);
    const phi = MathUtils.rand(0, Math.PI);

    fragments.push({
      mesh,
      material,
      vx: speed * Math.sin(phi) * Math.cos(theta),
      vy: speed * Math.sin(phi) * Math.sin(theta),
      vz: speed * Math.cos(phi),
      rx: MathUtils.rand(-6, 6),
      ry: MathUtils.rand(-6, 6),
      rz: MathUtils.rand(-6, 6),
      life: 0,
      maxLife: MathUtils.rand(1.6, 3.6),
      active: false
    });
  }
}

// Şok Dalgalarının (3D Torus Wave) Tetiklenmesi
function trigger3DRings() {
  const ringColors = [0xFFD700, 0x00FFCC, 0xFFFFFF];
  for (let i = 0; i < 4; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: ringColors[i % ringColors.length],
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, 12, 90), material);
    mesh.rotation.x = MathUtils.rand(0, Math.PI);
    mesh.rotation.y = MathUtils.rand(0, Math.PI);
    scene.add(mesh);

    rings.push({ mesh, material, t: 0, delay: i * 0.14, maxT: 2.2 });
  }
}

// CSS Katmanında Yoğun Bayram Patlaması (Emoji + Sparkle Burst)
function triggerCssExplosion(centerX, centerY) {
  // 1. Renkli Kıvılcımların (Kıvılcım CSS Parçacığı) Dağıtılması
  for (let i = 0; i < 70; i++) {
    const particle = DOM.create('div');
    particle.className = 'candy-burst-particle';
    
    const size = MathUtils.rand(6, 24);
    const angle = MathUtils.rand(0, BayramConfig.TAU);
    const distance = MathUtils.rand(110, 520);
    const duration = MathUtils.rand(1.1, 2.6);
    const delay = MathUtils.rand(0, 0.45);
    const color = BayramConfig.colors.particleColors[MathUtils.randInt(0, BayramConfig.colors.particleColors.length)];

    particle.style.cssText = `
      left: ${centerX}px; top: ${centerY}px;
      width: ${size}px; height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size}px ${color};
      --tx: ${Math.cos(angle) * distance}px;
      --ty: ${Math.sin(angle) * distance}px;
      --dur: ${duration}s; --delay: ${delay}s;
      --rot: ${MathUtils.rand(360, 960)}deg;
    `;
    DOM.append(document.body, particle);
    setTimeout(() => particle.remove(), (duration + delay) * 1000 + 100);
  }

  // 2. Kültürel Sembollerin (Koyun, Hilal, Cami) Fırlatılması
  for (let i = 0; i < 45; i++) {
    const emojiStar = DOM.create('div');
    emojiStar.className = 'candy-star';
    emojiStar.textContent = BayramConfig.assets.emojis[MathUtils.randInt(0, BayramConfig.assets.emojis.length)];

    const angle = MathUtils.rand(0, BayramConfig.TAU);
    const distance = MathUtils.rand(90, 480);
    const duration = MathUtils.rand(1.3, 2.9);
    const delay = MathUtils.rand(0, 0.55);

    emojiStar.style.cssText = `
      left: ${centerX}px; top: ${centerY}px;
      --tx: ${Math.cos(angle) * distance}px;
      --ty: ${Math.sin(angle) * distance}px;
      --dur: ${duration}s; --delay: ${delay}s;
      --rot: ${MathUtils.rand(-720, 720)}deg;
      --size: ${MathUtils.rand(26, 62)}px;
    `;
    DOM.append(document.body, emojiStar);
    setTimeout(() => emojiStar.remove(), (duration + delay) * 1000 + 100);
  }

  // 3. Genişleyen Halkaların (Glow Rings) CSS Enjeksiyonu
  for (let i = 0; i < 5; i++) {
    const ring = DOM.create('div');
    ring.className = 'glow-ring';
    const color = BayramConfig.colors.particleColors[MathUtils.randInt(0, BayramConfig.colors.particleColors.length)];
    
    ring.style.cssText = `
      left: ${centerX}px; top: ${centerY}px;
      width: 50px; height: 50px;
      --color: ${color};
      --dur: 1.5s; --delay: ${i * 0.16}s;
    `;
    DOM.append(document.body, ring);
    setTimeout(() => ring.remove(), 1900);
  }
}

// Parçacıkların Fiziksel Güncelleme Hesaplamaları (Delta Time Tabanlı)
function updateParticlesAndRings(deltaTime) {
  // 3D Parçacık Fiziği Döngüsü
  fragments.forEach(f => {
    if (!f.active) return;
    f.life += deltaTime;
    if (f.life > f.maxLife) { f.active = false; f.mesh.scale.setScalar(0); return; }

    const progress = f.life / f.maxLife;
    // Yerçekimi ve hava sürtünmesi zayıflatma simülasyonu
    f.mesh.position.x += f.vx * deltaTime * (1 - progress * 0.35);
    f.mesh.position.y += (f.vy - 9.81 * f.life) * deltaTime; // Yerçekimi ivmesi
    f.mesh.position.z += f.vz * deltaTime * (1 - progress * 0.35);
    
    f.mesh.rotation.x += f.rx * deltaTime;
    f.mesh.rotation.y += f.ry * deltaTime;
    f.mesh.rotation.z += f.rz * deltaTime;

    const currentScale = Math.max(0, 1 - progress);
    f.mesh.scale.setScalar(currentScale);
    f.material.opacity = currentScale;
  });

  // Şok Dalgaları Boyut Güncellemesi
  rings.forEach(r => {
    r.t += deltaTime;
    const progress = Math.max(0, r.t - r.delay) / r.maxT;
    if (progress >= 1) return;
    
    r.mesh.scale.setScalar(progress * 26);
    r.material.opacity = Math.max(0, 1 - progress);
  });
}

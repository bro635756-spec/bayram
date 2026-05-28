/**
 * ============================================================
 * THREE.JS ENGINE CORE & MODEL GRAPHICS
 * Sahne kurulumu, kamera kontrolleri, ışıklandırma mimarisi
 * ve 3D Hilal ile Parıldayan Yıldız modellemeleri.
 * ============================================================
 */

// Global WebGL Nesneleri Havuzu
let scene, camera, renderer, keyLight, goldPointLight, pinkPointLight;
let bayramGroup, starMesh, glowSprite;

function init3DEngine() {
  const canvas = DOM.$('three-canvas');
  
  // Renderer Kurulumu ve Tonemapping Optimizasyonu
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;

  // Sahne ve Atmosferik Sis (Fog) Tanımlaması
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BayramConfig.colors.fogColor, 0.015);

  // Kamera Kurulumu
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.set(0, 0, 24);

  // Global Resize Dinamiği
  window.addEventListener('resize', onWindowResize);

  // Işıklandırma Tasarımı
  setupLighting();

  // Arka Plan Toz Efekti (Cosmic Dust Particles)
  createCosmicDust();

  // Ana Bayram Model Grubu İnşası
  buildBayramModels();
}

function setupLighting() {
  // Ambians Işığı
  const ambientLight = new THREE.AmbientLight(BayramConfig.colors.ambientColor, 0.85);
  scene.add(ambientLight);

  // Ana Karakteristik Yönlü Işık
  keyLight = new THREE.DirectionalLight(BayramConfig.colors.directionalColor, 3.2);
  keyLight.position.set(6, 9, 11);
  scene.add(keyLight);

  // Noktasal Yoğun Altın Işığı
  goldPointLight = new THREE.PointLight(BayramConfig.colors.pointGold, 5, 45);
  goldPointLight.position.set(0, 2, 6);
  scene.add(goldPointLight);

  // Atmosferik Pembe / Mor Kontrast Nokta Işık
  pinkPointLight = new THREE.PointLight(0xFF00AA, 3, 35);
  pinkPointLight.position.set(-6, -3, 4);
  scene.add(pinkPointLight);
}

function createCosmicDust() {
  const geometry = new THREE.BufferGeometry();
  const count = 650;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = MathUtils.rand(-55, 55);
    positions[i * 3 + 1] = MathUtils.rand(-35, 35);
    positions[i * 3 + 2] = MathUtils.rand(-45, 5);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: 0x00FFDD,
    size: 0.085,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const dustPoints = new THREE.Points(geometry, material);
  scene.add(dustPoints);
  window._cosmicDust = dustPoints; // Render loop erişimi için global atama
}

function buildBayramModels() {
  bayramGroup = new THREE.Group();
  scene.add(bayramGroup);
  bayramGroup.scale.setScalar(0); // Başlangıçta gizli

  // Gelişmiş Metalik PBR Malzeme Özellikleri (Altın Kaplama)
  const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xFFD700,
    metalness: 0.95,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    emissive: 0x2b1f00,
    side: THREE.DoubleSide
  });

  // 1. ZARİF 3D HİLAL MODELİ (Torus Kesit Geometrisi Tabanlı)
  const crescentGroup = new THREE.Group();
  const crescentGeo = new THREE.TorusGeometry(3.6, 0.85, 32, 120, Math.PI * 1.12);
  const crescentMesh = new THREE.Mesh(crescentGeo, goldMaterial);
  crescentMesh.rotation.z = -Math.PI * 0.56; // Hilali dik konuma getirme simetrisi
  crescentGroup.add(crescentMesh);
  bayramGroup.add(crescentGroup);

  // 2. 3D BAYRAM YILDIZI MODELİ (Shape Extrusion)
  const starShape = new THREE.Shape();
  const starPoints = 5;
  const outerR = 1.25;
  const innerR = 0.52;

  for (let i = 0; i < starPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (i / (starPoints * 2)) * BayramConfig.TAU - Math.PI / 2;
    starShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }

  const extrusionSettings = {
    depth: 0.35,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08
  };

  const starGeo = new THREE.ExtrudeGeometry(starShape, extrusionSettings);
  
  const starMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    metalness: 0.4,
    roughness: 0.05,
    emissive: 0xFFD700,
    emissiveIntensity: 1.4,
    clearcoat: 1.0
  });

  starMesh = new THREE.Mesh(starGeo, starMaterial);
  starMesh.position.set(1.6, 0.2, 0); // Hilalin iç kavis boşluğuna konumlandırma
  bayramGroup.add(starMesh);

  // 3. MATERYAL GLOW SPRITE EFECT (Yıldız Parıltısı)
  const canvasGlow = document.createElement('canvas');
  canvasGlow.width = canvasGlow.height = 256;
  const ctx = canvasGlow.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255,225,50,1)');
  gradient.addColorStop(0.25, 'rgba(255,140,0,0.45)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const textureGlow = new THREE.CanvasTexture(canvasGlow);
  const spriteMat = new THREE.SpriteMaterial({ map: textureGlow, blending: THREE.AdditiveBlending, depthWrite: false });
  glowSprite = new THREE.Sprite(spriteMat);
  glowSprite.scale.set(19, 19, 1);
  starMesh.add(glowSprite);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

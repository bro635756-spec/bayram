/**
 * ============================================================
 * THREE.JS ENGINE CORE & GAME OBJECTS (GÜNCELLENDİ)
 * Bayram animasyonu modellerine ek olarak 3.5D oyun içi 
 * Oyuncu (Gemi/Karakter) ve Engel (Göktaşları/Koyunlar) yönetimi.
 * ============================================================
 */

let scene, camera, renderer, keyLight, goldPointLight;
let bayramGroup, starMesh;

// Oyun İçi Aktif Nesneler
let gameActive = false;
let playerMesh;
let obstacles = [];
let gameScore = 0;
let obstacleSpawnTimer;

// Oyuncu Kontrol Mekaniği Durumu
const keys = { Left: false, Right: false };

function init3DEngine() {
  const canvas = DOM.$('three-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BayramConfig.colors.fogColor, 0.012);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 0, 24);

  setupLighting();
  buildBayramModels();
  setupInputListeners();

  window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
  const ambientLight = new THREE.AmbientLight(BayramConfig.colors.ambientColor, 1.2);
  scene.add(ambientLight);

  keyLight = new THREE.DirectionalLight(BayramConfig.colors.directionalColor, 2.5);
  keyLight.position.set(5, 10, 8);
  scene.add(keyLight);

  goldPointLight = new THREE.PointLight(BayramConfig.colors.pointGold, 3, 50);
  goldPointLight.position.set(0, 0, 5);
  scene.add(goldPointLight);
}

function buildBayramModels() {
  bayramGroup = new THREE.Group();
  scene.add(bayramGroup);

  const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xFFD700, metalness: 0.9, roughness: 0.15, clearcoat: 1.0
  });

  // Gelişmiş Hilal Geometrisi
  const crescentGeo = new THREE.TorusGeometry(3.5, 0.8, 24, 80, Math.PI * 1.1);
  const crescentMesh = new THREE.Mesh(crescentGeo, goldMaterial);
  crescentMesh.rotation.z = -Math.PI * 0.55;
  bayramGroup.add(crescentMesh);

  // Yıldız Geometrisi
  const starShape = new THREE.Shape();
  const points = 5;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? 1.2 : 0.5;
    const a = (i / (points * 2)) * BayramConfig.TAU - Math.PI / 2;
    starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.3, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
  starMesh = new THREE.Mesh(starGeo, new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, metalness: 0.2, roughness: 0.1, emissive: 0xFFD700 }));
  starMesh.position.set(1.5, 0, 0);
  bayramGroup.add(starMesh);
}

// ============================================================
// OYUN MOTORU PARÇASI (3.5D MODU)
// ============================================================

function setupInputListeners() {
  window.addEventListener('keydown', e => {
    if(e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.Left = true;
    if(e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.Right = true;
  });
  window.addEventListener('keyup', e => {
    if(e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.Left = false;
    if(e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.Right = false;
  });
}

function start3DGameMode() {
  gameActive = true;
  gameScore = 0;
  DOM.$('score-val').textContent = gameScore;

  // Ana logoyu sahneden uzaklaştır/gizle
  gsap.to(bayramGroup.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
  
  // Kamerayı oyun açısına getir (3.5D Arkadan Takip / Kuş Bakışı Eğimi)
  gsap.to(camera.position, { x: 0, y: 5, z: 18, duration: 1.2 });
  gsap.to(camera.rotation, { x: -0.25, duration: 1.2 });

  // Oyuncu Aracını Yarat (Kristal Neon Piramit)
  const playerGeo = new THREE.ConeGeometry(0.8, 1.8, 4);
  const playerMat = new THREE.MeshStandardMaterial({ color: 0x00FFFF, emissive: 0x005577, roughness: 0.2 });
  playerMesh = new THREE.Mesh(playerGeo, playerMat);
  playerMesh.rotation.x = Math.PI / 2; // Yola doğru yatır
  playerMesh.position.set(0, 0, 8);
  scene.add(playerMesh);

  // Engelleri Sürekli Spawn Etme Döngüsü
  obstacleSpawnTimer = setInterval(spawnObstacle, BayramConfig.game.spawnInterval);
}

function spawnObstacle() {
  if (!gameActive) return;

  // Rastgele Yol Tercihi (Sol, Orta, Sağ)
  const lanes = [-BayramConfig.game.laneWidth, 0, BayramConfig.game.laneWidth];
  const chosenLane = lanes[MathUtils.randInt(0, lanes.length)];

  // Kozmik Bayram Engeli (Küremsi Geometrik Kaya Başlıkları)
  const obsGeo = new THREE.IcosahedronGeometry(MathUtils.rand(0.6, 1.1), 0);
  const obsMat = new THREE.MeshStandardMaterial({
    color: BayramConfig.colors.particleColors[MathUtils.randInt(0, BayramConfig.colors.particleColors.length)],
    roughness: 0.8
  });
  const obsMesh = new THREE.Mesh(obsGeo, obsMat);
  
  // İleriden (Z derinliğinden) spawn etme (3.5D Akış Hissi)
  obsMesh.position.set(chosenLane, 0, -40);
  scene.add(obsMesh);
  obstacles.push(obsMesh);
}

function updateGameLogic(delta) {
  if (!gameActive) return;

  // Oyuncu Hareketi Sınırlandırması
  if (keys.Left && playerMesh.position.x > -BayramConfig.game.laneWidth) {
    playerMesh.position.x -= BayramConfig.game.playerSpeed * delta;
  }
  if (keys.Right && playerMesh.position.x < BayramConfig.game.laneWidth) {
    playerMesh.position.x += BayramConfig.game.playerSpeed * delta;
  }

  // Engelleri Üzerimize Doğru Akıtma (Z Ekseni Derinlik Hareketi)
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.position.z += BayramConfig.game.obstacleSpeed * delta;
    obs.rotation.x += delta * 2;
    obs.rotation.y += delta * 1;

    // AABB Çarpışma Testi (Collision Detection)
    if (playerMesh && obs.position.distanceTo(playerMesh.position) < 1.4) {
      endGame(false); // Çarpışma gerçekleşti, oyun bitti.
      return;
    }

    // Ekranın arkasına geçen engelleri temizle ve skor ekle
    if (obs.position.z > 15) {
      scene.remove(obs);
      obstacles.splice(i, 1);
      gameScore += 10;
      DOM.$('score-val').textContent = gameScore;
    }
  }
}

function endGame(completedCleanly = true) {
  gameActive = false;
  clearInterval(obstacleSpawnTimer);

  // Sahnedeki engelleri temizle
  obstacles.forEach(obs => scene.remove(obs));
  obstacles = [];

  if (playerMesh) {
    scene.remove(playerMesh);
    playerMesh = null;
  }

  // HUD Kapat, Eski Arayüze Dön
  DOM.$('game-hud').classList.add('hidden');
  
  // Kamerayı eski haline getir
  gsap.to(camera.position, { x: 0, y: 0, z: 24, duration: 1 });
  gsap.to(camera.rotation, { x: 0, y: 0, z: 0, duration: 1 });

  // Animasyon döngüsünü baştan başlat
  startCelebrationCycle();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

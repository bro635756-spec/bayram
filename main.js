
/**
 * ============================================================
 * MAIN EXECUTION CONTROL & RENDER ENGINE LOOP
 * Projenin ana yürütücüsüdür. Döngü aşamalarını (Büyüme, Bekleme, Patlama)
 * yönetir, zamansal takipleri sağlar ve boot işlemini gerçekleştirir.
 * ============================================================
 */

let currentPhase = 'idle'; // Aşamalar: idle | growing | holding | exploding
let timeElapsed = 0;
let progressGrow = 0;
let progressHold = 0;
let isExploded = false;

function buildUIStarField() {
  const starFieldContainer = DOM.$('star-field');
  for (let i = 0; i < BayramConfig.timing.starCount; i++) {
    const star = DOM.create('div');
    star.className = 'star';
    const size = MathUtils.rand(1, 3.2);
    star.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${MathUtils.rand(0, 100)}%; top: ${MathUtils.rand(0, 100)}%;
      --dur: ${MathUtils.rand(3.5, 9)}s; --delay: ${MathUtils.rand(0, 8)}s;
      --base-op: ${MathUtils.rand(0.2, 0.65)};
    `;
    DOM.append(starFieldContainer, star);
  }
}

function runFloatingUiEmojis() {
  const container = DOM.$('float-emojis');
  for (let i = 0; i < BayramConfig.timing.emojiCount; i++) {
    const floatEmoji = DOM.create('div');
    floatEmoji.className = 'float-emoji';
    floatEmoji.textContent = BayramConfig.assets.floatingItems[i % BayramConfig.assets.floatingItems.length];
    
    const duration = MathUtils.rand(11, 22);
    const delay = MathUtils.rand(0, 16);
    const leftPosition = MathUtils.rand(2, 96);
    const horizontalDrift = MathUtils.rand(-90, 90);

    floatEmoji.style.cssText = `
      left: ${leftPosition}%;
      --dur: ${duration}s; --delay: ${delay}s;
      --drift: ${horizontalDrift}px;
    `;
    DOM.append(container, floatEmoji);
  }
}

// Büyüme ve Patlama Döngüsünü Sıfırlayan / Başlatan Merkez Kontrolör
function startCelebrationCycle() {
  currentPhase = 'growing';
  isExploded = false;
  progressGrow = 0;
  progressHold = 0;
  
  // Ana 3D nesneleri sıfırlama
  bayramGroup.position.set(0, 0, 0);
  bayramGroup.scale.setScalar(0);
  bayramGroup.rotation.set(0, 0, 0);

  // 3D Parçacıkları temizleme ve yeniden inşası
  build3DFragments();
  rings.forEach(r => scene.remove(r.mesh));
  rings = [];

  // DOM Arayüz Metinlerini Gizleme
  const txtOverlay = DOM.$('explosion-text');
  txtOverlay.classList.remove('show', 'fade-out');
  txtOverlay.style.opacity = '0';
}

function processExplosionTrigger() {
  if (isExploded) return;
  isExploded = true;
  currentPhase = 'exploding';

  // Ekran merkezinde CSS Patlama Fırtınası
  triggerCssExplosion(window.innerWidth / 2, window.innerHeight / 2);
  
  // WebGL Patlama Şok Dalgaları
  trigger3DRings();
  
  // 3D Parçacıkları Aktif Etme
  fragments.forEach(f => { f.active = true; f.mesh.scale.setScalar(1); });

  // Hilal ve Yıldız Modelini Şişirerek Patlatma Efekti (GSAP)
  gsap.to(bayramGroup.scale, {
    x: 1.8, y: 1.8, z: 1.8,
    duration: 0.22,
    ease: 'power2.out',
    onComplete: () => {
      gsap.to(bayramGroup.scale, { x: 0, y: 0, z: 0, duration: 0.24, ease: 'power4.in' });
    }
  });

  // Patlama Işık Flaşı Efekti
  gsap.to(goldPointLight, { intensity: 38, duration: 0.08, yoyo: true, repeat: 5 });
  gsap.to(pinkPointLight, { intensity: 22, duration: 0.1, yoyo: true, repeat: 3 });

  // Sinematik Kamera Sarsıntısı (Camera Shake)
  const shakeTimeline = gsap.timeline();
  for (let i = 0; i < 11; i++) {
    shakeTimeline.to(camera.position, {
      x: MathUtils.rand(-0.65, 0.65),
      y: MathUtils.rand(-0.45, 0.45),
      duration: 0.06,
      ease: 'none'
    });
  }
  shakeTimeline.to(camera.position, { x: 0, y: 0, z: 24, duration: 0.55, ease: 'power3.out' });

  // Kutlama Yazısının Ekrana Girişi
  setTimeout(() => {
    DOM.$('explosion-text').classList.add('show');
  }, 450);

  // RESET DELAY Sonrası Döngüyü Başa Sarma Otomasyonu
  setTimeout(() => {
    DOM.$('explosion-text').classList.add('fade-out');
    setTimeout(() => startCelebrationCycle(), 1000);
  }, BayramConfig.timing.resetDelay);
}

// ANA RENDER LOOPU (60 FPS Tarayıcı Senkronizasyonu)
const mainClock = new THREE.Clock();

function mainRenderLoop() {
  requestAnimationFrame(mainRenderLoop);
  
  const delta = Math.min(mainClock.getDelta(), 0.045); // Delta sabitleme (Kasmaları önler)
  timeElapsed += delta;

  // Kozmik Arka Plan Tozlarının Sürekli Akışı
  if (window._cosmicDust) {
    window._cosmicDust.rotation.y += delta * 0.018;
    window._cosmicDust.rotation.x += delta * 0.004;
  }

  // Yıldızın Kendi Ekseni Etrafında Dönüşü
  if (starMesh) {
    starMesh.rotation.z -= delta * 0.75;
  }

  // FAZ 1: OBJELERİN DOĞAL VE AKICI BÜYÜME DÖNGÜSÜ
  if (currentPhase === 'growing') {
    progressGrow += delta / BayramConfig.timing.growDuration;
    if (progressGrow >= 1) {
      progressGrow = 1;
      currentPhase = 'holding';
    }

    const easeFactor = MathUtils.easeInOutCubic(progressGrow);
    bayramGroup.scale.setScalar(easeFactor * 1.25);
    bayramGroup.rotation.y += delta * (0.22 + easeFactor * 0.65);
    bayramGroup.position.y = Math.sin(timeElapsed * 1.8) * 0.25; // Havada süzülme dalgası
  }

  // FAZ 2: GERİLİM / TİTREME VE SIKIŞMA AŞAMASI (PATLAMA ÖNCESİ)
  if (currentPhase === 'holding') {
    progressHold += delta / BayramConfig.timing.holdDuration;
    
    const strainFactor = 1.25 + progressHold * 0.35; // Obje giderek şişer
    const trembleAmount = progressHold * 0.16;       // Titreme şiddeti artar
    const trembleShake = Math.sin(timeElapsed * 35) * trembleAmount;

    bayramGroup.scale.setScalar(strainFactor + Math.abs(trembleShake) * 0.06);
    bayramGroup.position.x = trembleShake;
    bayramGroup.rotation.y += delta * (0.85 + progressHold * 4.5); // Dönüş aşırı hızlanır

    if (progressHold >= 1) {
      processExplosionTrigger();
    }
  }

  // Parçacık ve Şok Dalgalarının Fizik Motorunu Güncelleme
  updateParticlesAndRings(delta);

  // Render Kararı
  renderer.render(scene, camera);
}

// SİSTEM BOOT EDİCİ (Açılış Tetikleyicisi)
window.addEventListener('load', () => {
  buildUIStarField();
  runFloatingUiEmojis();
  init3DEngine();
  initParticleSystems();
  
  mainRenderLoop();

  // Arka plan transparan başlığını yansıt
  setTimeout(() => { DOM.$('bg-title').classList.add('visible'); }, 500);

  // Loader'ı kaldır ve sistemi başlat
  setTimeout(() => {
    DOM.$('loader').classList.add('hidden');
    setTimeout(() => startCelebrationCycle(), 350);
  }, 1300);
});

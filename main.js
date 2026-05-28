/**
 * ============================================================
 * MAIN EXECUTION CONTROL (GÜNCELLENDİ)
 * Animasyon döngüsü ile oyun döngüsünü senkronize eden ana omurga.
 * ============================================================
 */

let currentPhase = 'idle';
let timeElapsed = 0;
let progressGrow = 0;
let progressHold = 0;
let autoResetTimeout;

function buildUIStarField() {
  const container = DOM.$('star-field');
  for (let i = 0; i < BayramConfig.timing.starCount; i++) {
    const star = DOM.create('div');
    star.className = 'star';
    const size = MathUtils.rand(1, 2.5);
    star.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${MathUtils.rand(0, 100)}%; top: ${MathUtils.rand(0, 100)}%;
      --dur: ${MathUtils.rand(3, 7)}s; --delay: ${MathUtils.rand(0, 5)}s;
    `;
    DOM.append(container, star);
  }
}

function runFloatingUiEmojis() {
  const container = DOM.$('float-emojis');
  for (let i = 0; i < BayramConfig.timing.emojiCount; i++) {
    const emoji = DOM.create('div');
    emoji.className = 'float-emoji';
    emoji.textContent = BayramConfig.assets.floatingItems[i % BayramConfig.assets.floatingItems.length];
    emoji.style.cssText = `
      left: ${MathUtils.rand(5, 95)}%;
      --dur: ${MathUtils.rand(10, 20)}s;
      animation-delay: ${MathUtils.rand(-15, 0)}s;
    `;
    DOM.append(container, emoji);
  }
}

function startCelebrationCycle() {
  if (gameActive) return; // Oyun aktifse döngüyü kilitle
  currentPhase = 'growing';
  progressGrow = 0;
  progressHold = 0;

  bayramGroup.position.set(0, 0, 0);
  bayramGroup.scale.setScalar(0);
  build3DFragments();

  const txtOverlay = DOM.$('explosion-text');
  txtOverlay.classList.remove('show');
}

function processExplosionTrigger() {
  currentPhase = 'exploding';
  triggerCssExplosion(window.innerWidth / 2, window.innerHeight / 2);
  fragments.forEach(f => { f.active = true; f.mesh.scale.setScalar(1); });

  gsap.to(bayramGroup.scale, {
    x: 1.6, y: 1.6, z: 1.6, duration: 0.2, yoyo: true, repeat: 1
  });

  // Yazıyı ve OYUNU BAŞLAT butonunu göster
  DOM.$('explosion-text').classList.add('show');

  // Kullanıcı butona basmazsa 6 saniye sonra döngü kendini otomatik tazeler
  autoResetTimeout = setTimeout(() => {
    if (!gameActive) startCelebrationCycle();
  }, BayramConfig.timing.resetDelay);
}

// RENDER LOOP
const clock = new THREE.Clock();

function mainRenderLoop() {
  requestAnimationFrame(mainRenderLoop);
  const delta = Math.min(clock.getDelta(), 0.05);
  timeElapsed += delta;

  if (!gameActive) {
    // 1. ANİMASYON MODU ÇALIŞIYORSA
    if (starMesh) starMesh.rotation.z -= delta * 0.5;

    if (currentPhase === 'growing') {
      progressGrow += delta / BayramConfig.timing.growDuration;
      if (progressGrow >= 1) currentPhase = 'holding';
      const ease = MathUtils.easeInOutCubic(progressGrow);
      bayramGroup.scale.setScalar(ease * 1.2);
      bayramGroup.rotation.y += delta * 0.5;
    }

    if (currentPhase === 'holding') {
      progressHold += delta / BayramConfig.timing.holdDuration;
      bayramGroup.scale.setScalar(1.2 + progressHold * 0.2);
      bayramGroup.rotation.y += delta * (0.5 + progressHold * 3);
      if (progressHold >= 1) processExplosionTrigger();
    }
  } else {
    // 2. OYUN MODU ÇALIŞIYORSA
    updateGameLogic(delta);
  }

  updateParticles(delta);
  renderer.render(scene, camera);
}

// INTERAKTIF BUTON EVENT DİNLEYİCİLERİ
function setupUiInteractions() {
  DOM.$('start-game-btn').addEventListener('click', () => {
    clearTimeout(autoResetTimeout); // Otomatik döngü sıfırlamasını iptal et
    DOM.$('explosion-text').classList.remove('show');
    DOM.$('game-hud').classList.remove('hidden');
    start3DGameMode();
  });

  DOM.$('exit-game-btn').addEventListener('click', () => {
    endGame(true);
  });
}

// BOOT SİSTEMİ
window.addEventListener('load', () => {
  buildUIStarField();
  runFloatingUiEmojis();
  init3DEngine();
  initParticleSystems();
  setupUiInteractions();

  mainRenderLoop();

  setTimeout(() => { DOM.$('bg-title').classList.add('visible'); }, 400);
  setTimeout(() => {
    DOM.$('loader').classList.add('hidden');
    startCelebrationCycle();
  }, 1000);
});

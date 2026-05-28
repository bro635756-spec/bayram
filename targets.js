/**
 * ============================================================
 * TARGETS & CONFIGURATION MANAGEMENT (GÜNCELLENDİ)
 * Oyun mekanikleri, yeni asset havuzları ve durum kontrolleri.
 * ============================================================
 */

const BayramConfig = {
  TAU: Math.PI * 2,
  
  timing: {
    growDuration: 2.6,
    holdDuration: 1.3,
    resetDelay: 5000,
    starCount: 200,
    emojiCount: 25
  },

  colors: {
    particleColors: ['#FFD700', '#00FFCC', '#00F0FF', '#FFFFFF', '#FF33AA', '#FF9900'],
    glowColors: ['#FFD700', '#00E5FF', '#FFFFFF'],
    ambientColor: 0x0f172a,
    directionalColor: 0xFFF0D0,
    pointGold: 0xFFD700,
    fogColor: 0x020617
  },

  assets: {
    emojis: ['🐑', '🐏', '🌙', '✨', '⭐', '🤲', '🕌', '🎉', '💫', '🌌'],
    floatingItems: ['☪', '🌙', '✨', '🤲', '🐑', '🐏', '🕌', '🌟', '💫', '🚀', '🛸']
  },

  // Yeni Oyun Parametreleri
  game: {
    playerSpeed: 18,
    obstacleSpeed: 15,
    spawnInterval: 900, // ms
    laneWidth: 4
  }
};

const DOM = {
  $: id => document.getElementById(id),
  create: tag => document.createElement(tag),
  append: (parent, child) => parent.appendChild(child)
};

const MathUtils = {
  rand: (min, max) => Math.random() * (max - min) + min,
  randInt: (min, max) => Math.floor(Math.random() * (max - min) + min),
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
};

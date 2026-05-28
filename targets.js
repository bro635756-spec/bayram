/**
 * ============================================================
 * TARGETS & CONFIGURATION MANAGEMENT
 * Projenin animasyon süreleri, matematiksel helper yapıları
 * ve patlama emojilerinin kontrol havuzu.
 * ============================================================
 */

// Global Konfigürasyon Havuzu
const BayramConfig = {
  // Matematik Sabitleri
  TAU: Math.PI * 2,
  PI_HALF: Math.PI / 2,
  
  // Zamanlama Dinamikleri (Saniye Cinsinden)
  timing: {
    growDuration: 2.6,    // Objelerin büyüme fazı süresi
    holdDuration: 1.3,    // Objelerin patlamadan önce titreme süresi
    resetDelay: 4200,     // Döngünün yeniden başlama gecikmesi (ms)
    starCount: 170,       // CSS arka plan yıldız sayısı
    emojiCount: 18        // Uçuşan yüzer emoji sayısı
  },

  // Görsel Efekt Renk Paletleri
  colors: {
    particleColors: ['#FFD700', '#00FFCC', '#00F0FF', '#FFFFFF', '#FF33AA', '#33FF00'],
    glowColors: ['#FFD700', '#00E5FF', '#FFFFFF', '#00FF66'],
    ambientColor: 0x1a2a4a,
    directionalColor: 0xFFE8B0,
    pointGold: 0xFFD700,
    fogColor: 0x030a16
  },

  // Kültürel Tematik Parçacık Havuzları
  assets: {
    emojis: ['🐑', '🐏', '🌙', '☪️', '✨', '⭐', '🤲', '🕌', '🎉', '🎊', '🕋', '💫'],
    floatingItems: ['☪', '🌙', '✨', '🤲', '🐑', '🐏', '🕌', '🌟', '💫']
  }
};

// Global Yardımcı Fonksiyonlar (Helper Functions)
const DOM = {
  $: id => document.getElementById(id),
  create: tag => document.createElement(tag),
  append: (parent, child) => parent.appendChild(child)
};

const MathUtils = {
  rand: (min, max) => Math.random() * (max - min) + min,
  randInt: (min, max) => Math.floor(Math.random() * (max - min) + min),
  clamp: (val, min, max) => Math.min(Math.max(val, min), max),
  
  // Organik büyüme eğrisi için İlerici Ease Eğimleri (Cubic)
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
};

// Modülün hazır olduğunu doğrula
console.log("Targets & Config Modülü Yüklendi.");

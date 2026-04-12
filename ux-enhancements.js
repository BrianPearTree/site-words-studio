/* ============================================
   UX Enhancements — Confetti, Sparkles, Fun
   ============================================ */
(function() {
  'use strict';

  // --- CONFETTI SYSTEM ---
  const canvas = document.createElement('canvas');
  canvas.id = 'confettiCanvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let confettiPieces = [];
  let animFrame = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const COLORS = ['#f5c518', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#06b6d4', '#ef4444'];

  function createConfetti(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 3 + Math.random() * 5;
      confettiPieces.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1,
        decay: 0.012 + Math.random() * 0.008,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    if (!animFrame) animateConfetti();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces = confettiPieces.filter(p => p.life > 0);

    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (confettiPieces.length > 0) {
      animFrame = requestAnimationFrame(animateConfetti);
    } else {
      animFrame = null;
    }
  }

  // Burst confetti from an element
  function burstFromElement(el, count) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    createConfetti(cx, cy, count || 40);
  }

  // Full-screen confetti rain
  function confettiRain() {
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        createConfetti(
          Math.random() * canvas.width,
          -10,
          3
        );
      }, i * 30);
    }
  }

  // --- SPARKLE SYSTEM ---
  function addSparkle(el) {
    const sparkle = document.createElement('span');
    sparkle.textContent = '✨';
    sparkle.style.cssText = `
      position: absolute;
      font-size: ${10 + Math.random() * 14}px;
      pointer-events: none;
      z-index: 100;
      animation: sparkleFloat 0.8s ease-out forwards;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
    `;
    el.style.position = 'relative';
    el.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }

  // --- STREAK FLAME ---
  function showStreakFlame(streakEl) {
    const val = parseInt(streakEl.textContent) || 0;
    if (val >= 3) {
      streakEl.style.position = 'relative';
      let flame = streakEl.querySelector('.streak-flame');
      if (!flame) {
        flame = document.createElement('span');
        flame.className = 'streak-flame';
        flame.textContent = val >= 10 ? '🔥🔥🔥' : val >= 5 ? '🔥🔥' : '🔥';
        flame.style.cssText = `
          position: absolute;
          top: -8px;
          right: -4px;
          font-size: 1rem;
          animation: flameBob 0.6s ease-in-out infinite alternate;
          pointer-events: none;
        `;
        streakEl.appendChild(flame);
      } else {
        flame.textContent = val >= 10 ? '🔥🔥🔥' : val >= 5 ? '🔥🔥' : '🔥';
      }
    }
  }

  // --- INJECT DYNAMIC STYLES ---
  const style = document.createElement('style');
  style.textContent = `
    @keyframes sparkleFloat {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-30px) scale(0.3) rotate(20deg); }
    }
    @keyframes flameBob {
      from { transform: translateY(0) scale(1); }
      to { transform: translateY(-3px) scale(1.1); }
    }
    @keyframes numberTick {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .number-tick { animation: numberTick 0.3s var(--ease-bounce); }
  `;
  document.head.appendChild(style);

  // --- HOOK INTO EXISTING APP ---
  // Watch for word card success/fail classes
  const wordCard = document.getElementById('wordCard');
  if (wordCard) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          if (wordCard.classList.contains('success')) {
            burstFromElement(wordCard, 25);
            addSparkle(wordCard);
            addSparkle(wordCard);
          }
        }
      });
    });
    observer.observe(wordCard, { attributes: true });
  }

  // Watch streak value for flame
  const streakEl = document.getElementById('streakValue');
  if (streakEl) {
    const sObs = new MutationObserver(() => showStreakFlame(streakEl));
    sObs.observe(streakEl, { childList: true, characterData: true, subtree: true });
  }

  // Watch for celebration card becoming visible
  const celebCard = document.getElementById('celebrationCard');
  if (celebCard) {
    const cObs = new MutationObserver(() => {
      if (!celebCard.classList.contains('hidden')) {
        confettiRain();
      }
    });
    cObs.observe(celebCard, { attributes: true, attributeFilter: ['class'] });
  }

  // Watch for mastered text appearing
  const masteredText = document.getElementById('masteredText');
  if (masteredText) {
    const mObs = new MutationObserver(() => {
      if (masteredText.classList.contains('show')) {
        burstFromElement(wordCard, 50);
      }
    });
    mObs.observe(masteredText, { attributes: true, attributeFilter: ['class'] });
  }

  // Add subtle hover sparkle to primary buttons
  document.querySelectorAll('.primary, .pass').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      addSparkle(btn);
    });
  });

  // Number tick animation on coach card value changes
  document.querySelectorAll('.coach-card strong, .dashboard-value, .stat-value').forEach(el => {
    const nObs = new MutationObserver(() => {
      el.classList.remove('number-tick');
      void el.offsetWidth; // reflow
      el.classList.add('number-tick');
    });
    nObs.observe(el, { childList: true, characterData: true, subtree: true });
  });

  // --- KEYBOARD SHORTCUT FEEDBACK ---
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      const passBtn = document.getElementById('passBtn');
      if (passBtn && !passBtn.disabled) {
        passBtn.style.transform = 'scale(0.95)';
        setTimeout(() => passBtn.style.transform = '', 100);
      }
    }
  });

  console.log('🦇 Batman UX Enhancements loaded');
})();

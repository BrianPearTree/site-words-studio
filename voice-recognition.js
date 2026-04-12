/* ============================================
   Voice Recognition for Sight Words Studio
   Uses Web Speech API — runs locally in browser
   Opt-in via toggle, no external APIs
   ============================================ */
(function() {
  'use strict';

  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.log('🎤 Speech recognition not supported in this browser');
    return;
  }

  let recognition = null;
  let listening = false;
  let enabled = false;

  // --- Create the mic toggle button ---
  const toggle = document.createElement('button');
  toggle.id = 'voiceToggle';
  toggle.className = 'secondary';
  toggle.innerHTML = '🎤 Voice Off';
  toggle.title = 'Toggle voice recognition — kids read the word aloud to answer';
  toggle.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:1000;min-height:48px;padding:12px 18px;border-radius:16px;font-size:0.88rem;opacity:0.9;';

  // --- Listening indicator ---
  const indicator = document.createElement('div');
  indicator.id = 'voiceIndicator';
  indicator.style.cssText = 'position:fixed;bottom:76px;right:20px;z-index:1000;padding:8px 14px;border-radius:12px;font-size:0.82rem;font-weight:800;display:none;background:rgba(34,197,94,0.15);color:#4ade80;border:1.5px solid rgba(34,197,94,0.25);';
  indicator.textContent = '🎤 Listening...';

  document.body.appendChild(toggle);
  document.body.appendChild(indicator);

  // --- Recognition setup ---
  function createRecognition() {
    const r = new SpeechRecognition();
    r.lang = 'en-US';
    r.continuous = false;
    r.interimResults = false;
    r.maxAlternatives = 5; // Check multiple guesses

    r.onresult = function(event) {
      if (!enabled) return;

      // Get the current word on screen
      const wordEl = document.getElementById('wordText');
      if (!wordEl) return;
      const target = wordEl.textContent.trim().toLowerCase();

      // Skip non-word states
      if (!target || target === 'tap start to begin' || target === 'pick a set to begin') return;

      // Check all alternatives
      let matched = false;
      for (let i = 0; i < event.results[0].length; i++) {
        const heard = event.results[0][i].transcript.trim().toLowerCase();
        if (heard === target || heard.includes(target) || target.includes(heard)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        indicator.textContent = '✅ Correct!';
        indicator.style.background = 'rgba(34,197,94,0.2)';
        indicator.style.color = '#4ade80';

        // Trigger pass — click the pass button
        const passBtn = document.getElementById('passBtn');
        if (passBtn && !passBtn.disabled) {
          passBtn.click();
        }
      } else {
        const heard = event.results[0][0].transcript.trim();
        indicator.textContent = '🔄 Heard: "' + heard + '"';
        indicator.style.background = 'rgba(245,158,11,0.15)';
        indicator.style.color = '#fbbf24';
      }

      // Restart listening after a short pause
      setTimeout(startListening, 600);
    };

    r.onerror = function(event) {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Normal — just restart
        if (enabled) setTimeout(startListening, 300);
        return;
      }
      console.log('🎤 Speech error:', event.error);
      if (enabled) setTimeout(startListening, 1000);
    };

    r.onend = function() {
      listening = false;
      if (enabled) setTimeout(startListening, 300);
    };

    return r;
  }

  function startListening() {
    if (!enabled || listening) return;
    try {
      if (!recognition) recognition = createRecognition();
      recognition.start();
      listening = true;
      indicator.style.display = 'block';
      indicator.textContent = '🎤 Listening...';
      indicator.style.background = 'rgba(34,197,94,0.15)';
      indicator.style.color = '#4ade80';
    } catch (e) {
      // Already started or other issue — retry
      listening = false;
      if (enabled) setTimeout(startListening, 500);
    }
  }

  function stopListening() {
    listening = false;
    if (recognition) {
      try { recognition.abort(); } catch(e) {}
    }
    indicator.style.display = 'none';
  }

  // --- Toggle handler ---
  toggle.addEventListener('click', function() {
    enabled = !enabled;
    if (enabled) {
      toggle.innerHTML = '🎤 Voice On';
      toggle.style.borderColor = 'rgba(34,197,94,0.4)';
      toggle.style.color = '#4ade80';
      startListening();
    } else {
      toggle.innerHTML = '🎤 Voice Off';
      toggle.style.borderColor = '';
      toggle.style.color = '';
      stopListening();
    }
  });

  console.log('🎤 Voice recognition ready (tap mic button to enable)');
})();

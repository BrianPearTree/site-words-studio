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

  // --- Persistent session log ---
  const voiceLog = [];

  function logAttempt(entry) {
    entry.time = new Date().toLocaleTimeString();
    voiceLog.push(entry);
    // Keep on-screen log updated
    updateLogPanel();
  }

  // --- On-screen log panel ---
  const logPanel = document.createElement('div');
  logPanel.id = 'voiceLog';
  logPanel.style.cssText = 'position:fixed;bottom:76px;right:20px;z-index:999;max-height:280px;width:280px;overflow-y:auto;padding:10px;border-radius:14px;font-size:0.75rem;font-family:monospace;display:none;background:rgba(10,10,20,0.92);color:#94a3b8;border:1.5px solid rgba(255,255,255,0.08);line-height:1.5;';
  document.body.appendChild(logPanel);

  function updateLogPanel() {
    if (!enabled) return;
    const last10 = voiceLog.slice(-10);
    logPanel.innerHTML = '<div style="color:#f5c518;font-weight:800;margin-bottom:6px;">Voice Log</div>' +
      last10.map(e => {
        const icon = e.match ? '✅' : e.type === 'error' ? '⚠️' : '❌';
        if (e.type === 'error') {
          return '<div style="color:#f87171">' + icon + ' ' + e.time + ' ' + e.error + '</div>';
        }
        const altsStr = (e.alts || []).map(a =>
          '<span style="color:' + (a.conf > 50 ? '#4ade80' : a.conf > 20 ? '#fbbf24' : '#f87171') + '">"' + a.text + '" ' + a.conf + '%</span>'
        ).join(', ');
        return '<div>' + icon + ' ' + e.time +
          ' <span style="color:#60a5fa">want:</span> "' + e.target + '"' +
          '<br>  ' + altsStr + '</div>';
      }).join('') +
      '<div style="color:#475569;margin-top:6px;">' + voiceLog.length + ' attempts total</div>';
    logPanel.style.display = 'block';
  }

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

      // Collect ALL alternatives with confidence
      const alts = [];
      for (let i = 0; i < event.results[0].length; i++) {
        const t = event.results[0][i].transcript.trim();
        const c = parseFloat((event.results[0][i].confidence * 100).toFixed(1));
        alts.push({ text: t, conf: c });
      }

      // Check all alternatives for match
      let matched = false;
      let matchedAlt = '';
      for (let i = 0; i < alts.length; i++) {
        const heard = alts[i].text.toLowerCase();
        if (heard === target || heard.includes(target) || target.includes(heard)) {
          matched = true;
          matchedAlt = alts[i].text;
          break;
        }
      }

      // Log to persistent log
      logAttempt({ target: target, alts: alts, match: matched, matchedAlt: matchedAlt });
      console.log('🎤 Target: "' + target + '"', matched ? '✅' : '❌', alts);

      if (matched) {
        indicator.textContent = '✅ "' + matchedAlt + '"';
        indicator.style.background = 'rgba(34,197,94,0.2)';
        indicator.style.color = '#4ade80';
        const passBtn = document.getElementById('passBtn');
        if (passBtn && !passBtn.disabled) passBtn.click();
      } else {
        indicator.textContent = '🔄 "' + alts[0].text + '" ≠ "' + target + '"';
        indicator.style.background = 'rgba(245,158,11,0.15)';
        indicator.style.color = '#fbbf24';
      }

      // Restart listening after a short pause
      setTimeout(startListening, 600);
    };

    r.onerror = function(event) {
      if (event.error === 'no-speech') {
        // Normal silence — just restart, don't log
        if (enabled) setTimeout(startListening, 300);
        return;
      }
      if (event.error === 'aborted') {
        if (enabled) setTimeout(startListening, 300);
        return;
      }
      logAttempt({ type: 'error', error: event.error });
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
      logPanel.style.display = 'none';
    }
  });

  console.log('🎤 Voice recognition ready (tap mic button to enable)');
})();

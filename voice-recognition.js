/* ============================================
   Voice Recognition for Sight Words Studio
   Uses Web Speech API — runs locally in browser
   Opt-in via toggle, no external APIs
   Tuned for kids ages 5-10
   ============================================ */
(function() {
  'use strict';

  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.log('Speech recognition not supported in this browser');
    return;
  }

  let recognition = null;
  let listening = false;
  let enabled = false;
  let consecutiveNoMatch = 0;
  let interimAccepted = false; // guard against double-accept from interim+final

  // --- Logging (console only, no UI panel) ---
  function logAttempt(entry) {
    entry.time = new Date().toLocaleTimeString();
    console.log('🎤', entry);
  }

  // --- Inject CSS for mic pulse animation ---
  var style = document.createElement('style');
  style.textContent =
    '@keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}50%{box-shadow:0 0 0 14px rgba(34,197,94,0)}}' +
    '.mic-pulse{animation:micPulse 1.4s ease-in-out infinite}';
  document.head.appendChild(style);

  // --- Create the mic toggle button ---
  var toggle = document.createElement('button');
  toggle.id = 'voiceToggle';
  toggle.className = 'secondary';
  toggle.innerHTML = 'Voice Off';
  toggle.title = 'Toggle voice recognition - kids read the word aloud to answer';
  toggle.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:1000;min-height:52px;padding:14px 20px;border-radius:16px;font-size:0.92rem;opacity:0.95;transition:all 0.2s ease;';

  // --- Listening indicator (larger, shows target word) ---
  var indicator = document.createElement('div');
  indicator.id = 'voiceIndicator';
  indicator.style.cssText = 'position:fixed;bottom:86px;right:20px;z-index:1000;padding:12px 18px;border-radius:14px;font-size:1rem;font-weight:800;display:none;background:rgba(34,197,94,0.15);color:#4ade80;border:2px solid rgba(34,197,94,0.3);min-width:160px;text-align:center;transition:all 0.2s ease;';
  indicator.textContent = 'Listening...';

  document.body.appendChild(toggle);
  document.body.appendChild(indicator);

  // --- Homophones: words that sound the same or kids commonly mishear ---
  var HOMOPHONES = {
    'to': ['two', 'too', 'do', 'tu'],
    'two': ['to', 'too', 'do', 'tu'],
    'too': ['to', 'two', 'do', 'tu'],
    'no': ['know', 'nah', 'nope', 'now'],
    'know': ['no', 'now'],
    'i': ['eye', 'ay', 'hi', 'ah'],
    'see': ['sea', 'c', 'si', 'she'],
    'sea': ['see', 'she'],
    'red': ['read', 'wed', 'wren'],
    'read': ['red', 'weed', 'reed'],
    'blue': ['blew', 'boo'],
    'blew': ['blue', 'boo'],
    'a': ['uh', 'ah', 'hey', 'eh', 'the'],
    'the': ['duh', 'da', 'de', 'a', 'uh', 'fuh', 'vuh'],
    'do': ['dew', 'due', 'to', 'boo'],
    'not': ['knot', 'nut', 'nah', 'lot'],
    'in': ['inn', 'an', 'on', 'and', 'him'],
    'we': ['wee', 'oui', 'me', 'whee'],
    'off': ['of', 'all', 'aw'],
    'of': ['off', 'up', 'uh', 'love'],
    'said': ['sed', 'set', 'says', 'say', 'shed'],
    'sit': ['set', 'sip', 'sick', 'hit'],
    'go': ['goh', 'no', 'oh', 'so'],
    'did': ['dead', 'dad', 'dig', 'good'],
    'can': ['ken', 'come', 'kin'],
    'at': ['hat', 'add', 'it', 'that', 'cat'],
    'up': ['app', 'uh', 'of', 'cup'],
    'is': ["it's", 'as', 'his', 'if', 'this'],
    'it': ['hit', 'et', 'eat', 'is', 'if'],
    'am': ["i'm", 'um', 'and', 'ham'],
    'on': ['un', 'an', 'in', 'one', 'own'],
    'if': ['of', 'is', 'it'],
    'and': ['an', 'end', 'in', 'hand', 'ant', 'am'],
    'like': ['lick', 'light', 'mike'],
    'as': ['has', 'is', 'us', 'oz'],
    'man': ['men', 'mom', 'my'],
    'cut': ['cat', 'cup', 'come'],
    'pink': ['think', 'king', 'drink'],
    'yellow': ['yell oh', 'hello', 'yell', 'jello'],
    'cookie': ['cookies', 'cooking', 'cookie'],
    'sick': ['thick', 'six', 'sit', 'sing'],
    'he': ['she', 'me', 'we', 'be', 'heat', 'hee'],
    'she': ['he', 'see', 'me'],
    'me': ['my', 'we', 'be', 'knee'],
    'be': ['me', 'we', 'bee', 'pee', 'key'],
    'was': ['what', 'us', 'want', 'with'],
    'for': ['four', 'far', 'from', 'or', 'more', 'door'],
    'are': ['our', 'or', 'ah', 'r'],
    'but': ['bet', 'bot', 'bat', 'put', 'butt'],
    'had': ['head', 'hat', 'has', 'hand'],
    'has': ['had', 'his', 'as', 'have'],
    'him': ['them', 'in', 'ham'],
    'his': ['is', 'has', 'her'],
    'her': ['here', 'hair', 'his'],
    'you': ['new', 'your', 'yoo'],
    'they': ['the', 'day', 'say', 'there'],
    'that': ['the', 'at', 'dad', 'this'],
    'this': ['the', 'is', 'that', 'these'],
    'with': ['will', 'wish', 'was', 'which'],
    'all': ['off', 'or', 'aw', 'owl'],
    'my': ['me', 'by', 'why', 'buy'],
    'come': ['can', 'gum', 'calm', 'some'],
    'look': ['looked', 'like', 'book', 'luke'],
    'big': ['pig', 'bag', 'dig', 'beg'],
    'get': ['got', 'jet', 'set', 'good'],
    'out': ['ow', 'ouch', 'about', 'shout'],
    'day': ['they', 'say', 'hey', 'play'],
    'one': ['won', 'on', 'want', 'once'],
    'make': ['may', 'made', 'mike', 'take'],
    'say': ['said', 'they', 'day', 'say'],
    'play': ['pray', 'plate', 'place', 'day'],
    'run': ['ran', 'fun', 'rain', 'won'],
    'so': ['show', 'go', 'no', 'slow'],
    'an': ['and', 'on', 'in', 'am'],
    'or': ['are', 'our', 'for', 'more'],
    'by': ['buy', 'bye', 'my', 'why', 'be'],
    'what': ['was', 'want', 'wet', 'white'],
    'were': ['where', 'we', 'work', 'word', 'war'],
    'there': ['they', 'their', 'the', 'where', 'dare'],
    'your': ['you', 'you are', "you're"],
    'have': ['has', 'half', 'had'],
    'from': ['for', 'from', 'fun'],
    'here': ['hear', 'her', 'hair'],
    'down': ['done', 'don', 'town'],
    'then': ['them', 'the', 'than', 'when'],
    'been': ['being', 'been', 'bin', 'ben'],
    'eat': ['it', 'at', 'heat', 'ate'],
    'yes': ['yep', 'yeah', 'yess'],
    'fun': ['from', 'run', 'fan', 'sun'],
    'jump': ['dump', 'jam', 'chump'],
    'stop': ['top', 'stab', 'stock'],
    'help': ['held', 'yelp', 'hill'],
    'good': ['could', 'god', 'got', 'goo'],
    'put': ['but', 'pet', 'pit', 'putt'],
    'just': ['just', 'dust', 'must'],
  };

  function isHomophoneMatch(heard, target) {
    if (heard === target) return true;
    var alts = HOMOPHONES[target];
    return alts ? alts.indexOf(heard) !== -1 : false;
  }

  // --- Levenshtein distance for fuzzy/phonetic matching ---
  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    var d = [];
    for (var i = 0; i <= m; i++) {
      d[i] = [i];
    }
    for (var j = 0; j <= n; j++) {
      d[0][j] = j;
    }
    for (var i = 1; i <= m; i++) {
      for (var j = 1; j <= n; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      }
    }
    return d[m][n];
  }

  // Fuzzy match: accept if edit distance is within tolerance scaled by word length
  function isFuzzyMatch(heard, target) {
    if (heard.length <= 1 || target.length <= 1) return heard === target;
    var dist = levenshtein(heard, target);
    // For short words (2-3 chars), allow 1 edit. For longer words, allow ~40% edits.
    var maxDist = target.length <= 3 ? 1 : Math.ceil(target.length * 0.4);
    return dist <= maxDist;
  }

  // --- Check if a transcript contains the target word (kids say "the word is ___") ---
  function extractTargetFromPhrase(transcript, target) {
    var words = transcript.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    for (var i = 0; i < words.length; i++) {
      if (words[i] === target) return true;
      if (isHomophoneMatch(words[i], target)) return true;
      if (isFuzzyMatch(words[i], target)) return true;
    }
    return false;
  }

  // --- Full matching logic: checks exact, homophone, fuzzy, containment ---
  function isMatch(heard, target) {
    var h = heard.toLowerCase().trim();
    var t = target.toLowerCase().trim();
    // Exact
    if (h === t) return true;
    // Homophone
    if (isHomophoneMatch(h, t)) return true;
    // Fuzzy (edit distance)
    if (isFuzzyMatch(h, t)) return true;
    // Target appears anywhere in what was heard (kid says a sentence)
    if (h.length > t.length && extractTargetFromPhrase(h, t)) return true;
    // Heard is contained in target or vice-versa (partial utterance)
    if (t.length > 2 && h.length > 2 && (h.indexOf(t) !== -1 || t.indexOf(h) !== -1)) return true;
    return false;
  }

  // --- Get current target word ---
  function getTarget() {
    var wordEl = document.getElementById('wordText');
    if (!wordEl) return null;
    var t = wordEl.textContent.trim().toLowerCase();
    if (!t || t === 'tap start to begin' || t === 'pick a set to begin') return null;
    return t;
  }

  // --- Accept a match: trigger the pass button ---
  function acceptMatch(matchedText, isInterim) {
    if (interimAccepted) return; // prevent double-fire
    interimAccepted = true;
    consecutiveNoMatch = 0;

    indicator.textContent = '"' + matchedText + '" - Correct!';
    indicator.style.background = 'rgba(34,197,94,0.25)';
    indicator.style.color = '#4ade80';
    indicator.style.borderColor = 'rgba(34,197,94,0.5)';

    var passBtn = document.getElementById('passBtn');
    if (passBtn && !passBtn.disabled) passBtn.click();

    // Reset the guard after a delay so next word can be recognized
    setTimeout(function() { interimAccepted = false; }, 800);
  }

  // --- Recognition setup ---
  function createRecognition() {
    var r = new SpeechRecognition();
    r.lang = 'en-US';
    r.continuous = false;
    r.interimResults = true;  // catch partial matches faster for kids
    r.maxAlternatives = 5;

    r.onresult = function(event) {
      if (!enabled) return;

      var target = getTarget();
      if (!target) return;

      // Process all result sets (interim and final)
      for (var ri = event.resultIndex; ri < event.results.length; ri++) {
        var result = event.results[ri];
        var isFinal = result.isFinal;

        // Collect alternatives
        var alts = [];
        for (var i = 0; i < result.length; i++) {
          var t = result[i].transcript.trim();
          var c = parseFloat((result[i].confidence * 100).toFixed(1));
          alts.push({ text: t, conf: c });
        }

        if (!isFinal) {
          // --- Interim result: show "hearing..." feedback ---
          var interimText = alts[0] ? alts[0].text : '';
          indicator.textContent = 'Say: "' + target + '" - hearing: "' + interimText + '"...';
          indicator.style.background = 'rgba(99,102,241,0.15)';
          indicator.style.color = '#a5b4fc';
          indicator.style.borderColor = 'rgba(99,102,241,0.3)';

          // Auto-accept high-confidence interim match (>80% or exact match)
          for (var i = 0; i < alts.length; i++) {
            if (isMatch(alts[i].text, target) && (alts[i].conf > 80 || alts[i].text.toLowerCase().trim() === target)) {
              logAttempt({ target: target, alts: alts, match: true, matchedAlt: alts[i].text, interim: true });
              console.log('Voice target: "' + target + '" INTERIM MATCH', alts);
              acceptMatch(alts[i].text, true);
              return;
            }
          }
          continue;
        }

        // --- Final result ---
        var matched = false;
        var matchedAlt = '';
        for (var i = 0; i < alts.length; i++) {
          if (isMatch(alts[i].text, target)) {
            matched = true;
            matchedAlt = alts[i].text;
            break;
          }
        }

        logAttempt({ target: target, alts: alts, match: matched, matchedAlt: matchedAlt, interim: false });
        console.log('Voice target: "' + target + '"', matched ? 'MATCH' : 'NO MATCH', alts);

        if (matched) {
          acceptMatch(matchedAlt, false);
        } else {
          consecutiveNoMatch++;
          indicator.textContent = 'Say: "' + target + '" - heard: "' + (alts[0] ? alts[0].text : '?') + '"';
          indicator.style.background = 'rgba(245,158,11,0.15)';
          indicator.style.color = '#fbbf24';
          indicator.style.borderColor = 'rgba(245,158,11,0.3)';

          // After 3 consecutive no-matches, show a hint
          if (consecutiveNoMatch >= 3) {
            logAttempt({ type: 'hint', message: 'Try saying it louder and clearer!' });
            indicator.textContent = 'Say "' + target + '" louder!';
            indicator.style.background = 'rgba(251,191,36,0.2)';
            indicator.style.color = '#fbbf24';
            consecutiveNoMatch = 0; // reset so the hint repeats every 3
          }
        }
      }

      // Restart listening after a short pause
      setTimeout(startListening, 250);
    };

    r.onerror = function(event) {
      if (event.error === 'no-speech') {
        if (enabled) setTimeout(startListening, 150);
        return;
      }
      if (event.error === 'aborted') {
        if (enabled) setTimeout(startListening, 150);
        return;
      }
      logAttempt({ type: 'error', error: event.error });
      console.log('Voice error:', event.error);
      // On serious errors, recreate recognition from scratch
      if (event.error === 'network' || event.error === 'service-not-allowed' || event.error === 'not-allowed') {
        destroyRecognition();
      }
      if (enabled) setTimeout(startListening, 500);
    };

    r.onend = function() {
      listening = false;
      if (enabled) setTimeout(startListening, 150);
    };

    return r;
  }

  function destroyRecognition() {
    if (recognition) {
      try { recognition.abort(); } catch(e) {}
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition = null;
    }
    listening = false;
  }

  var recreateCount = 0;

  function startListening() {
    if (!enabled || listening) return;
    try {
      if (!recognition) recognition = createRecognition();
      recognition.start();
      listening = true;
      recreateCount = 0;
      var target = getTarget();
      indicator.style.display = 'block';
      indicator.textContent = target ? 'Say: "' + target + '"' : 'Listening...';
      indicator.style.background = 'rgba(34,197,94,0.15)';
      indicator.style.color = '#4ade80';
      indicator.style.borderColor = 'rgba(34,197,94,0.3)';
      toggle.classList.add('mic-pulse');
    } catch (e) {
      listening = false;
      // If we fail repeatedly, full destroy and recreate
      recreateCount++;
      if (recreateCount > 2) {
        destroyRecognition();
        recreateCount = 0;
      }
      if (enabled) setTimeout(startListening, 300);
    }
  }

  function stopListening() {
    listening = false;
    if (recognition) {
      try { recognition.abort(); } catch(e) {}
    }
    indicator.style.display = 'none';
    toggle.classList.remove('mic-pulse');
  }

  // --- Toggle handler ---
  toggle.addEventListener('click', function() {
    enabled = !enabled;
    if (enabled) {
      toggle.innerHTML = 'Voice On';
      toggle.style.borderColor = 'rgba(34,197,94,0.4)';
      toggle.style.color = '#4ade80';
      consecutiveNoMatch = 0;
      interimAccepted = false;
      startListening();
    } else {
      toggle.innerHTML = 'Voice Off';
      toggle.style.borderColor = '';
      toggle.style.color = '';
      stopListening();
    }
  });

  // --- Watch for word changes to reset state ---
  var lastTarget = null;
  setInterval(function() {
    if (!enabled) return;
    var target = getTarget();
    if (target && target !== lastTarget) {
      lastTarget = target;
      interimAccepted = false;
      consecutiveNoMatch = 0;
      // Update indicator to show new target word
      if (listening) {
        indicator.textContent = 'Say: "' + target + '"';
        indicator.style.background = 'rgba(34,197,94,0.15)';
        indicator.style.color = '#4ade80';
        indicator.style.borderColor = 'rgba(34,197,94,0.3)';
      }
    }
  }, 200);

  console.log('Voice recognition ready (tap mic button to enable)');
})();

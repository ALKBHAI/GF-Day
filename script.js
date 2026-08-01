const loader = document.querySelector('.loader');
const body = document.body;
const heartText = document.querySelector('.heart-text');
const loaderLabel = document.querySelector('.loader-label');
const heartStage = document.querySelector('.heart-stage') || document.querySelector('.loader__card');
const heartPath = document.getElementById('heartPath');
const heartPathGlow = document.getElementById('heartPathGlow');
const heartPathSpark = document.getElementById('heartPathSpark');
const loveButton = document.getElementById('loveButton');
const bgAudio = document.getElementById('bgAudio');
const audioToggle = document.getElementById('audioToggle');
const heartSvg = document.querySelector('.heart-svg');
let audioStarting = false;
let audioPlaying = false;

function fadeAudio(volumeTarget, duration) {
  if (!bgAudio) return;
  const startVolume = bgAudio.volume;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    bgAudio.volume = startVolume + (volumeTarget - startVolume) * progress;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function updateAudioButton() {
  if (!audioToggle) return;
  audioToggle.classList.toggle('paused', !audioPlaying);
  audioToggle.setAttribute('aria-pressed', String(audioPlaying));
  audioToggle.textContent = audioPlaying ? '⏸' : '▶';
  audioToggle.setAttribute('aria-label', audioPlaying ? 'Pause music' : 'Play music');
}

function playAudioWithFade() {
  if (!bgAudio || audioPlaying || audioStarting) return;
  audioStarting = true;
  bgAudio.volume = 0;
  bgAudio.muted = true;
  const playPromise = bgAudio.play();

  const startFade = () => {
    bgAudio.muted = false;
    fadeAudio(0.72, 4200);
    audioPlaying = true;
    audioStarting = false;
    updateAudioButton();
  };

  if (playPromise !== undefined) {
    playPromise.then(() => {
      startFade();
    }).catch(() => {
      const resumeAudio = () => {
        bgAudio.play().then(() => {
          startFade();
        }).catch(() => {
          audioStarting = false;
        });
      };
      window.addEventListener('click', resumeAudio, { once: true });
      window.addEventListener('keydown', resumeAudio, { once: true });
    });
  }
}

function pauseAudioWithFade() {
  if (!bgAudio || !audioPlaying) return;
  fadeAudio(0, 1200);
  setTimeout(() => {
    bgAudio.pause();
    audioPlaying = false;
    audioStarting = false;
    updateAudioButton();
  }, 1200);
}

function toggleAudio() {
  if (!bgAudio) return;
  if (audioPlaying) {
    pauseAudioWithFade();
  } else {
    playAudioWithFade();
  }
}

function fadeOutAudio() {
  if (!bgAudio || bgAudio.paused) return;
  fadeAudio(0, 2500);
  setTimeout(() => {
    if (!bgAudio.paused) bgAudio.pause();
  }, 2500);
}

function buildHeartPath(steps = 121, viewBoxSize = 512, padding = 40) {
  const points = [];
  for (let i = 0; i < steps; i += 1) {
    const angle = i * (Math.PI * 2) / 120;
    const x = 16 * Math.pow(Math.sin(angle), 3);
    const y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
    points.push({ x, y });
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const scale = Math.min((viewBoxSize - padding * 2) / (maxX - minX), (viewBoxSize - padding * 2) / (maxY - minY));
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;

  return points
    .map((point, index) => {
      const px = centerX + (point.x - (minX + maxX) / 2) * scale;
      const py = centerY - (point.y - (minY + maxY) / 2) * scale;
      return `${index === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(' ') + ' Z';
}

function setHeartPath() {
  const pathData = buildHeartPath();
  [heartPath, heartPathGlow, heartPathSpark].forEach((path) => {
    path.setAttribute('d', pathData);
  });

  const length = heartPath.getTotalLength();
  [heartPath, heartPathGlow, heartPathSpark].forEach((path) => {
    path.style.setProperty('--path-length', length);
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });

  if (heartSvg) {
    heartSvg.classList.add('ready');
  }
}

window.addEventListener('load', () => {
  setHeartPath();
  playAudioWithFade();
  updateAudioButton();

  if (audioToggle) {
    audioToggle.addEventListener('click', toggleAudio);
  }

  heartPath.addEventListener('animationend', () => {
    heartStage.classList.add('complete');
    heartText.classList.add('visible');
    loaderLabel.classList.add('visible');

    setTimeout(() => {
      body.classList.add('loaded');
      loader.classList.add('hidden');
    }, 600);
  }, { once: true });
});

window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    fadeOutAudio();
  }
});

window.addEventListener('pagehide', fadeOutAudio);

const meterFill = document.getElementById('meterFill');
const meterScore = document.getElementById('meterScore');
const meterNote = document.getElementById('meterNote');
const messageOverlay = document.getElementById('messageOverlay');
let loveScore = 0;
const loveMessages = [
  'I LOVE YOU BABY',
  'PEACE OF MY LIFE',
  'THE ONE I LOVE THE MOST',
  'YOU ARE MY HEART',
  'FOREVER YOURS',
  'YOU ARE MY SUNSHINE'
];

loveButton.addEventListener('click', () => {
  const message = loveMessages[Math.floor(Math.random() * loveMessages.length)];
  messageOverlay.textContent = message;
  messageOverlay.classList.add('show');

  setTimeout(() => {
    messageOverlay.classList.remove('show');
  }, 2400);
  const count = window.innerWidth <= 680 ? 10 : window.innerWidth <= 900 ? 14 : 24;
  const rect = loveButton.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  loveScore = Math.min(100, loveScore + 12);
  meterScore.textContent = `${loveScore}%`;
  meterFill.style.width = `${loveScore}%`;
  meterFill.classList.add('active');
  setTimeout(() => meterFill.classList.remove('active'), 800);

  if (loveScore >= 100) {
    meterNote.textContent = 'Your love is full and shining bright!';
  } else {
    meterNote.textContent = 'Love energy rising with every click.';
  }

  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement('div');
    heart.className = 'burst-heart';
    heart.textContent = '♥';
    const drift = (Math.random() - 0.5) * 240;
    heart.style.left = `${originX + drift}px`;
    heart.style.top = `${originY}px`;
    heart.style.setProperty('--duration', `${1600 + Math.random() * 700}ms`);
    heart.style.fontSize = `${0.9 + Math.random() * 0.8}rem`;
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1800);
  }
});

// Simple audio manager: loads HTMLAudioElement or embeds YouTube iframe.
const tracks = Array.from(document.querySelectorAll('.track'));
let currentAudio = null;
let currentIframe = null;
const ytContainer = document.getElementById('ytContainer');
const volumeSlider = document.getElementById('volume');

function setVolume(v) {
  if(currentAudio) currentAudio.volume = v;
  // youtube iframe volume cannot be set without API when using plain iframe
}

volumeSlider.addEventListener('input', e => setVolume(e.target.value));

tracks.forEach(track => {
  const loadBtn = track.querySelector('.btn-load');
  const playBtn = track.querySelector('.btn-play');
  const src = track.dataset.src;

  loadBtn.addEventListener('click', () => {
    // stop any existing audio/iframe
    stopAll();
    if(src.startsWith('youtube:')) {
      const id = src.split(':')[1];
      ytContainer.style.display = 'block';
      ytContainer.innerHTML = `<iframe width="100%" height="180" src="https://www.youtube.com/shorts/lSNlzH-Q18A" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      currentIframe = ytContainer.querySelector('iframe');
    } else {
      currentAudio = new Audio(src);
      currentAudio.loop = false;
      currentAudio.volume = volumeSlider.value;
      currentAudio.addEventListener('ended', () => { /* optionally move to next track */ });
    }
  });

  playBtn.addEventListener('click', async () => {
    if(src.startsWith('youtube:')) {
      // load if not present
      if(!ytContainer.querySelector('iframe')) loadBtn.click();
      // We cannot trigger play on a cross-origin iframe programmatically reliably; user can click the play button inside iframe
      alert('YouTube players must be played via the embedded player. Click Play inside the YouTube box if present.');
    } else {
      if(!currentAudio || currentAudio.src !== track.dataset.src) {
        loadBtn.click();
      }
      try { 
        await currentAudio.play(); 
      } catch(e) { 
        console.warn('Autoplay blocked — user interaction required.'); 
      }
    }
  });
});

document.getElementById('pauseAll').addEventListener('click', () => {
  if(currentAudio) currentAudio.pause();
});

document.getElementById('stopAll').addEventListener('click', () => {
  stopAll();
});

function stopAll() {
  if(currentAudio) { 
    currentAudio.pause(); 
    currentAudio.currentTime = 0; 
    currentAudio = null; 
  }
  if(currentIframe) { 
    ytContainer.innerHTML = ''; 
    currentIframe = null; 
    ytContainer.style.display = 'none'; 
  }
}

// little fireworks canvas for fun
(function() {
  const c = document.getElementById('fw');
  const ctx = c.getContext('2d');
  
  function resize() { 
    c.width = innerWidth; 
    c.height = innerHeight; 
  }
  
  addEventListener('resize', resize); 
  resize();
  
  const sparks = [];
  
  function rand(a,b) {
    return a + Math.random() * (b-a);
  }
  
  function spawn() {
    const x = rand(0,innerWidth), y = rand(0,innerHeight*0.6);
    const count = Math.floor(rand(10,40));
    for(let i = 0; i < count; i++) {
      sparks.push({
        x,
        y,
        vx: rand(-4,4),
        vy: rand(-4,4),
        life: rand(40,100),
        col: `hsl(${Math.floor(rand(0,360))} 80% 60%)`
      });
    }
  }
  
  setInterval(spawn, 900);
  
  function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    for(let i = sparks.length-1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.06;
      s.life -= 1;
      ctx.globalAlpha = Math.max(0, s.life/120);
      ctx.fillStyle = s.col;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.5, 0, Math.PI*2);
      ctx.fill();
      if(s.life <= 0) sparks.splice(i, 1);
    }
    requestAnimationFrame(frame);
  }
  
  frame();
})();
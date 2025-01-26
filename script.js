const canvasElement = document.getElementById('canvas');
const ctx = canvasElement.getContext('2d');
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;
const thunder = document.getElementById('thunder');
let spots = [];

const mouse = {
  x: undefined,
  y: undefined,
};

// Enable sound on first click (required by modern browsers)
document.addEventListener('click', () => {
  thunder.play().catch(err => console.error('Error playing sound:', err));
});

canvasElement.addEventListener('mousemove', function (event) {
  mouse.x = event.x;
  mouse.y = event.y;

  // Play thunder sound when moving mouse
  if (thunder && thunder.paused) {
    thunder.currentTime = 0; // Restart the sound
    thunder.play().catch(err => console.error('Sound playback issue:', err));
  }

  for (let i = 0; i < 3; i++) {
    spots.push(new Particle());
  }
});

class Particle {
  constructor() {
    this.x = mouse.x;
    this.y = mouse.y;
    this.size = Math.random() * 3 + 0.5; // Slightly larger for lightning
    this.speedX = Math.random() * 4 - 2; // Faster speed
    this.speedY = Math.random() * 4 - 2;
    this.alpha = 1; // Initial opacity (fully visible)
    this.color = `rgba(255, 255, 255, ${this.alpha})`; // Start with full opacity
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > 0.2) this.size -= Math.random() * 0.05; // Moderate shrink rate
    if (this.alpha > 0) this.alpha -= 0.03; // Moderate fade rate
    this.color = `rgba(255, 255, 255, ${this.alpha})`; // Update color with new opacity
  }

  draw() {
    ctx.shadowBlur = 15; // Add glow effect
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow
  }
}

function handleParticle() {
  for (let i = 0; i < spots.length; i++) {
    spots[i].update();
    spots[i].draw();

    for (let j = i; j < spots.length; j++) {
      const dx = spots[i].x - spots[j].x;
      const dy = spots[i].y - spots[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 120) { // Larger threshold for forks
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(spots[i].alpha, spots[j].alpha)})`; // Match fading opacity
        ctx.lineWidth = spots[i].size / 5;
        ctx.moveTo(spots[i].x, spots[i].y);
        ctx.lineTo(spots[j].x, spots[j].y);
        ctx.stroke();
      }
    }

    if (spots[i].size <= 0.2 || spots[i].alpha <= 0) {
      spots.splice(i, 1); // Remove particle when it’s invisible or too small
      i--;
    }
  }
}

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Slightly less transparent for balanced tail fading
  ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  handleParticle();
  requestAnimationFrame(animate);
}

window.addEventListener('resize', function () {
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;
});

window.addEventListener('mouseout', function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

animate();
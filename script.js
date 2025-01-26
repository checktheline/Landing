const canvasElement = document.getElementById('canvas');
const ctx = canvasElement.getContext('2d');
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;

const backgroundMusic = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');

const logoImage = new Image(); // Create an image object for the logo
logoImage.src = "https://raw.githubusercontent.com/checktheline/Landing/main/assets/images/Shockwave-01.png";

let spots = [];

const mouse = {
    x: undefined,
    y: undefined,
};

// Attempt autoplay on page load
backgroundMusic.volume = 0.3; // Set initial volume
backgroundMusic.play().then(() => {
    musicToggle.textContent = 'Off'; // Set initial button text to "Pause" if autoplay works
}).catch(() => {
    console.log("Autoplay blocked. User must start playback manually.");
    musicToggle.textContent = 'Make Moves'; // Set button text to "Play" if autoplay fails
});

// Play/Pause Background Music Toggle
musicToggle.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play().then(() => {
            musicToggle.textContent = 'Off'; // Update button text to "Pause"
        }).catch(err => console.error("Error playing music:", err));
    } else {
        backgroundMusic.pause();
        musicToggle.textContent = 'Make Moves'; // Update button text to "Play"
    }
});

// Mouse movement for particle trails
canvasElement.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;

    for (let i = 0; i < 3; i++) {
        spots.push(new Particle());
    }
});

// Lightning flash on mouse click
document.addEventListener('click', createLightningFlash);

function createLightningFlash() {
    const flash = document.createElement('div');
    flash.classList.add('lightning-flash');
    document.body.appendChild(flash);

    flash.addEventListener('animationend', () => {
        flash.remove();
    });
}

class Particle {
    constructor() {
        this.x = mouse.x;
        this.y = mouse.y;
        this.size = Math.random() * 3 + 0.5;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 - 2;
        this.alpha = 1; // Initial opacity
        this.color = `rgba(255, 255, 255, ${this.alpha})`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= Math.random() * 0.05;
        if (this.alpha > 0) this.alpha -= 0.03;
        this.color = `rgba(255, 255, 255, ${this.alpha})`;
    }

    draw() {
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function handleParticles() {
    for (let i = 0; i < spots.length; i++) {
        spots[i].update();
        spots[i].draw();

        for (let j = i; j < spots.length; j++) {
            const dx = spots[i].x - spots[j].x;
            const dy = spots[i].y - spots[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(spots[i].alpha, spots[j].alpha)})`;
                ctx.lineWidth = spots[i].size / 5;
                ctx.moveTo(spots[i].x, spots[i].y);
                ctx.lineTo(spots[j].x, spots[j].y);
                ctx.stroke();
            }
        }

        if (spots[i].size <= 0.2 || spots[i].alpha <= 0) {
            spots.splice(i, 1);
            i--;
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw logo on the canvas
    ctx.drawImage(logoImage, (canvasElement.width - 1500) / 2, (canvasElement.height - logoImage.height / 2-200) / 2, 1500, logoImage.height / logoImage.width * 1500);

    handleParticles();
    requestAnimationFrame(animate);
}

// Resize canvas
window.addEventListener('resize', () => {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
});

// Clear cursor trail on mouse out
window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

animate();
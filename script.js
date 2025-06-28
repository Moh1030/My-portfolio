AOS.init({
    offset: 50,
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    mirror: false,
    anchorPlacement: 'top-bottom',
});

function toggleDropdown() {
    const dropdown = document.querySelector(".dropdown");
    dropdown.classList.toggle("active");
    document.body.style.overflow = dropdown.classList.contains("active") ? "hidden" : "auto";
}

// --- Canvas JavaScript for Particle Background ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const numParticles = 80;
const maxRadius = 3;
const minRadius = 1;
const maxSpeed = 0.5;

function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = document.body.scrollHeight;
    initParticles();
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, radius, dx, dy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.color = getCssVariable('--primary-neon');
        this.alpha = 0.4 + Math.random() * 0.3;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        const r = parseInt(this.color.substring(1, 3), 16);
        const g = parseInt(this.color.substring(3, 5), 16);
        const b = parseInt(this.color.substring(5, 7), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    update() {
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        const radius = Math.random() * (maxRadius - minRadius) + minRadius;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        const dx = (Math.random() - 0.5) * maxSpeed;
        const dy = (Math.random() - 0.5) * maxSpeed;
        particles.push(new Particle(x, y, radius, dx, dy));
    }
}

function animateParticles() {
    requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const primaryNeon = getCssVariable('--primary-neon');

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }

    for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
            const dist = Math.sqrt(Math.pow(particles[i].x - particles[j].x, 2) + Math.pow(particles[i].y - particles[j].y, 2));
            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                const r = parseInt(primaryNeon.substring(1, 3), 16);
                const g = parseInt(primaryNeon.substring(3, 5), 16);
                const b = parseInt(primaryNeon.substring(5, 7), 16);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.5 - (dist / 200)})`;
                ctx.lineWidth = 0.5;
                ctx.shadowBlur = 5;
                ctx.shadowColor = primaryNeon;
                ctx.stroke();
            }
        }
    }
}
animateParticles();



// --- Skills Tab Functionality ---
function showTab(event, tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active'); // Use currentTarget for the button clicked

    // Reinitialize AOS to animate elements in the new active tab
    AOS.refreshHard();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tech').classList.add('active');
    document.querySelector('.tab-btn').classList.add('active');
    AOS.refreshHard(); // Ensure initial animations run correctly

    // --- Formspree Form Submission Handling ---
    const form = document.getElementById('contact-form');
    const statusMsg = document.getElementById('status-msg');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const formData = new FormData(form);
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json' // Essential for Formspree to return JSON for success/error
                }
            });

            if (response.ok) {
                statusMsg.innerText = "✅ Message sent successfully!";
                statusMsg.style.color = "var(--tertiary-neon)";
                statusMsg.style.backgroundColor = "rgba(0, 255, 136, 0.1)";
                statusMsg.style.boxShadow = "0 0 15px rgba(0, 255, 136, 0.6)";
                form.reset(); // Clear the form fields
                setTimeout(() => {
                    statusMsg.innerText = ""; // Clear message
                    statusMsg.style.backgroundColor = "transparent"; // Reset background
                    statusMsg.style.boxShadow = "none"; // Reset shadow
                }, 5000); // Clear message after 5 seconds
            } else {
                // Attempt to parse JSON error response if available
                let errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
                statusMsg.innerText = `❌ Failed to send message! ${errorData.message || 'Please try again later.'}`;
                statusMsg.style.color = "#FF0000"; // Red for error
                statusMsg.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
                statusMsg.style.boxShadow = "0 0 15px rgba(255, 0, 0, 0.6)";
                console.error('Formspree Error:', response.status, errorData);
                setTimeout(() => {
                    statusMsg.innerText = "";
                    statusMsg.style.backgroundColor = "transparent";
                    statusMsg.style.boxShadow = "none";
                }, 5000); // Clear message after 5 seconds
            }
        } catch (error) {
            statusMsg.innerText = "❌ Network error! Please check your connection.";
            statusMsg.style.color = "#FF0000"; // Red for error
            statusMsg.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
            statusMsg.style.boxShadow = "0 0 15px rgba(255, 0, 0, 0.6)";
            console.error('Network error during form submission:', error);
            setTimeout(() => {
                statusMsg.innerText = "";
                statusMsg.style.backgroundColor = "transparent";
                statusMsg.style.boxShadow = "none";
            }, 5000); // Clear message after 5 seconds
        }
    });

    let mainCurrentIndex = 0;
    const mainTestimonials = document.querySelectorAll('#testimonials .main-testimonial-item');
    const dots = document.querySelectorAll('.testimonial-dots .dot');

    function showMainTestimonial(index) {
        mainTestimonials.forEach((item, i) => {
            // Only toggle 'active' class. CSS transitions will handle visibility and opacity.
            item.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // Manual navigation via dots (exposed globally for onclick in HTML)
    window.selectMainTestimonial = function (index) {
        mainCurrentIndex = index;
        showMainTestimonial(mainCurrentIndex);
    };

    // Initial display
    if (mainTestimonials.length > 0) {
        showMainTestimonial(mainCurrentIndex);
    }

    // Auto change every 3 seconds
    setInterval(() => {
        if (mainTestimonials.length > 0) {
            mainCurrentIndex = (mainCurrentIndex + 1) % mainTestimonials.length;
            showMainTestimonial(mainCurrentIndex);
        }
    }, 3000);
});

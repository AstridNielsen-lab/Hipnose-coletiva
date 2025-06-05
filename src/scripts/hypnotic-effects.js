/* ==========================================================================
   EFEITOS HIPNÓTICOS AVANÇADOS - SISTEMA COMPLETO
   Parallax, Espirais, Ilusões Óticas e Hipnose Visual
   ========================================================================== */

// Estado global dos efeitos hipnóticos
const HypnoticState = {
    isActive: false,
    scrollY: 0,
    mouseX: 0,
    mouseY: 0,
    frameCount: 0,
    spirals: [],
    particles: [],
    pulseIntensity: 0,
    focusLevel: 0
};

// Configurações dos efeitos
const HypnoticConfig = {
    spiralSpeed: 0.5,
    particleCount: 50,
    pulseFrequency: 0.02,
    parallaxMultiplier: 0.3,
    focusThreshold: 100,
    transitionDuration: 2000
};

/* ==========================================================================
   INICIALIZAÇÃO DOS EFEITOS HIPNÓTICOS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌀 Iniciando Sistema Hipnótico Avançado...');
    initializeHypnoticEffects();
    setupEventListeners();
    startAnimationLoop();
});

function initializeHypnoticEffects() {
    createMainHypnoticSpiral();
    createParticleSystem();
    createParallaxLayers();
    initializeScrollEffects();
    setupMouseTracking();
    createPulsingEffects();
    
    HypnoticState.isActive = true;
    console.log('✨ Sistema Hipnótico Ativado!');
}

/* ==========================================================================
   ESPIRAL HIPNÓTICA PRINCIPAL - ILUSÃO ÓTICA AVANÇADA
   ========================================================================== */

function createMainHypnoticSpiral() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    // Container principal da espiral
    const spiralContainer = document.createElement('div');
    spiralContainer.className = 'main-hypnotic-spiral-container';
    spiralContainer.innerHTML = `
        <div class="hypnotic-spiral-main">
            <div class="spiral-layer spiral-layer-1"></div>
            <div class="spiral-layer spiral-layer-2"></div>
            <div class="spiral-layer spiral-layer-3"></div>
            <div class="spiral-layer spiral-layer-4"></div>
            <div class="spiral-layer spiral-layer-5"></div>
            <div class="spiral-center-pulse"></div>
        </div>
        <div class="hypnotic-rings">
            <div class="hypno-ring ring-1"></div>
            <div class="hypno-ring ring-2"></div>
            <div class="hypno-ring ring-3"></div>
            <div class="hypno-ring ring-4"></div>
            <div class="hypno-ring ring-5"></div>
        </div>
    `;
    
    heroSection.appendChild(spiralContainer);
    
    // Criar espiral matemática procedural
    createProceduralSpiral();
}

function createProceduralSpiral() {
    const spiralLayers = document.querySelectorAll('.spiral-layer');
    
    spiralLayers.forEach((layer, index) => {
        const segments = 60 + (index * 20); // Mais segmentos = mais suave
        const radius = 150 + (index * 30);
        const spiralTurns = 3 + (index * 0.5);
        
        for (let i = 0; i < segments; i++) {
            const segment = document.createElement('div');
            segment.className = 'spiral-segment';
            
            const angle = (i / segments) * spiralTurns * Math.PI * 2;
            const spiralRadius = (i / segments) * radius;
            
            const x = Math.cos(angle) * spiralRadius;
            const y = Math.sin(angle) * spiralRadius;
            
            segment.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                width: 3px;
                height: 3px;
                background: linear-gradient(45deg, 
                    rgba(255, 215, 0, ${0.8 - (i / segments) * 0.7}),
                    rgba(255, 255, 255, ${0.3 - (i / segments) * 0.3})
                );
                border-radius: 50%;
                transform: translate(${x}px, ${y}px);
                animation: spiralPulse ${2 + index * 0.5}s ease-in-out infinite;
                animation-delay: ${i * 0.05}s;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            `;
            
            layer.appendChild(segment);
        }
    });
}

/* ==========================================================================
   SISTEMA DE PARTÍCULAS HIPNÓTICAS
   ========================================================================== */

function createParticleSystem() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'hypnotic-particles';
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < HypnoticConfig.particleCount; i++) {
        createHypnoticParticle(particleContainer, i);
    }
}

function createHypnoticParticle(container, index) {
    const particle = document.createElement('div');
    particle.className = 'hypno-particle';
    
    const size = Math.random() * 4 + 2;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const hue = Math.random() * 60 + 30; // Tons dourados
    
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, 
            hsla(${hue}, 100%, 70%, 0.8) 0%, 
            transparent 70%
        );
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        animation: particleFloat ${5 + Math.random() * 10}s ease-in-out infinite;
        animation-delay: ${index * 0.1}s;
    `;
    
    container.appendChild(particle);
    
    HypnoticState.particles.push({
        element: particle,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: size,
        hue: hue
    });
}

/* ==========================================================================
   EFEITOS PARALLAX AVANÇADOS
   ========================================================================== */

function createParallaxLayers() {
    const layers = [
        { className: 'parallax-layer-1', speed: 0.1, opacity: 0.3 },
        { className: 'parallax-layer-2', speed: 0.3, opacity: 0.2 },
        { className: 'parallax-layer-3', speed: 0.5, opacity: 0.1 }
    ];
    
    layers.forEach((layerConfig, index) => {
        const layer = document.createElement('div');
        layer.className = `parallax-layer ${layerConfig.className}`;
        layer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 120%;
            height: 120%;
            opacity: ${layerConfig.opacity};
            background: radial-gradient(circle at 30% 70%, 
                rgba(102, 126, 234, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 70% 30%, 
                rgba(118, 75, 162, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, 
                rgba(255, 215, 0, 0.1) 0%, transparent 70%);
            pointer-events: none;
            z-index: -${index + 1};
        `;
        
        document.body.appendChild(layer);
    });
}

function updateParallax() {
    const scrollY = window.pageYOffset;
    const layers = document.querySelectorAll('.parallax-layer');
    
    layers.forEach((layer, index) => {
        const speed = 0.1 + (index * 0.2);
        const yPos = -(scrollY * speed);
        const rotation = scrollY * 0.01;
        
        layer.style.transform = `
            translate3d(0, ${yPos}px, 0) 
            rotate(${rotation}deg) 
            scale(${1 + Math.sin(scrollY * 0.005) * 0.1})
        `;
    });
    
    // Efeito parallax na espiral principal
    const mainSpiral = document.querySelector('.main-hypnotic-spiral-container');
    if (mainSpiral) {
        const intensity = Math.min(scrollY / 500, 1);
        mainSpiral.style.transform = `
            scale(${1 + intensity * 0.3}) 
            rotate(${scrollY * 0.1}deg)
        `;
        mainSpiral.style.opacity = Math.max(1 - (scrollY / 800), 0.3);
    }
}

/* ==========================================================================
   EFEITOS DE SCROLL HIPNÓTICOS
   ========================================================================== */

function initializeScrollEffects() {
    const sections = document.querySelectorAll('.scroll-stop');
    
    sections.forEach((section, index) => {
        // Criar efeitos específicos para cada seção
        createSectionHypnoticEffect(section, index);
    });
    
    // Observador de interseção para ativar efeitos
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activateSectionEffect(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    sections.forEach(section => observer.observe(section));
}

function createSectionHypnoticEffect(section, index) {
    const effectContainer = document.createElement('div');
    effectContainer.className = `section-hypno-effect effect-${index}`;
    
    switch (index) {
        case 0: // Mandala section
            createMandalaEffect(effectContainer);
            break;
        case 1: // Eye section
            createEyeEffect(effectContainer);
            break;
        case 2: // Whisper section
            createWhisperEffect(effectContainer);
            break;
    }
    
    section.appendChild(effectContainer);
}

function createMandalaEffect(container) {
    container.innerHTML = `
        <div class="mandala-hypno">
            <div class="mandala-ring" data-ring="1"></div>
            <div class="mandala-ring" data-ring="2"></div>
            <div class="mandala-ring" data-ring="3"></div>
            <div class="mandala-ring" data-ring="4"></div>
            <div class="mandala-center"></div>
        </div>
    `;
}

function createEyeEffect(container) {
    container.innerHTML = `
        <div class="eye-hypno">
            <div class="eye-outer"></div>
            <div class="eye-iris"></div>
            <div class="eye-pupil"></div>
            <div class="eye-reflection"></div>
        </div>
    `;
}

function createWhisperEffect(container) {
    container.innerHTML = `
        <div class="whisper-waves">
            <div class="wave wave-1"></div>
            <div class="wave wave-2"></div>
            <div class="wave wave-3"></div>
            <div class="wave wave-4"></div>
        </div>
    `;
}

/* ==========================================================================
   RASTREAMENTO DE MOUSE E INTERATIVIDADE
   ========================================================================== */

function setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
        HypnoticState.mouseX = e.clientX / window.innerWidth;
        HypnoticState.mouseY = e.clientY / window.innerHeight;
        
        updateMouseEffects();
    });
    
    document.addEventListener('click', (e) => {
        createClickRipple(e.clientX, e.clientY);
    });
}

function updateMouseEffects() {
    // Efeito de seguimento do mouse na espiral
    const mainSpiral = document.querySelector('.main-hypnotic-spiral-container');
    if (mainSpiral) {
        const rotationX = (HypnoticState.mouseY - 0.5) * 20;
        const rotationY = (HypnoticState.mouseX - 0.5) * 20;
        
        mainSpiral.style.transform += ` rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }
    
    // Atualizar partículas baseado no mouse
    updateParticlesMouse();
    
    // Efeito nos anéis hipnóticos
    const rings = document.querySelectorAll('.hypno-ring');
    rings.forEach((ring, index) => {
        const distance = Math.sqrt(
            Math.pow(HypnoticState.mouseX - 0.5, 2) + 
            Math.pow(HypnoticState.mouseY - 0.5, 2)
        );
        
        const scale = 1 + (1 - distance) * 0.3;
        ring.style.transform = `scale(${scale}) rotate(${Date.now() * 0.001 * (index + 1)}rad)`;
    });
}

function createClickRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 215, 0, 0.8);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 1000;
        animation: rippleExpand 1s ease-out forwards;
    `;
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        document.body.removeChild(ripple);
    }, 1000);
}

/* ==========================================================================
   EFEITOS DE PULSAÇÃO E RESPIRAÇÃO
   ========================================================================== */

function createPulsingEffects() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    
    const pulseOverlay = document.createElement('div');
    pulseOverlay.className = 'hypnotic-pulse-overlay';
    pulseOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, 
            transparent 30%, 
            rgba(255, 215, 0, 0.05) 50%, 
            transparent 70%
        );
        animation: breathingPulse 4s ease-in-out infinite;
        pointer-events: none;
        z-index: 2;
    `;
    
    hero.appendChild(pulseOverlay);
}

/* ==========================================================================
   LOOP DE ANIMAÇÃO PRINCIPAL
   ========================================================================== */

function startAnimationLoop() {
    function animate() {
        if (!HypnoticState.isActive) return;
        
        HypnoticState.frameCount++;
        
        // Atualizar efeitos a cada frame
        updateSpirals();
        updateParticles();
        updatePulseEffects();
        updateScrollBasedEffects();
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

function updateSpirals() {
    const spiralLayers = document.querySelectorAll('.spiral-layer');
    spiralLayers.forEach((layer, index) => {
        const rotation = (HypnoticState.frameCount * HypnoticConfig.spiralSpeed * (index + 1)) % 360;
        layer.style.transform = `rotate(${rotation}deg)`;
    });
    
    const rings = document.querySelectorAll('.hypno-ring');
    rings.forEach((ring, index) => {
        const rotation = (HypnoticState.frameCount * 0.5 * (index + 1)) % 360;
        const scale = 1 + Math.sin(HypnoticState.frameCount * 0.02) * 0.1;
        ring.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    });
}

function updateParticles() {
    HypnoticState.particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Manter partículas na tela
        if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
        if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
        
        // Adicionar movimento orbital
        const time = Date.now() * 0.001;
        const orbitalX = Math.sin(time + particle.x * 0.001) * 10;
        const orbitalY = Math.cos(time + particle.y * 0.001) * 10;
        
        particle.element.style.transform = `translate(${orbitalX}px, ${orbitalY}px)`;
        
        // Variar opacidade
        const opacity = (Math.sin(time * 2 + particle.x * 0.01) + 1) * 0.5;
        particle.element.style.opacity = opacity;
    });
}

function updateParticlesMouse() {
    const mouseInfluence = 50;
    
    HypnoticState.particles.forEach(particle => {
        const mouseX = HypnoticState.mouseX * window.innerWidth;
        const mouseY = HypnoticState.mouseY * window.innerHeight;
        
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseInfluence) {
            const force = (mouseInfluence - distance) / mouseInfluence;
            particle.vx += (dx / distance) * force * 0.01;
            particle.vy += (dy / distance) * force * 0.01;
        }
    });
}

function updatePulseEffects() {
    const pulseIntensity = (Math.sin(HypnoticState.frameCount * HypnoticConfig.pulseFrequency) + 1) * 0.5;
    HypnoticState.pulseIntensity = pulseIntensity;
    
    // Aplicar pulsação à espiral central
    const spiralCenter = document.querySelector('.spiral-center-pulse');
    if (spiralCenter) {
        const scale = 1 + pulseIntensity * 0.5;
        spiralCenter.style.transform = `scale(${scale})`;
        spiralCenter.style.opacity = 0.3 + pulseIntensity * 0.7;
    }
}

function updateScrollBasedEffects() {
    const scrollProgress = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
    HypnoticState.focusLevel = Math.min(scrollProgress * 100, 100);
    
    // Intensificar efeitos baseado no scroll
    const intensity = scrollProgress;
    document.body.style.filter = `
        saturate(${1 + intensity * 0.5}) 
        contrast(${1 + intensity * 0.2})
        brightness(${1 - intensity * 0.1})
    `;
}

/* ==========================================================================
   ATIVAÇÃO DE EFEITOS POR SEÇÃO
   ========================================================================== */

function activateSectionEffect(section) {
    const effectClass = section.className.includes('mandala') ? 'mandala-active' :
                       section.className.includes('eye') ? 'eye-active' :
                       section.className.includes('video') ? 'whisper-active' : '';
    
    if (effectClass) {
        document.body.classList.add(effectClass);
        
        // Remover classe após um tempo
        setTimeout(() => {
            document.body.classList.remove(effectClass);
        }, 3000);
    }
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

function setupEventListeners() {
    // Scroll listener para parallax
    window.addEventListener('scroll', () => {
        HypnoticState.scrollY = window.pageYOffset;
        updateParallax();
    }, { passive: true });
    
    // Resize listener
    window.addEventListener('resize', () => {
        // Recriar partículas para nova dimensão
        const particleContainer = document.querySelector('.hypnotic-particles');
        if (particleContainer) {
            particleContainer.innerHTML = '';
            HypnoticState.particles = [];
            
            for (let i = 0; i < HypnoticConfig.particleCount; i++) {
                createHypnoticParticle(particleContainer, i);
            }
        }
    });
    
    // Visibility change - pausar animações quando não visível
    document.addEventListener('visibilitychange', () => {
        HypnoticState.isActive = !document.hidden;
        
        if (HypnoticState.isActive) {
            startAnimationLoop();
        }
    });
}

/* ==========================================================================
   FUNÇÕES UTILITÁRIAS
   ========================================================================== */

function getHypnoticIntensity() {
    return HypnoticState.focusLevel / 100;
}

function setHypnoticSpeed(speed) {
    HypnoticConfig.spiralSpeed = speed;
}

function toggleHypnoticEffects() {
    HypnoticState.isActive = !HypnoticState.isActive;
    
    if (HypnoticState.isActive) {
        startAnimationLoop();
    }
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.HypnoticEffects = {
        getIntensity: getHypnoticIntensity,
        setSpeed: setHypnoticSpeed,
        toggle: toggleHypnoticEffects,
        state: HypnoticState
    };
}

console.log('🌀 Sistema Hipnótico Avançado Carregado!');
console.log('🎯 Efeitos: Parallax, Espirais, Partículas, Mouse Tracking');
console.log('✨ Status: Pronto para hipnotizar visitantes!');


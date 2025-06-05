/* ==========================================================================
   STUDENT AREA - JAVASCRIPT INTERATIVO
   Sistema de Login e Dashboard do Aluno
   ========================================================================== */

// Configurações globais
const CONFIG = {
    admin: {
        email: 'juliocamposmachado@gmail.com',
        passwordHash: btoa('123456789')
    },
    modules: {
        totalModules: 5,
        unlockInterval: 2 // dias entre liberações
    },
    focus: {
        targetLevel: 100,
        incrementRate: 5
    }
};

// Estado global da aplicação
let appState = {
    currentUser: null,
    focusLevel: 0,
    completedModules: [],
    totalFocusTime: 0,
    focusStreak: 0,
    focusGems: 0,
    prosperityIndex: 0
};

/* ==========================================================================
   SISTEMA DE LOGIN
   ========================================================================== */

// Inicialização quando o DOM carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkExistingSession();
});

function initializeApp() {
    console.log('🚀 Iniciando Portal Hipnótico...');
    
    // Verificar se é admin
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        showAdminLogin();
    }
    
    // Animações iniciais
    startPortalAnimations();
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Module buttons
    document.querySelectorAll('.start-module-btn').forEach(btn => {
        btn.addEventListener('click', handleModuleStart);
    });
    
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', handleToolClick);
    });
    
    // Close buttons
    document.querySelectorAll('.close-modal, .close-player').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Verificar se é admin
    if (email.toLowerCase() === CONFIG.admin.email.toLowerCase()) {
        const passwordHash = btoa(password);
        if (passwordHash === CONFIG.admin.passwordHash) {
            loginAsAdmin(email);
            return;
        }
    }
    
    // Login regular de aluno
    if (validateStudentLogin(email, password)) {
        loginAsStudent(email);
    } else {
        showLoginError('Credenciais inválidas. Verifique seu email e código de ativação.');
    }
}

function loginAsAdmin(email) {
    console.log('👑 Login de Admin detectado!');
    
    appState.currentUser = {
        email: email,
        role: 'admin',
        permissions: {
            fullAccess: true,
            canManageUsers: true,
            canAccessAnalytics: true
        },
        loginTime: new Date().toISOString()
    };
    
    // Salvar sessão
    localStorage.setItem('userSession', JSON.stringify(appState.currentUser));
    localStorage.setItem('userType', 'admin');
    
    // Mostrar dashboard com privilégios admin
    showDashboard(true);
    showWelcomeMessage('Bem-vindo, Administrador!');
    
    // Liberar todos os módulos para admin
    unlockAllModulesForAdmin();
}

function loginAsStudent(email) {
    console.log('👨‍🎓 Login de Aluno realizado');
    
    appState.currentUser = {
        email: email,
        role: 'student',
        loginTime: new Date().toISOString()
    };
    
    // Salvar sessão
    localStorage.setItem('userSession', JSON.stringify(appState.currentUser));
    localStorage.setItem('userType', 'student');
    
    // Mostrar dashboard normal
    showDashboard(false);
    showWelcomeMessage('Bem-vindo ao seu treinamento de HIPERFOCO!');
    
    // Carregar progresso do aluno
    loadStudentProgress();
}

function validateStudentLogin(email, password) {
    // Verificar se é admin primeiro
    if (email.toLowerCase() === CONFIG.admin.email.toLowerCase()) {
        return false; // Admin usa validação separada
    }
    
    // Verificar se email tem acesso (comprou o produto)
    const hasAccess = CheckoutFlow?.validateAccess(email.toLowerCase());
    if (hasAccess) {
        // Se tem acesso, aceitar códigos padrão
        const validCodes = ['FOCO2024', 'HIPER123', 'MENTAL456', password];
        return email.includes('@') && validCodes.includes(password);
    }
    
    // Se não tem acesso, verificar se há dados de compra
    const userAccount = localStorage.getItem('user_account');
    if (userAccount) {
        const userData = JSON.parse(userAccount);
        if (userData.email.toLowerCase() === email.toLowerCase() && userData.hasAccess) {
            const validCodes = ['FOCO2024', 'HIPER123', 'MENTAL456', userData.accessCode, password];
            return validCodes.includes(password);
        }
    }
    
    return false;
}

function checkExistingSession() {
    const session = localStorage.getItem('userSession');
    if (session) {
        const userData = JSON.parse(session);
        appState.currentUser = userData;
        
        if (userData.role === 'admin') {
            showDashboard(true);
            unlockAllModulesForAdmin();
        } else {
            showDashboard(false);
            loadStudentProgress();
        }
    }
}

/* ==========================================================================
   INTERFACE DO DASHBOARD
   ========================================================================== */

function showDashboard(isAdmin = false) {
    // Esconder portal de login
    const loginPortal = document.getElementById('login-portal');
    const dashboard = document.getElementById('student-dashboard');
    
    if (loginPortal) loginPortal.style.display = 'none';
    if (dashboard) {
        dashboard.style.display = 'block';
        
        // Adicionar classe admin se necessário
        if (isAdmin) {
            dashboard.classList.add('admin-mode');
            addAdminControls();
        }
        
        // Animar entrada
        dashboard.classList.add('fade-in-up');
    }
    
    // Atualizar UI
    updateFocusLevel();
    updateStatistics();
    
    console.log(`📊 Dashboard ${isAdmin ? 'Admin' : 'Aluno'} carregado`);
}

function addAdminControls() {
    // Adicionar controles específicos do admin
    const header = document.querySelector('.dashboard-header');
    if (header && !header.querySelector('.admin-controls')) {
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';
        adminControls.innerHTML = `
            <div class="admin-badge">
                👑 MODO ADMINISTRADOR
            </div>
            <button class="admin-btn" onclick="showAdminPanel()">Painel Admin</button>
            <button class="admin-btn" onclick="adminLogout()">Sair</button>
        `;
        header.appendChild(adminControls);
    }
}

function unlockAllModulesForAdmin() {
    document.querySelectorAll('.module-card').forEach(card => {
        card.setAttribute('data-status', 'available');
        card.classList.remove('locked');
        
        const btn = card.querySelector('.start-module-btn');
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('locked');
            btn.textContent = 'INICIAR TREINAMENTO';
        }
        
        const status = card.querySelector('.module-status');
        if (status) {
            status.textContent = 'ADMIN ACCESS';
            status.className = 'module-status available';
        }
    });
}

function showWelcomeMessage(message) {
    const welcomeSection = document.querySelector('.welcome-message h2');
    if (welcomeSection) {
        welcomeSection.textContent = message;
        welcomeSection.classList.add('bounce-in');
    }
}

/* ==========================================================================
   SISTEMA DE PROGRESSO E FOCO
   ========================================================================== */

function updateFocusLevel(level = null) {
    if (level !== null) {
        appState.focusLevel = Math.min(level, 100);
    }
    
    const focusBar = document.getElementById('user-focus-level');
    const focusPercentage = document.getElementById('focus-percentage');
    
    if (focusBar && focusPercentage) {
        focusBar.style.width = appState.focusLevel + '%';
        focusPercentage.textContent = appState.focusLevel + '%';
        
        // Animação de pulsação
        focusBar.classList.add('pulse');
        setTimeout(() => focusBar.classList.remove('pulse'), 1000);
    }
}

function updateStatistics() {
    // Atualizar estatísticas na tela
    const stats = {
        'total-focus-time': appState.totalFocusTime + ' min',
        'focus-streak': appState.focusStreak + ' dias',
        'focus-gems': appState.focusGems,
        'prosperity-index': appState.prosperityIndex + '%'
    };
    
    Object.entries(stats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            element.classList.add('bounce-in');
        }
    });
}

function loadStudentProgress() {
    // Carregar progresso salvo (localStorage ou API)
    const saved = localStorage.getItem('studentProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        appState = { ...appState, ...progress };
    } else {
        // Primeiro acesso - configurar valores iniciais
        appState.focusLevel = 15;
        appState.focusGems = 5;
        appState.prosperityIndex = 10;
    }
    
    updateFocusLevel();
    updateStatistics();
}

function saveStudentProgress() {
    localStorage.setItem('studentProgress', JSON.stringify({
        focusLevel: appState.focusLevel,
        completedModules: appState.completedModules,
        totalFocusTime: appState.totalFocusTime,
        focusStreak: appState.focusStreak,
        focusGems: appState.focusGems,
        prosperityIndex: appState.prosperityIndex
    }));
}

/* ==========================================================================
   HANDLERS DE EVENTOS
   ========================================================================== */

function handleModuleStart(e) {
    const moduleId = e.target.getAttribute('data-module');
    const moduleCard = e.target.closest('.module-card');
    const status = moduleCard.getAttribute('data-status');
    
    if (status === 'locked' && appState.currentUser?.role !== 'admin') {
        showMessage('Este módulo ainda não foi liberado. Continue com o módulo atual!', 'warning');
        return;
    }
    
    console.log(`🎯 Iniciando módulo ${moduleId}`);
    openModulePlayer(moduleId);
}

function handleToolClick(e) {
    const toolId = e.target.closest('.tool-btn').id;
    
    switch(toolId) {
        case 'focus-timer':
            openFocusTimer();
            break;
        case 'distraction-blocker':
            activateDistractionBlocker();
            break;
        case 'prosperity-visualizer':
            openProsperityVisualizer();
            break;
        case 'neural-calibrator':
            openNeuralCalibrator();
            break;
    }
}

function openModulePlayer(moduleId) {
    const modal = document.getElementById('module-player');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('fade-in');
        
        // Configurar conteúdo do módulo
        const title = document.getElementById('current-module-title');
        if (title) {
            title.textContent = `MÓDULO ${moduleId} - TREINAMENTO ATIVO`;
        }
        
        // Iniciar hipnose de fundo
        startHypnoticBackground();
    }
}

function openFocusTimer() {
    const modal = document.getElementById('focus-timer-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('fade-in');
    }
}

function closeModal(e) {
    const modal = e.target.closest('.modal-overlay');
    if (modal) {
        modal.classList.add('fade-out');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('fade-out');
        }, 300);
    }
}

/* ==========================================================================
   EFEITOS VISUAIS E ANIMAÇÕES
   ========================================================================== */

function startPortalAnimations() {
    // Animar anéis do portal
    const rings = document.querySelectorAll('.portal-ring');
    rings.forEach((ring, index) => {
        ring.style.animationDelay = (index * 0.5) + 's';
    });
}

function startHypnoticBackground() {
    const spiral = document.querySelector('.hypnotic-spiral');
    if (spiral) {
        spiral.classList.add('active');
    }
}

function showLoginError(message) {
    // Criar elemento de erro se não existir
    let errorDiv = document.querySelector('.login-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        const form = document.getElementById('login-form');
        form.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.classList.add('shake');
    
    setTimeout(() => {
        errorDiv.classList.remove('shake');
        errorDiv.style.display = 'none';
    }, 3000);
}

function showMessage(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/* ==========================================================================
   FUNÇÕES ADMIN
   ========================================================================== */

function showAdminPanel() {
    console.log('👑 Abrindo painel administrativo...');
    // Implementar painel admin completo
    alert('Painel Admin em desenvolvimento!');
}

function adminLogout() {
    localStorage.clear();
    window.location.reload();
}

function showAdminLogin() {
    const subtitle = document.querySelector('.portal-subtitle');
    if (subtitle) {
        subtitle.textContent = 'Acesso administrativo - Digite suas credenciais';
        subtitle.style.color = '#ffd700';
    }
}

/* ==========================================================================
   FERRAMENTAS INTERATIVAS
   ========================================================================== */

function activateDistractionBlocker() {
    showMessage('🛡️ Bloqueador Mental ativado! Distrações neutralizadas.', 'success');
    // Implementar lógica de bloqueio
}

function openProsperityVisualizer() {
    showMessage('🎯 Visualizador de Metas carregando...', 'info');
    // Implementar visualizador
}

function openNeuralCalibrator() {
    showMessage('🧠 Calibrador Neural iniciando sequência...', 'info');
    // Implementar calibrador
}

// Auto-save do progresso a cada 30 segundos
setInterval(() => {
    if (appState.currentUser) {
        saveStudentProgress();
    }
}, 30000);

// Verificar parâmetros da URL para modo admin
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('admin') === 'true') {
    document.body.classList.add('admin-mode-active');
    console.log('🔐 Modo Admin ativado via URL');
}

console.log('✅ Sistema Student Area carregado com sucesso!');
console.log('🔐 Admin configurado:', CONFIG.admin.email);
console.log('💡 Para acesso admin, use: student-area.html?admin=true');


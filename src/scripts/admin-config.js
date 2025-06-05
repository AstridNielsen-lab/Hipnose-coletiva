/* ==========================================================================
   CONFIGURAÇÃO DE ADMINISTRADOR - HIPERFOCO ABSOLUTO
   ========================================================================== */

// Configurações do administrador (em produção, usar variáveis de ambiente)
const ADMIN_CONFIG = {
    email: 'juliocamposmachado@gmail.com',
    // Hash da senha para segurança (em produção, usar bcrypt)
    passwordHash: btoa('123456789'), // Base64 básico - em produção usar hash real
    permissions: {
        fullAccess: true,
        canManageUsers: true,
        canAccessAnalytics: true,
        canModifyContent: true,
        canManagePayments: true
    },
    dashboard: {
        theme: 'dark',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo'
    }
};

// Função para validar login do administrador
function validateAdminLogin(email, password) {
    if (email.toLowerCase() === ADMIN_CONFIG.email.toLowerCase()) {
        const passwordHash = btoa(password);
        if (passwordHash === ADMIN_CONFIG.passwordHash) {
            return {
                success: true,
                user: {
                    email: ADMIN_CONFIG.email,
                    role: 'admin',
                    permissions: ADMIN_CONFIG.permissions,
                    loginTime: new Date().toISOString()
                }
            };
        }
    }
    return {
        success: false,
        error: 'Credenciais inválidas'
    };
}

// Função para verificar se o usuário é admin
function isAdmin(email) {
    return email && email.toLowerCase() === ADMIN_CONFIG.email.toLowerCase();
}

// Função para criar sessão de admin
function createAdminSession(adminData) {
    const sessionData = {
        ...adminData,
        sessionId: generateSessionId(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    };
    
    // Salvar na localStorage (em produção, usar tokens JWT)
    localStorage.setItem('adminSession', JSON.stringify(sessionData));
    localStorage.setItem('userType', 'admin');
    
    return sessionData;
}

// Função para verificar sessão ativa
function checkAdminSession() {
    const session = localStorage.getItem('adminSession');
    if (session) {
        const sessionData = JSON.parse(session);
        const now = new Date();
        const expires = new Date(sessionData.expiresAt);
        
        if (now < expires) {
            return sessionData;
        } else {
            // Sessão expirada
            localStorage.removeItem('adminSession');
            localStorage.removeItem('userType');
        }
    }
    return null;
}

// Função para gerar ID de sessão
function generateSessionId() {
    return 'admin_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Função para logout do admin
function adminLogout() {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('userType');
    window.location.href = 'index.html';
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.AdminConfig = {
        validate: validateAdminLogin,
        isAdmin: isAdmin,
        createSession: createAdminSession,
        checkSession: checkAdminSession,
        logout: adminLogout,
        config: ADMIN_CONFIG
    };
}

// Log de configuração (apenas em desenvolvimento)
console.log('🔐 Sistema de Admin configurado para:', ADMIN_CONFIG.email);


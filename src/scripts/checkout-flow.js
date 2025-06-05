/* ==========================================================================
   CHECKOUT FLOW - MERCADO PAGO INTEGRATION
   Sistema Completo de Pagamento e Validação
   ========================================================================== */

// Configurações do checkout
const CheckoutConfig = {
    mercadoPagoPreferenceId: '29008060-7409e1c8-7c4b-4292-bebb-244f870d7bb0',
    redirectUrl: 'student-area.html',
    validateEmail: true,
    storageKey: 'hiperfoco_purchase_data'
};

// Estado do checkout
const CheckoutState = {
    userEmail: null,
    purchaseData: null,
    paymentStatus: null,
    validationStep: 0
};

/* ==========================================================================
   INICIALIZAÇÃO DO CHECKOUT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('💰 Iniciando Sistema de Checkout...');
    initializeCheckout();
    setupCheckoutListeners();
    checkPurchaseStatus();
});

function initializeCheckout() {
    // Verificar se há dados de compra pendente
    const pendingPurchase = localStorage.getItem('pending_purchase');
    if (pendingPurchase) {
        const data = JSON.parse(pendingPurchase);
        showPurchaseValidation(data);
    }
    
    // Verificar parâmetros da URL (retorno do MP)
    checkUrlParameters();
}

/* ==========================================================================
   FLUXO DE PAGAMENTO
   ========================================================================== */

function setupCheckoutListeners() {
    // Botão principal de compra
    const buyButton = document.getElementById('buy-now-trigger');
    if (buyButton) {
        buyButton.addEventListener('click', handleBuyButtonClick);
    }
    
    // Detectar quando o script do MP carrega
    window.addEventListener('message', handleMercadoPagoMessage);
}

function handleBuyButtonClick(e) {
    e.preventDefault();
    console.log('🛒 Iniciando processo de compra...');
    
    // Criar modal de pré-checkout para coletar email
    showPreCheckoutModal();
}

function showPreCheckoutModal() {
    const modal = createPreCheckoutModal();
    document.body.appendChild(modal);
    
    // Animar entrada
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

function createPreCheckoutModal() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal-overlay';
    modal.innerHTML = `
        <div class="checkout-modal">
            <div class="checkout-header">
                <h2>🎯 FINALIZAR COMPRA</h2>
                <button class="close-checkout" onclick="closeCheckoutModal()">&times;</button>
            </div>
            
            <div class="checkout-body">
                <div class="step-indicator">
                    <div class="step active" data-step="1">1. Email</div>
                    <div class="step" data-step="2">2. Pagamento</div>
                    <div class="step" data-step="3">3. Confirmação</div>
                </div>
                
                <div class="checkout-step" id="step-1">
                    <h3>Confirme seu e-mail para acesso</h3>
                    <p>Use o mesmo e-mail que você usará para acessar o curso:</p>
                    
                    <form id="email-form" class="email-form">
                        <div class="input-group">
                            <label for="purchase-email">Seu melhor e-mail:</label>
                            <input type="email" id="purchase-email" name="email" required 
                                   placeholder="seu@email.com">
                        </div>
                        
                        <div class="input-group">
                            <label for="confirm-email">Confirme seu e-mail:</label>
                            <input type="email" id="confirm-email" name="confirmEmail" required 
                                   placeholder="seu@email.com">
                        </div>
                        
                        <div class="terms-agreement">
                            <label class="checkbox-label">
                                <input type="checkbox" id="terms-agree" required>
                                <span class="checkmark"></span>
                                Concordo com os <a href="#" target="_blank">termos de uso</a> e 
                                <a href="#" target="_blank">política de privacidade</a>
                            </label>
                        </div>
                        
                        <button type="submit" class="continue-btn">
                            CONTINUAR PARA PAGAMENTO
                        </button>
                    </form>
                </div>
                
                <div class="checkout-step hidden" id="step-2">
                    <h3>Processando pagamento...</h3>
                    <div class="payment-info">
                        <p>✅ E-mail confirmado: <span id="confirmed-email"></span></p>
                        <p>💰 Valor: <strong>R$ 97,00</strong></p>
                        <p>🎯 Produto: <strong>Hiperfoco Absoluto</strong></p>
                    </div>
                    
                    <div id="mercado-pago-container">
                        <!-- MP button will be inserted here -->
                    </div>
                    
                    <div class="payment-security">
                        <p>🔒 Pagamento 100% seguro via Mercado Pago</p>
                        <p>✅ Acesso imediato após confirmação</p>
                    </div>
                </div>
                
                <div class="checkout-step hidden" id="step-3">
                    <div class="success-message">
                        <h3>🎉 Compra realizada com sucesso!</h3>
                        <p>Verificando pagamento...</p>
                        <div class="loading-spinner"></div>
                        <p class="next-steps">Em alguns segundos você será redirecionado para a área do aluno.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

/* ==========================================================================
   VALIDAÇÃO E PROCESSAMENTO
   ========================================================================== */

function setupEmailForm() {
    const emailForm = document.getElementById('email-form');
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailSubmit);
    }
    
    // Validação em tempo real
    const emailInput = document.getElementById('purchase-email');
    const confirmInput = document.getElementById('confirm-email');
    
    if (confirmInput) {
        confirmInput.addEventListener('blur', validateEmailMatch);
    }
}

function handleEmailSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('purchase-email').value;
    const confirmEmail = document.getElementById('confirm-email').value;
    const termsAgreed = document.getElementById('terms-agree').checked;
    
    // Validações
    if (!validateEmail(email)) {
        showError('Por favor, insira um e-mail válido.');
        return;
    }
    
    if (email !== confirmEmail) {
        showError('Os e-mails não coincidem.');
        return;
    }
    
    if (!termsAgreed) {
        showError('É necessário concordar com os termos.');
        return;
    }
    
    // Salvar dados e prosseguir
    CheckoutState.userEmail = email;
    saveCheckoutData();
    proceedToPayment();
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateEmailMatch() {
    const email = document.getElementById('purchase-email').value;
    const confirmEmail = document.getElementById('confirm-email').value;
    const confirmInput = document.getElementById('confirm-email');
    
    if (confirmEmail && email !== confirmEmail) {
        confirmInput.classList.add('error');
        showFieldError(confirmInput, 'E-mails não coincidem');
    } else {
        confirmInput.classList.remove('error');
        hideFieldError(confirmInput);
    }
}

/* ==========================================================================
   INTEGRAÇÃO MERCADO PAGO
   ========================================================================== */

function proceedToPayment() {
    console.log('💳 Iniciando pagamento...');
    
    // Ir para step 2
    showCheckoutStep(2);
    
    // Mostrar email confirmado
    document.getElementById('confirmed-email').textContent = CheckoutState.userEmail;
    
    // Inserir botão do Mercado Pago
    insertMercadoPagoButton();
}

function insertMercadoPagoButton() {
    const container = document.getElementById('mercado-pago-container');
    if (container) {
        container.innerHTML = `
            <div class="mp-button-wrapper">
                <script src="https://www.mercadopago.com.br/integrations/v1/web-payment-checkout.js"
                data-preference-id="${CheckoutConfig.mercadoPagoPreferenceId}" 
                data-source="button">
                </script>
            </div>
        `;
    }
    
    // Configurar callback do MP
    setupMercadoPagoCallbacks();
}

function setupMercadoPagoCallbacks() {
    // Interceptar o evento de pagamento
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'payment_result') {
            handlePaymentResult(event.data);
        }
    });
}

function handleMercadoPagoMessage(event) {
    console.log('📨 Mensagem do MP:', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'payment_result':
                handlePaymentResult(event.data);
                break;
            case 'payment_error':
                handlePaymentError(event.data);
                break;
        }
    }
}

function handlePaymentResult(data) {
    console.log('✅ Pagamento processado:', data);
    
    CheckoutState.paymentStatus = data.status;
    CheckoutState.purchaseData = {
        email: CheckoutState.userEmail,
        paymentId: data.payment_id,
        status: data.status,
        timestamp: new Date().toISOString()
    };
    
    // Salvar dados da compra
    savePurchaseData();
    
    if (data.status === 'approved') {
        showPaymentSuccess();
    } else {
        showPaymentPending();
    }
}

function handlePaymentError(data) {
    console.error('❌ Erro no pagamento:', data);
    showError('Erro no processamento do pagamento. Tente novamente.');
}

/* ==========================================================================
   CONFIRMAÇÃO E REDIRECIONAMENTO
   ========================================================================== */

function showPaymentSuccess() {
    showCheckoutStep(3);
    
    // Criar conta do usuário
    createUserAccount();
    
    // Redirecionar após 3 segundos
    setTimeout(() => {
        redirectToStudentArea();
    }, 3000);
}

function showPaymentPending() {
    showCheckoutStep(3);
    
    const successDiv = document.querySelector('.success-message');
    if (successDiv) {
        successDiv.innerHTML = `
            <h3>⏳ Pagamento em análise</h3>
            <p>Seu pagamento está sendo processado.</p>
            <p>Você receberá um e-mail com as instruções de acesso em breve.</p>
            <button onclick="closeCheckoutModal()" class="continue-btn">
                ENTENDIDO
            </button>
        `;
    }
}

function createUserAccount() {
    const userData = {
        email: CheckoutState.userEmail,
        accessCode: generateAccessCode(),
        purchaseDate: new Date().toISOString(),
        paymentData: CheckoutState.purchaseData,
        hasAccess: true
    };
    
    // Salvar dados do usuário
    localStorage.setItem('user_account', JSON.stringify(userData));
    localStorage.setItem('valid_emails', JSON.stringify([CheckoutState.userEmail]));
    
    console.log('👤 Conta criada para:', CheckoutState.userEmail);
}

function generateAccessCode() {
    return 'FOCO' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function redirectToStudentArea() {
    const url = `student-area.html?purchased=true&email=${encodeURIComponent(CheckoutState.userEmail)}`;
    window.location.href = url;
}

/* ==========================================================================
   INTERFACE E NAVEGAÇÃO
   ========================================================================== */

function showCheckoutStep(stepNumber) {
    // Esconder todos os steps
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.add('hidden');
    });
    
    // Mostrar step atual
    const currentStep = document.getElementById(`step-${stepNumber}`);
    if (currentStep) {
        currentStep.classList.remove('hidden');
    }
    
    // Atualizar indicador
    updateStepIndicator(stepNumber);
    
    // Setup específico do step
    if (stepNumber === 1) {
        setupEmailForm();
    }
}

function updateStepIndicator(activeStep) {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        
        if (index + 1 < activeStep) {
            step.classList.add('completed');
        } else if (index + 1 === activeStep) {
            step.classList.add('active');
        }
    });
}

function closeCheckoutModal() {
    const modal = document.querySelector('.checkout-modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
}

/* ==========================================================================
   GESTÃO DE DADOS
   ========================================================================== */

function saveCheckoutData() {
    const data = {
        email: CheckoutState.userEmail,
        step: CheckoutState.validationStep,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('checkout_data', JSON.stringify(data));
}

function savePurchaseData() {
    localStorage.setItem(CheckoutConfig.storageKey, JSON.stringify(CheckoutState.purchaseData));
    localStorage.setItem('pending_purchase', JSON.stringify(CheckoutState.purchaseData));
}

function checkPurchaseStatus() {
    const pendingPurchase = localStorage.getItem('pending_purchase');
    if (pendingPurchase) {
        const data = JSON.parse(pendingPurchase);
        console.log('📋 Compra pendente encontrada:', data);
    }
}

function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const paymentId = urlParams.get('payment_id');
    
    if (status && paymentId) {
        console.log('🔄 Retorno do MP detectado:', { status, paymentId });
        handlePaymentReturn(status, paymentId);
    }
}

function handlePaymentReturn(status, paymentId) {
    const pendingPurchase = localStorage.getItem('pending_purchase');
    if (pendingPurchase) {
        const data = JSON.parse(pendingPurchase);
        data.status = status;
        data.paymentId = paymentId;
        
        if (status === 'approved') {
            // Criar conta e redirecionar
            CheckoutState.userEmail = data.email;
            CheckoutState.purchaseData = data;
            createUserAccount();
            redirectToStudentArea();
        }
    }
}

/* ==========================================================================
   VALIDAÇÃO DE ACESSO
   ========================================================================== */

function validatePurchaseAccess(email) {
    const validEmails = localStorage.getItem('valid_emails');
    if (validEmails) {
        const emails = JSON.parse(validEmails);
        return emails.includes(email.toLowerCase());
    }
    return false;
}

function addValidEmail(email) {
    let validEmails = localStorage.getItem('valid_emails');
    validEmails = validEmails ? JSON.parse(validEmails) : [];
    
    if (!validEmails.includes(email.toLowerCase())) {
        validEmails.push(email.toLowerCase());
        localStorage.setItem('valid_emails', JSON.stringify(validEmails));
    }
}

/* ==========================================================================
   UTILITIES E HELPERS
   ========================================================================== */

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'checkout-error';
    errorDiv.textContent = message;
    
    const form = document.querySelector('.checkout-step:not(.hidden)');
    if (form) {
        // Remover erro anterior
        const existingError = form.querySelector('.checkout-error');
        if (existingError) {
            existingError.remove();
        }
        
        form.insertBefore(errorDiv, form.firstChild);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

function showFieldError(field, message) {
    let errorDiv = field.parentNode.querySelector('.field-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function hideFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.CheckoutFlow = {
        validateAccess: validatePurchaseAccess,
        addValidEmail: addValidEmail,
        closeModal: closeCheckoutModal
    };
}

console.log('💰 Sistema de Checkout carregado!');
console.log('🔗 Integração Mercado Pago ativa');
console.log('📧 Validação de email configurada');


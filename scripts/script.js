function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    const themeButton = document.querySelector('.theme-toggle');
    
    body.setAttribute('data-theme', newTheme);
    
    if (themeButton) {
        themeButton.setAttribute('aria-pressed', newTheme === 'dark');
        
        const themeIcon = themeButton.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'light' ? '🌓' : '🌙';
        }
    }
    
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = `Тема изменена на ${newTheme === 'light' ? 'светлую' : 'тёмную'}`;
    }
    
    try {
        localStorage.setItem('preferred-theme', newTheme);
    } catch (e) {
        console.log('LocalStorage не доступен');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        const savedTheme = localStorage.getItem('preferred-theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }
    } catch (e) {
        console.log('LocalStorage не доступен');
    }

    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const themeButton = document.querySelector('.theme-toggle');
    
    if (themeButton) {
        themeButton.setAttribute('aria-pressed', currentTheme === 'dark');
        
        const themeIcon = themeButton.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = currentTheme === 'light' ? '🌓' : '🌙';
        }
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                const modal = bootstrap.Modal.getInstance(openModal);
                if (modal) modal.hide();
            }
        }
        
        if (e.key === 'Enter' || e.key === ' ') {
            const focusedElement = document.activeElement;
            if (focusedElement.classList.contains('project-card') && 
                focusedElement.hasAttribute('data-bs-toggle')) {
                e.preventDefault();
                focusedElement.click();
            }
        }
    });

    const projectCards = document.querySelectorAll('.project-card[role="button"]');
    projectCards.forEach(card => {
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});

function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

function announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 3000);
    }
}

function enhanceFormAccessibility(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const fields = form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {

        field.addEventListener('blur', function() {
            if (!this.checkValidity()) {
                this.setAttribute('aria-invalid', 'true');
            } else {
                this.setAttribute('aria-invalid', 'false');
            }
        });
        
        field.addEventListener('input', function() {
            if (this.getAttribute('aria-invalid') === 'true' && this.checkValidity()) {
                this.setAttribute('aria-invalid', 'false');
            }
        });
    });
    
    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
        let hasErrors = false;
        
        fields.forEach(field => {
            if (!field.checkValidity()) {
                field.setAttribute('aria-invalid', 'true');
                hasErrors = true;
                
                if (!field.hasAttribute('aria-describedby')) {
                    const errorElement = field.nextElementSibling;
                    if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                        field.setAttribute('aria-describedby', errorElement.id);
                    }
                }
            }
        });
        
        if (hasErrors) {
            // Фокус на первое поле с ошибкой
            const firstInvalid = form.querySelector('[aria-invalid="true"]');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            
            announceToScreenReader('В форме есть ошибки. Пожалуйста, проверьте введенные данные.');
        }
    });
}

// Инициализация улучшенных форм при загрузке
document.addEventListener('DOMContentLoaded', function() {
    enhanceFormAccessibility('contactForm');
    enhanceFormAccessibility('entryForm');
});

// Утилиты для работы с ARIA
const A11yUtils = {
    // Показать элемент для скринридеров
    showToScreenReaders: function(element) {
        if (!element) return;
        
        const originalAttributes = {
            'aria-hidden': element.getAttribute('aria-hidden'),
            'inert': element.hasAttribute('inert')
        };
        
        element.removeAttribute('aria-hidden');
        element.removeAttribute('inert');
        
        return originalAttributes;
    },
    
    // Скрыть элемент от скринридеров
    hideFromScreenReaders: function(element) {
        if (!element) return;
        
        element.setAttribute('aria-hidden', 'true');
        element.setAttribute('inert', 'true');
    },
    
    // Восстановить оригинальные атрибуты
    restoreAttributes: function(element, originalAttributes) {
        if (!element || !originalAttributes) return;
        
        if (originalAttributes['aria-hidden'] !== null) {
            element.setAttribute('aria-hidden', originalAttributes['aria-hidden']);
        } else {
            element.removeAttribute('aria-hidden');
        }
        
        if (originalAttributes['inert']) {
            element.setAttribute('inert', 'true');
        } else {
            element.removeAttribute('inert');
        }
    }
};
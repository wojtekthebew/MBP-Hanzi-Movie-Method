// UI and display management
class UIManager {
    static showAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    static openTab(tabName, clickedButton) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.getElementById(tabName).classList.add('active');
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
        
        setTimeout(() => {
            const firstInput = document.querySelector(`#${tabName} input, #${tabName} select, #${tabName} textarea`);
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    static toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
    }

    static resetForm(formId, options = {}) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            const fileInput = form.querySelector('input[type="file"]');
            if (fileInput) fileInput.dataset.imageUrl = '';
            
            if (options.previewElementId) {
                document.getElementById(options.previewElementId).innerHTML = '';
            }
            
            if (options.titleElementId && options.defaultTitle) {
                document.getElementById(options.titleElementId).textContent = options.defaultTitle;
            }
            
            if (options.submitButtonId && options.defaultSubmitText) {
                document.getElementById(options.submitButtonId).textContent = options.defaultSubmitText;
            }
            
            if (options.cancelButtonId) {
                document.getElementById(options.cancelButtonId).style.display = 'none';
            }
        }
    }
}

export default UIManager;

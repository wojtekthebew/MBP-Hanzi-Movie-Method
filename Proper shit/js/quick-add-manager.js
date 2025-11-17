class QuickAddManager {
    constructor(app) {
        this.app = app;
        this.currentType = '';
    }

    open(type) {
        this.currentType = type;
        const modal = document.getElementById('quickAddModal');
        const title = document.getElementById('quickAddModalTitle');
        const formContent = document.getElementById('quickAddFormContent');
        
        title.textContent = `Quick Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        formContent.innerHTML = this.getFormHTML(type);
        
        modal.style.display = 'block';
        
        setTimeout(() => {
            const firstInput = formContent.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    close() {
        document.getElementById('quickAddModal').style.display = 'none';
        document.getElementById('quickAddForm').reset();
    }

    getFormHTML(type) {
        switch(type) {
            case 'actor':
                return `
                    <div class="form-group">
                        <label>Name:</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Pinyin Initial:</label>
                        <input type="text" name="pinyin">
                    </div>
                `;
            case 'set':
                return `
                    <div class="form-group">
                        <label>Name:</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Tone Sections (JSON):</label>
                        <textarea name="tones" rows="3" placeholder='{"1": "Area 1", "2": "Area 2"}'></textarea>
                    </div>
                `;
            case 'prop':
                return `
                    <div class="form-group">
                        <label>Name:</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Category:</label>
                        <select name="category">
                            <option value="general">General</option>
                            <option value="weapon">Weapon</option>
                            <option value="clothing">Clothing</option>
                            <option value="artifact">Artifact</option>
                            <option value="document">Document</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Components:</label>
                        <input type="text" name="components" placeholder="comma separated">
                    </div>
                `;
            default:
                return '';
        }
    }

    async save(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        try {
            switch(this.currentType) {
                case 'actor':
                    this.app.actorManager.validateAndCreate(
                        formData.get('name'),
                        formData.get('pinyin'),
                        ''
                    );
                    break;
                    
                case 'set':
                    let toneSections = {};
                    try {
                        const tonesInput = formData.get('tones').trim();
                        if (tonesInput) {
                            toneSections = JSON.parse(tonesInput);
                        }
                    } catch (e) {
                        throw new Error('Invalid JSON format for Tone Sections');
                    }
                    
                    this.app.setManager.validateAndCreate(
                        formData.get('name'),
                        toneSections,
                        ''
                    );
                    break;
                    
                case 'prop':
                    this.app.propManager.validateAndCreate(
                        formData.get('name'),
                        formData.get('category'),
                        formData.get('components'),
                        ''
                    );
                    break;
            }
            
            this.app.dataManager.saveState();
            this.app.refreshAll();
            this.close();
            
            // Auto-select newly added item
            const newId = this.app.dataManager.getNextId(
                this.app.dataManager.DATA[this.currentType.toUpperCase() + 'S']
            );
            const actualId = (parseInt(newId) - 1).toString();
            const selectId = `char${this.currentType.charAt(0).toUpperCase() + this.currentType.slice(1)}`;
            const selectEl = document.getElementById(selectId);
            if (selectEl) {
                selectEl.value = actualId;
                if (this.currentType === 'set') {
                    this.app.updateToneSections();
                }
            }
            
            this.app.uiManager.showAlert(
                `${this.currentType.charAt(0).toUpperCase() + this.currentType.slice(1)} added successfully`
            );
        } catch (error) {
            this.app.uiManager.showAlert(error.message, 'error');
        }
    }
}

export default QuickAddManager;

// Data Storage and State Management
class DataManager {
    constructor() {
        this.DATA = {
            ACTORS: [],
            SETS: [],
            PROPS: [],
            CHARACTERS: []
        };
        
        this.HISTORY = {
            past: [],
            present: JSON.parse(JSON.stringify(this.DATA)),
            future: [],
            maxSteps: 20
        };
        
        this.STORAGE_KEYS = {
            ACTORS: 'data/actors.json',
            SETS: 'data/sets.json',
            PROPS: 'data/props.json',
            CHARACTERS: 'data/characters.json'
        };
    }

    getNextId(items) {
        if (!items.length) return '1';
        const maxId = Math.max(...items.map(item => parseInt(item.id) || 0));
        return (maxId + 1).toString();
    }

    isDuplicateName(type, name, excludeId = null) {
        const dataArray = this.DATA[type];
        return dataArray.some(item => 
            item.name.toLowerCase() === name.toLowerCase() && item.id !== excludeId
        );
    }

    saveState() {
        this.HISTORY.past.push(JSON.parse(JSON.stringify(this.HISTORY.present)));
        this.HISTORY.present = JSON.parse(JSON.stringify(this.DATA));
        this.HISTORY.future = [];
        
        if (this.HISTORY.past.length > this.HISTORY.maxSteps) {
            this.HISTORY.past.shift();
        }
        
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.HISTORY.past.length === 0) return false;
        
        this.HISTORY.future.unshift(JSON.parse(JSON.stringify(this.HISTORY.present)));
        this.HISTORY.present = this.HISTORY.past.pop();
        Object.assign(this.DATA, this.HISTORY.present);
        
        return true;
    }

    redo() {
        if (this.HISTORY.future.length === 0) return false;
        
        this.HISTORY.past.push(JSON.parse(JSON.stringify(this.HISTORY.present)));
        this.HISTORY.present = this.HISTORY.future.shift();
        Object.assign(this.DATA, this.HISTORY.present);
        
        return true;
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn && redoBtn) {
            undoBtn.disabled = this.HISTORY.past.length === 0;
            redoBtn.disabled = this.HISTORY.future.length === 0;
        }
    }

    // Quick Add Modal integration
    openQuickAddModal(type) {
        const modal = document.getElementById('quickAddModal');
        const form = modal.querySelector('form');
        form.reset();
        form.dataset.type = type;
        
        const title = modal.querySelector('h2');
        title.textContent = `Quick Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        modal.style.display = 'block';
    }

    closeQuickAddModal() {
        const modal = document.getElementById('quickAddModal');
        modal.style.display = 'none';
    }

    submitQuickAddForm(event) {
        event.preventDefault();
        
        const form = event.target;
        const type = form.dataset.type;
        
        const newItem = {
            id: this.getNextId(this.DATA[type]),
            name: form.name.value,
            description: form.description.value,
            image: form.image.files[0] ? URL.createObjectURL(form.image.files[0]) : ''
        };
        
        this.DATA[type].push(newItem);
        this.saveState();
        
        this.closeQuickAddModal();
    }

    // Complete search function
    search(query) {
        query = query.toLowerCase();
        const results = {
            ACTORS: [],
            SETS: [],
            PROPS: [],
            CHARACTERS: []
        };
        
        for (const type in this.DATA) {
            results[type] = this.DATA[type].filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
        }
        
        return results;
    }

    // Image handling
    handleImageUpload(event, targetElementId) {
        const file = event.target.files[0];
        if (file) {
            const imgElement = document.getElementById(targetElementId);
            imgElement.src = URL.createObjectURL(file);
            imgElement.style.display = 'block';
        }
    }
}

export default DataManager;

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
}

export default DataManager;

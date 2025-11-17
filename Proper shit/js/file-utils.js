// File handling and image utilities
class FileUtils {
    static async getImageDataURL(fileInput) {
        return new Promise((resolve) => {
            const file = fileInput.files[0];
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }

    static previewImage(fileInput, previewElementId) {
        const file = fileInput.files[0];
        const previewEl = document.getElementById(previewElementId);
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewEl.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; border-radius: 4px;">`;
            };
            reader.readAsDataURL(file);
        } else {
            previewEl.innerHTML = '';
        }
    }

    static normalizeSeedData(key, arr) {
        if (!Array.isArray(arr)) return [];
        
        switch(key) {
            case 'Proper shit/data/props.json':
                return arr.map(p => this.normalizeProp(p));
            case 'Proper shit/data/sets.json':
                return arr.map(s => this.normalizeSet(s));
            case 'Proper shit/data/characters.json':
                return arr.map(c => this.normalizeCharacter(c));
            case 'Proper shit/data/actors.json':
                return arr.map(a => this.normalizeActor(a));
            default:
                return arr;
        }
    }

    static normalizeProp(prop) {
        if (typeof prop.components === 'string') {
            const comps = prop.components.split(',').map(s => s.trim()).filter(Boolean);
            prop.components = comps.length ? comps : [prop.components.trim() || ''];
        } else if (!Array.isArray(prop.components)) {
            prop.components = [];
        }
        if (!Array.isArray(prop.used_by)) prop.used_by = [];
        return prop;
    }

    static normalizeSet(set) {
        if (typeof set.tone_sections !== 'object' || set.tone_sections === null) set.tone_sections = {};
        if (!Array.isArray(set.characters)) set.characters = [];
        return set;
    }

    static normalizeCharacter(character) {
        if (!Array.isArray(character.props)) {
            character.props = Array.isArray(character.props) ? character.props : (character.props ? [character.props] : []);
        }
        return character;
    }

    static normalizeActor(actor) {
        if (!Array.isArray(actor.characters)) actor.characters = [];
        return actor;
    }
}

export default FileUtils;

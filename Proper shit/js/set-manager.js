import BaseEntity from './base-entity.js';

class SetManager extends BaseEntity {
    constructor(dataManager) {
        super(dataManager, 'SETS');
    }

    getCharacterCount(setId) {
        return this.dataManager.DATA.CHARACTERS.filter(char => char.set_location === setId).length;
    }

    search(searchTerm) {
        return this.getAll().filter(set => 
            set.name.toLowerCase().includes(searchTerm)
        );
    }

    validateAndCreate(name, toneSections, image = '') {
        if (this.isDuplicateName(name)) {
            throw new Error('A set with this name already exists!');
        }
        return this.create({
            name,
            tone_sections: toneSections,
            image,
            characters: []
        });
    }

    validateAndUpdate(id, name, toneSections, image = '') {
        if (this.isDuplicateName(name, id)) {
            throw new Error('A set with this name already exists!');
        }
        const existing = this.getById(id);
        return this.update(id, {
            name,
            tone_sections: toneSections,
            image,
            characters: existing.characters
        });
    }
}

export default SetManager;

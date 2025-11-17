import BaseEntity from './base-entity.js';

class PropManager extends BaseEntity {
    constructor(dataManager) {
        super(dataManager, 'PROPS');
    }

    getCharacterCount(propId) {
        return this.dataManager.DATA.CHARACTERS.filter(char => char.props.includes(propId)).length;
    }

    search(searchTerm) {
        return this.getAll().filter(prop => 
            prop.name.toLowerCase().includes(searchTerm) || 
            prop.category.toLowerCase().includes(searchTerm)
        );
    }

    validateAndCreate(name, category, components, image = '') {
        if (this.isDuplicateName(name)) {
            throw new Error('A prop with this name already exists!');
        }
        return this.create({
            name,
            category,
            components: Array.isArray(components) ? components : components.split(',').map(c => c.trim()).filter(c => c),
            image,
            used_by: []
        });
    }

    validateAndUpdate(id, name, category, components, image = '') {
        if (this.isDuplicateName(name, id)) {
            throw new Error('A prop with this name already exists!');
        }
        const existing = this.getById(id);
        return this.update(id, {
            name,
            category,
            components: Array.isArray(components) ? components : components.split(',').map(c => c.trim()).filter(c => c),
            image,
            used_by: existing.used_by
        });
    }
}

export default PropManager;

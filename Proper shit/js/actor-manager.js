import BaseEntity from './base-entity.js';

class ActorManager extends BaseEntity {
    constructor(dataManager) {
        super(dataManager, 'ACTORS');
    }

    getCharacterCount(actorId) {
        return this.dataManager.DATA.CHARACTERS.filter(char => char.actor === actorId).length;
    }

    search(searchTerm) {
        return this.getAll().filter(actor => 
            actor.name.toLowerCase().includes(searchTerm) || 
            (actor.PinyinInitial && actor.PinyinInitial.toLowerCase().includes(searchTerm))
        );
    }

    validateAndCreate(name, pinyinInitial, image = '') {
        if (this.isDuplicateName(name)) {
            throw new Error('An actor with this name already exists!');
        }
        return this.create({
            name,
            PinyinInitial: pinyinInitial,
            image,
            characters: []
        });
    }

    validateAndUpdate(id, name, pinyinInitial, image = '') {
        if (this.isDuplicateName(name, id)) {
            throw new Error('An actor with this name already exists!');
        }
        const existing = this.getById(id);
        return this.update(id, {
            name,
            PinyinInitial: pinyinInitial,
            image,
            characters: existing.characters
        });
    }
}

export default ActorManager;

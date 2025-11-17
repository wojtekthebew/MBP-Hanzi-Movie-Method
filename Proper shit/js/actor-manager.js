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
}

export default ActorManager;

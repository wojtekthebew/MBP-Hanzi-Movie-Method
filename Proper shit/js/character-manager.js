import BaseEntity from './base-entity.js';

class CharacterManager extends BaseEntity {
    constructor(dataManager) {
        super(dataManager, 'CHARACTERS');
    }

    search(searchTerm) {
        return this.getAll().filter(character => {
            const actor = this.dataManager.DATA.ACTORS.find(a => a.id === character.actor);
            const set = this.dataManager.DATA.SETS.find(s => s.id === character.set_location);
            
            return character.hanzi.toLowerCase().includes(searchTerm) ||
                   character.pinyin.toLowerCase().includes(searchTerm) ||
                   character.meaning.toLowerCase().includes(searchTerm) ||
                   (actor && actor.name.toLowerCase().includes(searchTerm)) ||
                   (set && set.name.toLowerCase().includes(searchTerm));
        });
    }

    validateAndCreate(data) {
        return this.create({
            hanzi: data.hanzi,
            pinyin: data.pinyin,
            meaning: data.meaning,
            actor: data.actor,
            set_location: data.set_location,
            tone_section: data.tone_section,
            props: data.props || [],
            plot: data.plot || '',
            image: data.image || '',
            memory_scene: '',
            audio_file: ''
        });
    }

    validateAndUpdate(id, data) {
        return this.update(id, {
            hanzi: data.hanzi,
            pinyin: data.pinyin,
            meaning: data.meaning,
            actor: data.actor,
            set_location: data.set_location,
            tone_section: data.tone_section,
            props: data.props || [],
            plot: data.plot || '',
            image: data.image || '',
            memory_scene: '',
            audio_file: ''
        });
    }
}

export default CharacterManager;

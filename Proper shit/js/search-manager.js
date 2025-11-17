// Advanced search functionality
class SearchManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    performAdvancedSearch(filters) {
        const { hanzi, pinyin, meaning, actor, set, prop } = filters;
        
        return this.dataManager.DATA.CHARACTERS.filter(character => {
            if (hanzi && !character.hanzi.toLowerCase().includes(hanzi)) return false;
            if (pinyin && !character.pinyin.toLowerCase().includes(pinyin)) return false;
            if (meaning && !character.meaning.toLowerCase().includes(meaning)) return false;
            if (actor && character.actor !== actor) return false;
            if (set && character.set_location !== set) return false;
            if (prop && !character.props.includes(prop)) return false;
            return true;
        });
    }

    refreshAdvancedSearchOptions() {
        this.refreshSelect('searchActor', this.dataManager.DATA.ACTORS, 'Any Actor');
        this.refreshSelect('searchSet', this.dataManager.DATA.SETS, 'Any Set');
        this.refreshSelect('searchProp', this.dataManager.DATA.PROPS, 'Any Prop');
    }

    refreshSelect(selectId, items, defaultText) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = `<option value="">${defaultText}</option>`;
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            select.appendChild(option);
        });
    }
}

export default SearchManager;

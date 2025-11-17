function convertPinyinWithTones(input) {
    const toneMap = {
        a: ["ā", "á", "ǎ", "à"],
        e: ["ē", "é", "ě", "è"],
        i: ["ī", "í", "ǐ", "ì"],
        o: ["ō", "ó", "ǒ", "ò"],
        u: ["ū", "ú", "ǔ", "ù"],
        ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
    };
    input = input.replace(/v/g, "ü");
    const compoundVowels = [
        'ao', 'ai', 'ei', 'ou',
        'ia', 'iao', 'ie', 'iu', 'iou',
        'ua', 'uo', 'uai', 'uei', 'ui',
        'üe'
    ];
    let toneNumber = input.match(/[1-4]/)?.[0];
    if (!toneNumber) return input.replace(/[1-5]/g, "");
    let withoutTone = input.replace(/[1-5]/g, "");
    for (let compound of compoundVowels) {
        if (withoutTone.includes(compound)) {
            if (compound === 'iu' || compound === 'ui' || compound === 'iou') {
                const lastVowel = compound[compound.length - 1];
                const replacement = toneMap[lastVowel][toneNumber - 1];
                return withoutTone.replace(compound, compound.slice(0, -1) + replacement);
            } else if (compound.includes('a')) {
                const replacement = toneMap['a'][toneNumber - 1];
                return withoutTone.replace('a', replacement);
            } else if (compound.includes('e')) {
                const replacement = toneMap['e'][toneNumber - 1];
                return withoutTone.replace('e', replacement);
            } else if (compound.includes('o')) {
                const replacement = toneMap['o'][toneNumber - 1];
                return withoutTone.replace('o', replacement);
            }
        }
    }
    for (let vowel of ['a', 'e', 'o', 'i', 'u', 'ü']) {
        if (withoutTone.includes(vowel)) {
            const replacement = toneMap[vowel][toneNumber - 1];
            return withoutTone.replace(vowel, replacement);
        }
    }
    return withoutTone;
}

// Advanced search functionality
class SearchManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    performAdvancedSearch(filters = {}) {
        const characters = this.dataManager.DATA.CHARACTERS;
        let results = characters.filter(character => 
            Object.entries(filters).every(([key, value]) => {
                if (!value) return true;

                switch (key) {
                    case "hanzi":
                        return character.hanzi?.includes(value);

                    case "pinyin":
                        // Accept "shi2" or "shi" or "shí"
                        let searchPinyin = value;
                        let searchTone = value.match(/[1-4]/)?.[0];
                        let searchWithTone = searchTone ? convertPinyinWithTones(value) : value;
                        let charPinyin = character.pinyin?.toLowerCase();
                        return charPinyin === searchWithTone.toLowerCase() ||
                            charPinyin === value.toLowerCase() ||
                            charPinyin?.includes(searchWithTone.toLowerCase());

                    case "meaning":
                        return character.meaning?.toLowerCase().includes(value.toLowerCase());

                    case "actor":
                        return character.actor === value;

                    case "set":
                        return character.set_location === value;

                    case "prop":
                        return character.props?.includes(value);

                    case "props_any":
                        return Array.isArray(value) && value.some(v => character.props?.includes(v));

                    case "props_all":
                        return Array.isArray(value) && value.every(v => character.props?.includes(v));

                    default:
                        return true;
                }
            })
        );

        // Sort: first by pinyin final match, then by actor name
        if (filters.pinyin) {
            let searchFinal = filters.pinyin.replace(/[1-5]/g, '').toLowerCase();
            results = results.sort((a, b) => {
                // pinyin final match
                let aFinal = a.pinyin?.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, '').toLowerCase();
                let bFinal = b.pinyin?.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, '').toLowerCase();
                let aMatch = aFinal === searchFinal ? 0 : 1;
                let bMatch = bFinal === searchFinal ? 0 : 1;
                if (aMatch !== bMatch) return aMatch - bMatch;
                // actor name
                const actorA = this.dataManager.DATA.ACTORS.find(act => act.id === a.actor)?.name || '';
                const actorB = this.dataManager.DATA.ACTORS.find(act => act.id === b.actor)?.name || '';
                return actorA.localeCompare(actorB);
            });
        }

        return results;
    }

    refreshAdvancedSearchOptions() {
        this.refreshSelect('searchActor', this.dataManager.DATA.ACTORS, 'Any Actor');
        this.refreshSelect('searchSet', this.dataManager.DATA.SETS, 'Any Set');
        this.refreshSelect('searchProp', this.dataManager.DATA.PROPS, 'Any Prop');
    }

    refreshSelect(id, items, placeholder) {
        const el = document.getElementById(id);
        if (!el) return;

        el.innerHTML = `<option value="">${placeholder}</option>`;
        for (const item of items) {
            el.insertAdjacentHTML(
                "beforeend",
                `<option value="${item.id}">${item.name}</option>`
            );
        }
    }
}

export default SearchManager;

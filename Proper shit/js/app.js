import DataManager from './data-manager.js';
import FileUtils from './file-utils.js';
import UIManager from './ui-manager.js';
import ActorManager from './actor-manager.js';
import SetManager from './set-manager.js';
import PropManager from './prop-manager.js';
import CharacterManager from './character-manager.js';
import SearchManager from './search-manager.js';
import QuickAddManager from './quick-add-manager.js';

class App {
    constructor() {
        this.dataManager = new DataManager();
        this.uiManager = UIManager;
        this.actorManager = new ActorManager(this.dataManager);
        this.setManager = new SetManager(this.dataManager);
        this.propManager = new PropManager(this.dataManager);
        this.characterManager = new CharacterManager(this.dataManager);
        this.searchManager = new SearchManager(this.dataManager);
        this.quickAddManager = new QuickAddManager(this);
        
        this.init();
    }

    async init() {
        await this.loadDataFromFiles();
        this.dataManager.saveState();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.refreshAll();
    }

    async loadDataFromFiles() {
        const files = [
            { file: 'data/actors.json', key: 'ACTORS' },
            { file: 'data/sets.json', key: 'SETS' },
            { file: 'data/props.json', key: 'PROPS' },
            { file: 'data/characters.json', key: 'CHARACTERS' }
        ];

        await Promise.all(files.map(async ({ file, key }) => {
            try {
                const res = await fetch(file);
                if (res.ok) {
                    let data = await res.json();
                    data = FileUtils.normalizeSeedData(file, data);
                    this.dataManager.DATA[key] = data;
                    console.log(`Loaded ${key} from ${file}`);
                } else {
                    this.dataManager.DATA[key] = [];
                }
            } catch (e) {
                console.warn(`Error loading ${file}:`, e);
                this.dataManager.DATA[key] = [];
            }
        }));
    }

    setupEventListeners() {
        document.getElementById('undoBtn')?.addEventListener('click', () => this.undo());
        document.getElementById('redoBtn')?.addEventListener('click', () => this.redo());
        
        ['actorImage', 'setImage', 'propImage', 'charImage'].forEach((id, idx) => {
            const previewIds = ['actorImagePreview', 'setImagePreview', 'propImagePreview', 'charImagePreview'];
            document.getElementById(id)?.addEventListener('change', (e) => 
                FileUtils.previewImage(e.target, previewIds[idx])
            );
        });
        
        document.getElementById('quickAddForm')?.addEventListener('submit', (e) => 
            this.quickAddManager.save(e)
        );
    }

    undo() {
        if (this.dataManager.undo()) {
            this.refreshAll();
            this.uiManager.showAlert('Undo completed');
        }
    }

    redo() {
        if (this.dataManager.redo()) {
            this.refreshAll();
            this.uiManager.showAlert('Redo completed');
        }
    }

    refreshAll() {
        this.refreshLists();
        this.refreshCharacterForm();
        this.searchManager.refreshAdvancedSearchOptions();
    }

    refreshLists() {
        this.displayActors();
        this.displaySets();
        this.displayProps();
        this.displayCharacters();
    }

    displayActors(actorsToDisplay = null) {
        const actors = actorsToDisplay || this.dataManager.DATA.ACTORS;
        const targetContainer = document.getElementById('actorsList');
        
        if (!targetContainer) return;
        
        if (actors.length === 0) {
            targetContainer.innerHTML = '<div class="empty-state">No actors found. Add your first actor above.</div>';
            return;
        }
        
        targetContainer.innerHTML = actors.map(actor => {
            const charCount = this.actorManager.getCharacterCount(actor.id);
            return `
                <div class="item-card">
                    ${actor.image ? `<img src="${actor.image}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">` : ''}
                    <h4>${actor.name} <span class="character-count">${charCount}</span></h4>
                    <p>Pinyin: ${actor.PinyinInitial || 'N/A'}</p>
                    <p>Characters: ${charCount}</p>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="app.editActor('${actor.id}')">Edit</button>
                        <button class="delete-btn" onclick="app.deleteActor('${actor.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    displaySets(setsToDisplay = null) {
        const sets = setsToDisplay || this.dataManager.DATA.SETS;
        const targetContainer = document.getElementById('setsList');
        
        if (!targetContainer) return;
        
        if (sets.length === 0) {
            targetContainer.innerHTML = '<div class="empty-state">No sets found. Add your first set above.</div>';
            return;
        }
        
        targetContainer.innerHTML = sets.map(set => {
            const charCount = this.setManager.getCharacterCount(set.id);
            const toneSections = set.tone_sections || {};
            return `
                <div class="item-card">
                    ${set.image ? `<img src="${set.image}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">` : ''}
                    <h4>${set.name} <span class="character-count">${charCount}</span></h4>
                    <p>Tone Sections: ${Object.keys(toneSections).length}</p>
                    <p>Characters: ${charCount}</p>
                    <div class="tone-sections">
                        ${Object.entries(toneSections).map(([key, value]) => 
                            `<span class="tone-section-item">${key}: ${value}</span>`
                        ).join('')}
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="app.editSet('${set.id}')">Edit</button>
                        <button class="delete-btn" onclick="app.deleteSet('${set.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    displayProps(propsToDisplay = null) {
        const props = propsToDisplay || this.dataManager.DATA.PROPS;
        const targetContainer = document.getElementById('propsList');
        
        if (!targetContainer) return;
        
        if (props.length === 0) {
            targetContainer.innerHTML = '<div class="empty-state">No props found. Add your first prop above.</div>';
            return;
        }
        
        targetContainer.innerHTML = props.map(prop => {
            const charCount = this.propManager.getCharacterCount(prop.id);
            return `
                <div class="item-card">
                    ${prop.image ? `<img src="${prop.image}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">` : ''}
                    <h4>${prop.name} <span class="character-count">${charCount}</span></h4>
                    <p>Category: ${prop.category}</p>
                    <p>Components: ${prop.components ? prop.components.join(', ') : 'None'}</p>
                    <p>Used by: ${charCount} characters</p>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="app.editProp('${prop.id}')">Edit</button>
                        <button class="delete-btn" onclick="app.deleteProp('${prop.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    displayCharacters(charactersToDisplay = null) {
        const characters = charactersToDisplay || this.dataManager.DATA.CHARACTERS;
        const targetContainer = document.getElementById('charactersList');
        
        if (!targetContainer) return;
        
        if (characters.length === 0) {
            targetContainer.innerHTML = '<div class="empty-state">No characters found. Add your first character above.</div>';
            return;
        }
        
        targetContainer.innerHTML = characters.map(character => {
            const actor = this.dataManager.DATA.ACTORS.find(a => a.id === character.actor);
            const set = this.dataManager.DATA.SETS.find(s => s.id === character.set_location);
            const characterProps = this.dataManager.DATA.PROPS.filter(p => character.props.includes(p.id));
            
            let toneSectionDisplay = character.tone_section;
            if (set && set.tone_sections && set.tone_sections[character.tone_section]) {
                toneSectionDisplay = `${character.tone_section}: ${set.tone_sections[character.tone_section]}`;
            }
            
            return `
                <div class="item-card">
                    ${character.image ? `<img src="${character.image}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">` : ''}
                    <h4>${character.hanzi}</h4>
                    <p>Pinyin: ${character.pinyin}</p>
                    <p>Meaning: ${character.meaning}</p>
                    <p>Actor: ${actor ? actor.name : 'N/A'}</p>
                    <p>Set: ${set ? set.name : 'N/A'}</p>
                    <p>Tone Section: ${toneSectionDisplay}</p>
                    <p>Props: ${characterProps.map(p => p.name).join(', ') || 'None'}</p>
                    ${character.plot ? `<p><strong>Plot:</strong> ${character.plot}</p>` : ''}
                    <div class="item-actions">
                        <button class="edit-btn" onclick="app.editCharacter('${character.id}')">Edit</button>
                        <button class="delete-btn" onclick="app.deleteCharacter('${character.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async saveActor(event) {
        event.preventDefault();
        try {
            const actorId = document.getElementById('actorId').value;
            const actorName = document.getElementById('actorName').value;
            const img = await FileUtils.getImageDataURL(document.getElementById('actorImage'));
            
            if (actorId) {
                this.actorManager.validateAndUpdate(
                    actorId,
                    actorName,
                    document.getElementById('actorPinyin').value,
                    img || document.getElementById('actorImage').dataset.imageUrl || ''
                );
                this.uiManager.showAlert('Actor updated successfully');
            } else {
                this.actorManager.validateAndCreate(
                    actorName,
                    document.getElementById('actorPinyin').value,
                    img || ''
                );
                this.uiManager.showAlert('Actor added successfully');
            }
            
            this.resetActorForm();
            this.refreshLists();
        } catch (error) {
            this.uiManager.showAlert(error.message, 'error');
        }
    }

    editActor(id) {
        const actor = this.actorManager.getById(id);
        if (actor) {
            document.getElementById('actorId').value = actor.id;
            document.getElementById('actorName').value = actor.name;
            document.getElementById('actorPinyin').value = actor.PinyinInitial || '';
            if (actor.image) {
                document.getElementById('actorImagePreview').innerHTML = `<img src="${actor.image}" style="max-width: 100%; border-radius: 4px;">`;
                document.getElementById('actorImage').dataset.imageUrl = actor.image;
            }
            document.getElementById('actorFormTitle').textContent = 'Edit Actor';
            document.getElementById('actorSubmitBtn').textContent = 'Update Actor';
            document.getElementById('actorCancelBtn').style.display = 'inline-block';
            document.getElementById('actorName').focus();
        }
    }

    deleteActor(id) {
        if (confirm('Are you sure you want to delete this actor?')) {
            if (this.actorManager.delete(id)) {
                this.uiManager.showAlert('Actor deleted successfully');
                this.refreshLists();
            }
        }
    }

    resetActorForm() {
        this.uiManager.resetForm('actorForm', {
            previewElementId: 'actorImagePreview',
            titleElementId: 'actorFormTitle',
            defaultTitle: 'Add New Actor',
            submitButtonId: 'actorSubmitBtn',
            defaultSubmitText: 'Add Actor',
            cancelButtonId: 'actorCancelBtn'
        });
        document.getElementById('actorName').focus();
    }

    searchActors() {
        const searchTerm = document.getElementById('actorSearch').value.toLowerCase();
        const filteredActors = this.actorManager.search(searchTerm);
        this.displayActors(filteredActors);
    }

    async saveSet(event) {
        event.preventDefault();
        try {
            const setId = document.getElementById('setId').value;
            const setName = document.getElementById('setName').value;
            let toneSections = {};
            try {
                const input = document.getElementById('setTones').value.trim();
                if (input) {
                    toneSections = JSON.parse(input);
                }
            } catch (e) {
                throw new Error('Invalid JSON format for Tone Sections');
            }
            const img = await FileUtils.getImageDataURL(document.getElementById('setImage'));
            
            if (setId) {
                this.setManager.validateAndUpdate(
                    setId,
                    setName,
                    toneSections,
                    img || document.getElementById('setImage').dataset.imageUrl || ''
                );
                this.uiManager.showAlert('Set updated successfully');
            } else {
                this.setManager.validateAndCreate(
                    setName,
                    toneSections,
                    img || ''
                );
                this.uiManager.showAlert('Set added successfully');
            }
            
            this.resetSetForm();
            this.refreshLists();
        } catch (error) {
            this.uiManager.showAlert(error.message, 'error');
        }
    }

    editSet(id) {
        const set = this.setManager.getById(id);
        if (set) {
            document.getElementById('setId').value = set.id;
            document.getElementById('setName').value = set.name;
            document.getElementById('setTones').value = JSON.stringify(set.tone_sections || {}, null, 2);
            if (set.image) {
                document.getElementById('setImagePreview').innerHTML = `<img src="${set.image}" style="max-width: 100%; border-radius: 4px;">`;
                document.getElementById('setImage').dataset.imageUrl = set.image;
            }
            document.getElementById('setFormTitle').textContent = 'Edit Set';
            document.getElementById('setSubmitBtn').textContent = 'Update Set';
            document.getElementById('setCancelBtn').style.display = 'inline-block';
            document.getElementById('setName').focus();
        }
    }

    deleteSet(id) {
        if (confirm('Are you sure you want to delete this set?')) {
            if (this.setManager.delete(id)) {
                this.uiManager.showAlert('Set deleted successfully');
                this.refreshLists();
            }
        }
    }

    resetSetForm() {
        this.uiManager.resetForm('setForm', {
            previewElementId: 'setImagePreview',
            titleElementId: 'setFormTitle',
            defaultTitle: 'Add New Set',
            submitButtonId: 'setSubmitBtn',
            defaultSubmitText: 'Add Set',
            cancelButtonId: 'setCancelBtn'
        });
        document.getElementById('setName').focus();
    }

    searchSets() {
        const searchTerm = document.getElementById('setSearch').value.toLowerCase();
        const filteredSets = this.setManager.search(searchTerm);
        this.displaySets(filteredSets);
    }

    async saveProp(event) {
        event.preventDefault();
        try {
            const propId = document.getElementById('propId').value;
            const propName = document.getElementById('propName').value;
            const img = await FileUtils.getImageDataURL(document.getElementById('propImage'));
            
            if (propId) {
                this.propManager.validateAndUpdate(
                    propId,
                    propName,
                    document.getElementById('propCategory').value,
                    document.getElementById('propComponents').value,
                    img || document.getElementById('propImage').dataset.imageUrl || ''
                );
                this.uiManager.showAlert('Prop updated successfully');
            } else {
                this.propManager.validateAndCreate(
                    propName,
                    document.getElementById('propCategory').value,
                    document.getElementById('propComponents').value,
                    img || ''
                );
                this.uiManager.showAlert('Prop added successfully');
            }
            
            this.resetPropForm();
            this.refreshLists();
        } catch (error) {
            this.uiManager.showAlert(error.message, 'error');
        }
    }

    editProp(id) {
        const prop = this.propManager.getById(id);
        if (prop) {
            document.getElementById('propId').value = prop.id;
            document.getElementById('propName').value = prop.name;
            document.getElementById('propCategory').value = prop.category;
            document.getElementById('propComponents').value = prop.components ? prop.components.join(', ') : '';
            if (prop.image) {
                document.getElementById('propImagePreview').innerHTML = `<img src="${prop.image}" style="max-width: 100%; border-radius: 4px;">`;
                document.getElementById('propImage').dataset.imageUrl = prop.image;
            }
            document.getElementById('propFormTitle').textContent = 'Edit Prop';
            document.getElementById('propSubmitBtn').textContent = 'Update Prop';
            document.getElementById('propCancelBtn').style.display = 'inline-block';
            document.getElementById('propName').focus();
        }
    }

    deleteProp(id) {
        if (confirm('Are you sure you want to delete this prop?')) {
            if (this.propManager.delete(id)) {
                this.uiManager.showAlert('Prop deleted successfully');
                this.refreshLists();
            }
        }
    }

    resetPropForm() {
        this.uiManager.resetForm('propForm', {
            previewElementId: 'propImagePreview',
            titleElementId: 'propFormTitle',
            defaultTitle: 'Add New Prop',
            submitButtonId: 'propSubmitBtn',
            defaultSubmitText: 'Add Prop',
            cancelButtonId: 'propCancelBtn'
        });
        document.getElementById('propName').focus();
    }

    searchProps() {
        const searchTerm = document.getElementById('propSearch').value.toLowerCase();
        const filteredProps = this.propManager.search(searchTerm);
        this.displayProps(filteredProps);
    }

    async saveCharacter(event) {
        event.preventDefault();
        try {
            const characterId = document.getElementById('characterId').value;
            const selectedProps = Array.from(document.getElementById('charProps').selectedOptions).map(opt => opt.value);
            const img = await FileUtils.getImageDataURL(document.getElementById('charImage'));
            
            const characterData = {
                hanzi: document.getElementById('charHanzi').value,
                pinyin: document.getElementById('charPinyin').value,
                meaning: document.getElementById('charMeaning').value,
                actor: document.getElementById('charActor').value,
                set_location: document.getElementById('charSet').value,
                tone_section: document.getElementById('charToneSection').value,
                props: selectedProps,
                plot: document.getElementById('charPlot').value,
                image: img || document.getElementById('charImage').dataset.imageUrl || ''
            };
            
            if (characterId) {
                this.characterManager.validateAndUpdate(characterId, characterData);
                this.uiManager.showAlert('Character updated successfully');
            } else {
                this.characterManager.validateAndCreate(characterData);
                this.uiManager.showAlert('Character added successfully');
            }
            
            this.resetCharacterForm();
            this.refreshLists();
        } catch (error) {
            this.uiManager.showAlert(error.message, 'error');
        }
    }

    editCharacter(id) {
        const character = this.characterManager.getById(id);
        if (character) {
            document.getElementById('characterId').value = character.id;
            document.getElementById('charHanzi').value = character.hanzi;
            document.getElementById('charPinyin').value = character.pinyin;
            document.getElementById('charMeaning').value = character.meaning;
            document.getElementById('charActor').value = character.actor;
            document.getElementById('charSet').value = character.set_location;
            document.getElementById('charPlot').value = character.plot || '';
            if (character.image) {
                document.getElementById('charImagePreview').innerHTML = `<img src="${character.image}" style="max-width: 100%; border-radius: 4px;">`;
                document.getElementById('charImage').dataset.imageUrl = character.image;
            }
            
            this.updateToneSections();
            
            setTimeout(() => {
                document.getElementById('charToneSection').value = character.tone_section || '';
            }, 100);
            
            const propsSelect = document.getElementById('charProps');
            Array.from(propsSelect.options).forEach(option => {
                option.selected = character.props.includes(option.value);
            });
            
            document.getElementById('characterFormTitle').textContent = 'Edit Character';
            document.getElementById('characterSubmitBtn').textContent = 'Update Character';
            document.getElementById('characterCancelBtn').style.display = 'inline-block';
            document.getElementById('charHanzi').focus();
        }
    }

    deleteCharacter(id) {
        if (confirm('Are you sure you want to delete this character?')) {
            if (this.characterManager.delete(id)) {
                this.uiManager.showAlert('Character deleted successfully');
                this.refreshLists();
            }
        }
    }

    resetCharacterForm() {
        this.uiManager.resetForm('characterForm', {
            previewElementId: 'charImagePreview',
            titleElementId: 'characterFormTitle',
            defaultTitle: 'Add New Character',
            submitButtonId: 'characterSubmitBtn',
            defaultSubmitText: 'Add Character',
            cancelButtonId: 'characterCancelBtn'
        });
        this.refreshCharacterForm();
        document.getElementById('charHanzi').focus();
    }

    searchCharacters() {
        const searchTerm = document.getElementById('characterSearch').value.toLowerCase();
        const filteredCharacters = this.characterManager.search(searchTerm);
        this.displayCharacters(filteredCharacters);
    }

    refreshCharacterForm() {
        const actorSelect = document.getElementById('charActor');
        const setSelect = document.getElementById('charSet');
        const propsSelect = document.getElementById('charProps');
        
        if (!actorSelect || !setSelect || !propsSelect) return;
        
        actorSelect.innerHTML = '<option value="">Select Actor</option>';
        setSelect.innerHTML = '<option value="">Select Set</option>';
        propsSelect.innerHTML = '';
        
        this.dataManager.DATA.ACTORS.forEach(actor => {
            const option = document.createElement('option');
            option.value = actor.id;
            option.textContent = actor.name;
            actorSelect.appendChild(option);
        });
        
        this.dataManager.DATA.SETS.forEach(set => {
            const option = document.createElement('option');
            option.value = set.id;
            option.textContent = set.name;
            setSelect.appendChild(option);
        });
        
        this.dataManager.DATA.PROPS.forEach(prop => {
            const option = document.createElement('option');
            option.value = prop.id;
            option.textContent = prop.name;
            propsSelect.appendChild(option);
        });
    }

    updateToneSections() {
        const setSelect = document.getElementById('charSet');
        const toneSectionSelect = document.getElementById('charToneSection');
        const selectedSetId = setSelect.value;
        
        toneSectionSelect.innerHTML = '';
        
        if (!selectedSetId) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Select a set location first';
            toneSectionSelect.appendChild(option);
            return;
        }
        
        const selectedSet = this.setManager.getById(selectedSetId);
        
        if (!selectedSet || !selectedSet.tone_sections || Object.keys(selectedSet.tone_sections).length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No tone sections defined for this set';
            toneSectionSelect.appendChild(option);
            return;
        }
        
        Object.entries(selectedSet.tone_sections).forEach(([sectionNumber, sectionName]) => {
            const option = document.createElement('option');
            option.value = sectionNumber;
            option.textContent = `${sectionNumber}: ${sectionName}`;
            toneSectionSelect.appendChild(option);
        });
    }

    setupKeyboardNavigation() {
        const searchBoxes = ['actorSearch', 'setSearch', 'propSearch', 'characterSearch'];
        searchBoxes.forEach(id => {
            const searchBox = document.getElementById(id);
            if (searchBox) {
                searchBox.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        searchBox.value = '';
                        if (id === 'actorSearch') this.searchActors();
                        else if (id === 'setSearch') this.searchSets();
                        else if (id === 'propSearch') this.searchProps();
                        else if (id === 'characterSearch') this.searchCharacters();
                    }
                });
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.quickAddManager.close();
            }
        });
    }
}

// Initialize app
const app = new App();
window.app = app;

// Global function wrappers
window.openTab = (tabName, btn) => UIManager.openTab(tabName, btn);
window.toggleTheme = () => UIManager.toggleTheme();
window.undo = () => app.undo();
window.redo = () => app.redo();
window.saveActor = (e) => app.saveActor(e);
window.editActor = (id) => app.editActor(id);
window.deleteActor = (id) => app.deleteActor(id);
window.cancelActorEdit = () => app.resetActorForm();
window.searchActors = () => app.searchActors();
window.saveSet = (e) => app.saveSet(e);
window.editSet = (id) => app.editSet(id);
window.deleteSet = (id) => app.deleteSet(id);
window.cancelSetEdit = () => app.resetSetForm();
window.searchSets = () => app.searchSets();
window.saveProp = (e) => app.saveProp(e);
window.editProp = (id) => app.editProp(id);
window.deleteProp = (id) => app.deleteProp(id);
window.cancelPropEdit = () => app.resetPropForm();
window.searchProps = () => app.searchProps();
window.saveCharacter = (e) => app.saveCharacter(e);
window.editCharacter = (id) => app.editCharacter(id);
window.deleteCharacter = (id) => app.deleteCharacter(id);
window.cancelCharacterEdit = () => app.resetCharacterForm();
window.searchCharacters = () => app.searchCharacters();
window.updateToneSections = () => app.updateToneSections();
window.refreshCharacterForm = () => app.refreshCharacterForm();
window.openQuickAddModal = (type) => app.quickAddManager.open(type);
window.closeQuickAddModal = () => app.quickAddManager.close();
window.toggleAdvancedSearch = () => document.getElementById('characterAdvancedSearch').style.display = 
    document.getElementById('characterAdvancedSearch').style.display === 'none' ? 'block' : 'none';
window.performAdvancedSearch = () => app.searchManager.performAdvancedSearch({
    hanzi: document.getElementById('searchHanzi').value.toLowerCase(),
    pinyin: document.getElementById('searchPinyin').value.toLowerCase(),
    meaning: document.getElementById('searchMeaning').value.toLowerCase(),
    actor: document.getElementById('searchActor').value,
    set: document.getElementById('searchSet').value,
    prop: document.getElementById('searchProp').value
});
window.clearAdvancedSearch = () => {
    document.getElementById('searchHanzi').value = '';
    document.getElementById('searchPinyin').value = '';
    document.getElementById('searchMeaning').value = '';
    document.getElementById('searchActor').value = '';
    document.getElementById('searchSet').value = '';
    document.getElementById('searchProp').value = '';
    app.displayCharacters();
};

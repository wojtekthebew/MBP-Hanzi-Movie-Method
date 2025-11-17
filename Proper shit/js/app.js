import DataManager from './data-manager.js';
import FileUtils from './file-utils.js';
import UIManager from './ui-manager.js';
import ActorManager from './actor-manager.js';
import SearchManager from './search-manager.js';

class App {
    constructor() {
        this.dataManager = new DataManager();
        this.searchManager = new SearchManager(this.dataManager);
        this.actorManager = new ActorManager(this.dataManager);
        
        this.init();
    }

    async init() {
        await this.loadDataFromFiles();
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
                    console.warn(`Failed to load ${file}: ${res.status}`);
                    this.dataManager.DATA[key] = [];
                }
            } catch (e) {
                console.warn(`Error loading ${file}:`, e);
                this.dataManager.DATA[key] = [];
            }
        }));

        this.dataManager.saveState();
    }

    setupEventListeners() {
        document.getElementById('undoBtn')?.addEventListener('click', this.undo.bind(this));
        document.getElementById('redoBtn')?.addEventListener('click', this.redo.bind(this));
        
        // Image preview handlers
        ['actorImage', 'setImage', 'propImage', 'charImage'].forEach((id, idx) => {
            const previewIds = ['actorImagePreview', 'setImagePreview', 'propImagePreview', 'charImagePreview'];
            document.getElementById(id)?.addEventListener('change', (e) => 
                FileUtils.previewImage(e.target, previewIds[idx])
            );
        });
    }

    undo() {
        if (this.dataManager.undo()) {
            this.refreshAll();
            UIManager.showAlert('Undo completed');
        }
    }

    redo() {
        if (this.dataManager.redo()) {
            this.refreshAll();
            UIManager.showAlert('Redo completed');
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
            const charCount = this.dataManager.DATA.CHARACTERS.filter(c => c.set_location === set.id).length;
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
            const charCount = this.dataManager.DATA.CHARACTERS.filter(c => c.props.includes(prop.id)).length;
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

    // ...existing code (saveActor, editActor, deleteActor, refreshCharacterForm, etc.)...

    async saveActor(event) {
        event.preventDefault();
        try {
            const actorId = document.getElementById('actorId').value;
            const actorName = document.getElementById('actorName').value;
            
            if (this.actorManager.isDuplicateName(actorName, actorId)) {
                throw new Error('An actor with this name already exists!');
            }
            
            const img = await FileUtils.getImageDataURL(document.getElementById('actorImage'));
            if (img) document.getElementById('actorImage').dataset.imageUrl = img;
            
            const actorData = {
                name: actorName,
                PinyinInitial: document.getElementById('actorPinyin').value,
                image: document.getElementById('actorImage').dataset.imageUrl || '',
                characters: []
            };
            
            if (actorId) {
                const existing = this.actorManager.getById(actorId);
                if (existing) {
                    actorData.characters = existing.characters;
                    this.actorManager.update(actorId, actorData);
                    UIManager.showAlert('Actor updated successfully');
                }
            } else {
                this.actorManager.create(actorData);
                UIManager.showAlert('Actor added successfully');
            }
            
            this.resetActorForm();
            this.refreshLists();
        } catch (error) {
            UIManager.showAlert(error.message, 'error');
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
                UIManager.showAlert('Actor deleted successfully');
                this.refreshLists();
            }
        }
    }

    resetActorForm() {
        UIManager.resetForm('actorForm', {
            previewElementId: 'actorImagePreview',
            titleElementId: 'actorFormTitle',
            defaultTitle: 'Add New Actor',
            submitButtonId: 'actorSubmitBtn',
            defaultSubmitText: 'Add Actor',
            cancelButtonId: 'actorCancelBtn'
        });
        document.getElementById('actorName').focus();
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

    setupKeyboardNavigation() {
        // ...existing keyboard navigation code...
    }

    // Add remaining methods (editSet, deleteSet, saveProp, etc.)
}

// Initialize app
const app = new App();
window.app = app;

// Global function wrappers
window.openTab = (tabName, btn) => UIManager.openTab(tabName, btn);
window.toggleTheme = () => UIManager.toggleTheme();
window.undo = () => app.undo();
window.redo = () => app.redo();
window.saveActor = (event) => app.saveActor(event);
window.editActor = (id) => app.editActor(id);
window.deleteActor = (id) => app.deleteActor(id);
window.cancelActorEdit = () => app.resetActorForm();

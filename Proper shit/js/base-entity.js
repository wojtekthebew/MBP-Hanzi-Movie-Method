// Base class for all entities
class BaseEntity {
    constructor(dataManager, entityType) {
        this.dataManager = dataManager;
        this.entityType = entityType;
    }

    getAll() {
        return this.dataManager.DATA[this.entityType];
    }

    getById(id) {
        return this.getAll().find(item => item.id === id);
    }

    create(newItem) {
        const itemWithId = {
            id: this.dataManager.getNextId(this.getAll()),
            ...newItem
        };
        this.getAll().push(itemWithId);
        this.dataManager.saveState();
        return itemWithId;
    }

    update(id, updatedData) {
        const index = this.getAll().findIndex(item => item.id === id);
        if (index !== -1) {
            this.getAll()[index] = {
                ...this.getAll()[index],
                ...updatedData
            };
            this.dataManager.saveState();
            return true;
        }
        return false;
    }

    delete(id) {
        const initialLength = this.getAll().length;
        const filtered = this.getAll().filter(item => item.id !== id);
        this.dataManager.DATA[this.entityType] = filtered;
        this.dataManager.saveState();
        return filtered.length < initialLength;
    }

    isDuplicateName(name, excludeId = null) {
        return this.dataManager.isDuplicateName(this.entityType, name, excludeId);
    }
}

export default BaseEntity;

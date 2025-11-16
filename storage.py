# storage.py
import json
from pathlib import Path

DATA_DIR = Path("data")

def load_json(name):
    """Load JSON data from file"""
    path = DATA_DIR / name
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(name, data):
    """Save data to JSON file"""
    path = DATA_DIR / name
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_next_id(items, id_field="id"):
    """Generate a simple numeric ID for new items"""
    if not items:
        return "1"
    max_id = 0
    for item in items:
        try:
            item_id = int(item.get(id_field, 0))
            max_id = max(max_id, item_id)
        except (ValueError, TypeError):
            continue
    return str(max_id + 1)
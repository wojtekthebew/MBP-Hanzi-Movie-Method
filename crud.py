# crud.py
import uuid
from storage import load_json, save_json, get_next_id

# File constants
ACTOR_FILE = "actors.json"
SET_FILE = "sets.json"
PROP_FILE = "props.json"
CHARACTER_FILE = "characters.json"

# ===== ACTOR CRUD =====
def create_actor(name, PinyinInitial=""):
    actors = load_json(ACTOR_FILE)
    new_actor = {
        "id": get_next_id(actors),
        "name": name,
        "PinyinInitial": PinyinInitial,
        "characters": []
    }
    actors.append(new_actor)
    save_json(ACTOR_FILE, actors)
    return new_actor

def list_actors():
    return load_json(ACTOR_FILE)

def list_missing_actors():
    actors = load_json(ACTOR_FILE)
    return [actor for actor in actors if actor.get("name")==""]

def get_actor(actor_id):
    actors = load_json(ACTOR_FILE)
    for actor in actors:
        if actor["id"] == actor_id:
            return actor
    return None

def update_actor(actor_id, **updates):
    actors = load_json(ACTOR_FILE)
    for actor in actors:
        if actor["id"] == actor_id:
            for key, value in updates.items():
                if key in actor:
                    actor[key] = value
            save_json(ACTOR_FILE, actors)
            return actor
    return None

def delete_actor(actor_id):
    actors = load_json(ACTOR_FILE)
    actors = [actor for actor in actors if actor["id"] != actor_id]
    save_json(ACTOR_FILE, actors)

# ===== SET LOCATION CRUD =====
def create_set(name, tone_sections):
    sets = load_json(SET_FILE)
    new_set = {
        "id": get_next_id(sets),
        "name": name,
        "tone_sections": tone_sections,
        "characters": []
    }
    sets.append(new_set)
    save_json(SET_FILE, sets)
    return new_set

def list_sets():
    return load_json(SET_FILE)

def get_set(set_id):
    sets = load_json(SET_FILE)
    for set_loc in sets:
        if set_loc["id"] == set_id:
            return set_loc
    return None

def update_set(set_id, **updates):
    sets = load_json(SET_FILE)
    for set_loc in sets:
        if set_loc["id"] == set_id:
            for key, value in updates.items():
                if key in set_loc:
                    set_loc[key] = value
            save_json(SET_FILE, sets)
            return set_loc
    return None

def delete_set(set_id):
    sets = load_json(SET_FILE)
    sets = [s for s in sets if s["id"] != set_id]
    save_json(SET_FILE, sets)

# ===== PROP CRUD =====
def create_prop(name, category="general", components=None):
    props = load_json(PROP_FILE)
    new_prop = {
        "id": get_next_id(props),
        "name": name,
        "category": category,
        "components": components or [],
        "used_by": []
    }
    props.append(new_prop)
    save_json(PROP_FILE, props)
    return new_prop

def list_props():
    return load_json(PROP_FILE)

def get_prop(prop_id):
    props = load_json(PROP_FILE)
    for prop in props:
        if prop["id"] == prop_id:
            return prop
    return None

def update_prop(prop_id, **updates):
    props = load_json(PROP_FILE)
    for prop in props:
        if prop["id"] == prop_id:
            for key, value in updates.items():
                if key in prop:
                    prop[key] = value
            save_json(PROP_FILE, props)
            return prop
    return None

def delete_prop(prop_id):
    props = load_json(PROP_FILE)
    props = [p for p in props if p["id"] != prop_id]
    save_json(PROP_FILE, props)

# ===== CHARACTER CRUD =====
def create_character(hanzi, pinyin, meaning, actor_id, set_id, tone_section, props=None, memory_scene="", audio_file=""):
    # Validate references exist
    if not get_actor(actor_id):
        raise ValueError(f"Actor ID {actor_id} not found")
    if not get_set(set_id):
        raise ValueError(f"Set ID {set_id} not found")
    
    characters = load_json(CHARACTER_FILE)
    new_character = {
        "id": get_next_id(characters),
        "hanzi": hanzi,
        "pinyin": pinyin,
        "meaning": meaning,
        "actor": actor_id,
        "set_location": set_id,
        "tone_section": tone_section,
        "props": props or [],
        "memory_scene": memory_scene,
        "audio_file": audio_file
    }
    characters.append(new_character)
    save_json(CHARACTER_FILE, characters)
    
    # Update actor's character list
    actor = get_actor(actor_id)
    if new_character["id"] not in actor["characters"]:
        actor["characters"].append(new_character["id"])
        update_actor(actor_id, characters=actor["characters"])
    
    # Update set's character list
    set_loc = get_set(set_id)
    if new_character["id"] not in set_loc["characters"]:
        set_loc["characters"].append(new_character["id"])
        update_set(set_id, characters=set_loc["characters"])
    
    return new_character

def list_characters():
    return load_json(CHARACTER_FILE)

def get_character(char_id):
    characters = load_json(CHARACTER_FILE)
    for char in characters:
        if char["id"] == char_id:
            return char
    return None

def update_character(char_id, **updates):
    characters = load_json(CHARACTER_FILE)
    for char in characters:
        if char["id"] == char_id:
            for key, value in updates.items():
                if key in char:
                    char[key] = value
            save_json(CHARACTER_FILE, characters)
            return char
    return None



def delete_character(char_id):
    characters = load_json(CHARACTER_FILE)
    characters = [c for c in characters if c["id"] != char_id]
    save_json(CHARACTER_FILE, characters)

# ===== HELPER FUNCTIONS =====
def search_actors_by_name(name):
    actors = list_actors()
    return [actor for actor in actors if name.lower() in actor["name"].lower()]

def search_props_by_component(component):
    props = list_props()
    return [prop for prop in props if component in prop["components"]]

def find_characters_in_tone_section(set_id, tone_section):
    characters = list_characters()
    return [char for char in characters if char["set_location"] == set_id and char["tone_section"] == tone_section]
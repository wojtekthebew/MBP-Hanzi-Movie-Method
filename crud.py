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
    
    # Check if actor with same name or PinyinInitial already exists
    for actor in actors:
        if actor["name"] == name or actor["PinyinInitial"] == PinyinInitial:
            raise ValueError(f"Actor with name '{name}' or PinyinInitial '{PinyinInitial}' already exists")
    
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
    # Remove actor from characters that reference it
    characters = load_json(CHARACTER_FILE)
    for char in characters:
        if char["actor"] == actor_id:
            char["actor"] = ""  # Or you might want to set to a default actor
    save_json(CHARACTER_FILE, characters)
    
    actors = [actor for actor in actors if actor["id"] != actor_id]
    save_json(ACTOR_FILE, actors)

# ===== SET LOCATION CRUD =====

def create_set(name, tone_sections):
    # Check if set with same name already exists
    sets = load_json(SET_FILE)
    for set_loc in sets:
        if set_loc["name"] == name:
            raise ValueError(f"Set with name '{name}' already exists")
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
    # Remove set from characters that reference it
    characters = load_json(CHARACTER_FILE)
    for char in characters:
        if char["set_location"] == set_id:
            char["set_location"] = ""  # Or set to a default location
    save_json(CHARACTER_FILE, characters)
    
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
    # Remove prop from characters that reference it
    characters = load_json(CHARACTER_FILE)
    for char in characters:
        if prop_id in char["props"]:
            char["props"].remove(prop_id)
    save_json(CHARACTER_FILE, characters)
    
    props = [p for p in props if p["id"] != prop_id]
    save_json(PROP_FILE, props)

# ===== CHARACTER CRUD =====
def create_character(hanzi, pinyin, meaning, actor_id, set_id, tone_section, props=None, memory_scene="", audio_file=""):
    # Validate references exist first
    if actor_id and not get_actor(actor_id):
        raise ValueError(f"Actor ID {actor_id} not found")
    if set_id and not get_set(set_id):
        raise ValueError(f"Set ID {set_id} not found")
    
    characters = load_json(CHARACTER_FILE)  # Moved this BEFORE duplicate check
    
    # Check if character with same hanzi already exists
    for char in characters:
        if hanzi == char["hanzi"]:
            raise ValueError(f"Character with hanzi '{hanzi}' already exists")
    
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
    if actor_id:
        actor = get_actor(actor_id)
        if actor and new_character["id"] not in actor["characters"]:
            actor["characters"].append(new_character["id"])
            update_actor(actor_id, characters=actor["characters"])
    
    # Update set's character list
    if set_id:
        set_loc = get_set(set_id)
        if set_loc and new_character["id"] not in set_loc["characters"]:
            set_loc["characters"].append(new_character["id"])
            update_set(set_id, characters=set_loc["characters"])

    # Update props' used_by lists
    if props:
        for prop_id in props:
            prop = get_prop(prop_id)
            if prop and new_character["id"] not in prop["used_by"]:
                prop["used_by"].append(new_character["id"])
                update_prop(prop_id, used_by=prop["used_by"])
    
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
    old_character = None
    character_index = -1
    
    # Find the character and store old data
    for i, char in enumerate(characters):
        if char["id"] == char_id:
            old_character = char.copy()
            character_index = i
            break
    
    if old_character is None:
        return None
    
    # Apply updates
    for key, value in updates.items():
        if key in characters[character_index]:
            characters[character_index][key] = value
    
    save_json(CHARACTER_FILE, characters)
    updated_char = characters[character_index]
    
    # Handle relationship updates
    # Update actor relationships if changed
    if 'actor' in updates and updates['actor'] != old_character['actor']:
        # Remove from old actor
        if old_character['actor']:
            old_actor = get_actor(old_character['actor'])
            if old_actor and char_id in old_actor['characters']:
                old_actor['characters'].remove(char_id)
                update_actor(old_character['actor'], characters=old_actor['characters'])
        
        # Add to new actor
        if updates['actor']:
            new_actor = get_actor(updates['actor'])
            if new_actor and char_id not in new_actor['characters']:
                new_actor['characters'].append(char_id)
                update_actor(updates['actor'], characters=new_actor['characters'])
    
    # Update set relationships if changed
    if 'set_location' in updates and updates['set_location'] != old_character['set_location']:
        # Remove from old set
        if old_character['set_location']:
            old_set = get_set(old_character['set_location'])
            if old_set and char_id in old_set['characters']:
                old_set['characters'].remove(char_id)
                update_set(old_character['set_location'], characters=old_set['characters'])
        
        # Add to new set
        if updates['set_location']:
            new_set = get_set(updates['set_location'])
            if new_set and char_id not in new_set['characters']:
                new_set['characters'].append(char_id)
                update_set(updates['set_location'], characters=new_set['characters'])
    
    # Update prop relationships if changed
    if 'props' in updates and set(updates['props']) != set(old_character['props']):
        old_props = set(old_character['props'])
        new_props = set(updates['props'])
        
        # Remove from old props
        for prop_id in old_props - new_props:
            prop = get_prop(prop_id)
            if prop and char_id in prop['used_by']:
                prop['used_by'].remove(char_id)
                update_prop(prop_id, used_by=prop['used_by'])
        
        # Add to new props
        for prop_id in new_props - old_props:
            prop = get_prop(prop_id)
            if prop and char_id not in prop['used_by']:
                prop['used_by'].append(char_id)
                update_prop(prop_id, used_by=prop['used_by'])
    
    return updated_char

def delete_character(char_id):
    characters = load_json(CHARACTER_FILE)
    character_to_delete = None
    
    # Find the character first
    for char in characters:
        if char["id"] == char_id:
            character_to_delete = char
            break
    
    if character_to_delete is None:
        return
    
    # Remove from actor
    if character_to_delete['actor']:
        actor = get_actor(character_to_delete['actor'])
        if actor and char_id in actor['characters']:
            actor['characters'].remove(char_id)
            update_actor(character_to_delete['actor'], characters=actor['characters'])
    
    # Remove from set
    if character_to_delete['set_location']:
        set_loc = get_set(character_to_delete['set_location'])
        if set_loc and char_id in set_loc['characters']:
            set_loc['characters'].remove(char_id)
            update_set(character_to_delete['set_location'], characters=set_loc['characters'])
    
    # Remove from props
    for prop_id in character_to_delete['props']:
        prop = get_prop(prop_id)
        if prop and char_id in prop['used_by']:
            prop['used_by'].remove(char_id)
            update_prop(prop_id, used_by=prop['used_by'])
    
    # Finally delete the character
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
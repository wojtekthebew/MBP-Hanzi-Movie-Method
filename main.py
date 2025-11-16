# main.py
from crud import *

def print_separator():
    print("\n" + "="*50 + "\n")

def main():
    print("🎭 HMM Dashboard - Week 1 CLI Test")
    print("Manage your memory palace system\n")
    
    while True:
        print_separator()
        print("MAIN MENU:")
        print("1. Actors")
        print("2. Set Locations") 
        print("3. Props")
        print("4. Characters")
        print("5. Search & Tools")
        print("0. Exit")
        
        choice = input("\nChoose category: ").strip()
        
        if choice == "1":
            manage_actors()
        elif choice == "2":
            manage_sets()
        elif choice == "3":
            manage_props()
        elif choice == "4":
            manage_characters()
        elif choice == "5":
            search_tools()
        elif choice == "0":
            print("Goodbye! 👋")
            break
        else:
            print("Invalid choice. Please try again.")

def manage_actors():
    while True:
        print_separator()
        print("ACTORS MANAGEMENT:")
        print("1. List all actors")
        print("2. Add new actor")
        print("3. Update actor")
        print("4. Delete actor")
        print("5. List actors missing Name")

        print("0. Back to main menu")   
        
        choice = input("\nChoose action: ").strip()
        
        if choice == "1":
            actors = list_actors()
            print(f"\n📋 Found {len(actors)} actors:")
            for actor in actors:
                print(f"  {actor['id']}: {actor['name']} - {actor['PinyinInitial']}")
                print(f"     Characters: {len(actor['characters'])}")
                
        elif choice == "2":
            name = input("Actor name: ").strip()
            pinyin_initial = input("PinyinInitial: ").strip()
            actor = create_actor(name, pinyin_initial)
            print(f"✅ Created actor: {actor['name']} (ID: {actor['id']})")
            
        elif choice == "3":
            actor_id = input("Actor ID to update: ").strip()
            actor = get_actor(actor_id)
            if actor:
                print(f"Current: {actor['name']} - {actor['PinyinInitial']}")
                new_name = input("New name (enter to keep current): ").strip()
                new_pinyin_initial = input("New PinyinInitial (enter to keep current): ").strip()
                updates = {}
                if new_name: updates["name"] = new_name
                if new_pinyin_initial: updates["PinyinInitial"] = new_pinyin_initial
                if updates:
                    update_actor(actor_id, **updates)
                    print("✅ Actor updated")
                else:
                    print("❌ No changes made")
            else:
                print("❌ Actor not found")
                
        elif choice == "4":
            actor_id = input("Actor ID to delete: ").strip()
            actor = get_actor(actor_id)
            if actor:
                delete_actor(actor_id)
                print(f"✅ Deleted actor: {actor['name']}")
            else:
                print("❌ Actor not found")
                
        elif choice == "5":
            missing_actors = list_missing_actors()
            print(f"\n📋 Found {len(missing_actors)} actors missing Name:")
            for actor in missing_actors:
                print(f"  ID {actor['id']}: {actor['PinyinInitial']}")
                
        elif choice == "0":
            break

def manage_sets():
    while True:
        print_separator()
        print("SET LOCATIONS MANAGEMENT:")
        print("1. List all sets")
        print("2. Add new set")
        print("0. Back to main menu")
        
        choice = input("\nChoose action: ").strip()
        
        if choice == "1":
            sets = list_sets()
            print(f"\n🏢 Found {len(sets)} sets:")
            for set_loc in sets:
                print(f"  {set_loc['id']}: {set_loc['name']}")
                for tone, section in set_loc['tone_sections'].items():
                    print(f"    Tone {tone}: {section}")
                print(f"    Characters: {len(set_loc['characters'])}")
                
        elif choice == "2":
            name = input("Set name: ").strip()
            print("Enter tone sections (1-5), leave blank to skip:")
            tone_sections = {}
            for tone in range(1, 6):
                section = input(f"Tone {tone}: ").strip()
                if section:
                    tone_sections[tone] = section
            if tone_sections:
                set_loc = create_set(name, tone_sections)
                print(f"✅ Created set: {set_loc['name']} (ID: {set_loc['id']})")
            else:
                print("❌ At least one tone section required")
                
        elif choice == "0":
            break

def manage_props():
    while True:
        print_separator()
        print("PROPS MANAGEMENT:")
        print("1. List all props")
        print("2. Add new prop")
        print("0. Back to main menu")
        
        choice = input("\nChoose action: ").strip()
        
        if choice == "1":
            props = list_props()
            print(f"\n🎭 Found {len(props)} props:")
            for prop in props:
                print(f"  {prop['id']}: {prop['name']} ({prop['category']})")
                if prop['components']:
                    print(f"     Components: {', '.join(prop['components'])}")
                print(f"     Used by: {len(prop['used_by'])} characters")
                
        elif choice == "2":
            name = input("Prop name: ").strip()
            category = input("Category (general/character/furniture): ").strip() or "general"
            components_input = input("Components (comma-separated): ").strip()
            components = [c.strip() for c in components_input.split(",")] if components_input else []
            prop = create_prop(name, category, components)
            print(f"✅ Created prop: {prop['name']} (ID: {prop['id']})")
                
        elif choice == "0":
            break

def manage_characters():
    while True:
        print_separator()
        print("CHARACTERS MANAGEMENT:")
        print("1. List all characters")
        print("2. Add new character")
        print("0. Back to main menu")
        
        choice = input("\nChoose action: ").strip()
        
        if choice == "1":
            characters = list_characters()
            print(f"\n🈴 Found {len(characters)} characters:")
            for char in characters:
                actor = get_actor(char['actor'])
                set_loc = get_set(char['set_location'])
                actor_name = actor['name'] if actor else "Unknown"
                set_name = set_loc['name'] if set_loc else "Unknown"
                print(f"  {char['id']}: {char['hanzi']} ({char['pinyin']}) - {char['meaning']}")
                print(f"     Actor: {actor_name}, Set: {set_name}, Tone: {char['tone_section']}")
                print(f"     Props: {len(char['props'])}")
                
        elif choice == "2":
            try:
                hanzi = input("Hanzi: ").strip()
                pinyin = input("Pinyin: ").strip()
                meaning = input("Meaning: ").strip()
                
                # Show available actors
                actors = list_actors()
                print("\nAvailable actors:")
                for actor in actors:
                    print(f"  {actor['id']}: {actor['name']}")
                actor_id = input("Actor ID: ").strip()
                
                # Show available sets
                sets = list_sets()
                print("\nAvailable sets:")
                for set_loc in sets:
                    print(f"  {set_loc['id']}: {set_loc['name']}")
                set_id = input("Set ID: ").strip()
                
                tone_section = int(input("Tone section (1-5): ").strip())
                
                # Show available props
                props = list_props()
                if props:
                    print("\nAvailable props:")
                    for prop in props:
                        print(f"  {prop['id']}: {prop['name']}")
                    props_input = input("Prop IDs (comma-separated): ").strip()
                    prop_ids = [p.strip() for p in props_input.split(",")] if props_input else []
                else:
                    prop_ids = []
                
                memory_scene = input("Memory scene (optional): ").strip()
                
                char = create_character(hanzi, pinyin, meaning, actor_id, set_id, tone_section, prop_ids, memory_scene)
                print(f"✅ Created character: {char['hanzi']} (ID: {char['id']})")
                
            except ValueError as e:
                print(f"❌ Error: {e}")
            except Exception as e:
                print(f"❌ Unexpected error: {e}")
                
        elif choice == "0":
            break

def search_tools():
    while True:
        print_separator()
        print("SEARCH & TOOLS:")
        print("1. Search actors by name")
        print("2. Search props by component")
        print("3. Find characters in tone section")
        print("0. Back to main menu")
        
        choice = input("\nChoose action: ").strip()
        
        if choice == "1":
            name = input("Search actor name: ").strip()
            results = search_actors_by_name(name)
            print(f"\n🔍 Found {len(results)} actors:")
            for actor in results:
                print(f"  {actor['id']}: {actor['name']} - {actor['PintyinInitial']}")
                
        elif choice == "2":
            component = input("Search component: ").strip()
            results = search_props_by_component(component)
            print(f"\n🔍 Found {len(results)} props:")
            for prop in results:
                print(f"  {prop['id']}: {prop['name']} - Components: {', '.join(prop['components'])}")
                
        elif choice == "3":
            set_id = input("Set ID: ").strip()
            tone_section = int(input("Tone section (1-5): ").strip())
            results = find_characters_in_tone_section(set_id, tone_section)
            print(f"\n🔍 Found {len(results)} characters in tone section {tone_section}:")
            for char in results:
                print(f"  {char['hanzi']} ({char['pinyin']}) - {char['meaning']}")
                
        elif choice == "0":
            break

if __name__ == "__main__":
    main()
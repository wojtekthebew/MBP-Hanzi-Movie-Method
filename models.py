# models.py0
from dataclasses import dataclass, asdict
from typing import List, Dict

@dataclass
class Actor:
    id: str
    name: str
    PinyinInitial: str = ""
    characters: List[str] = None
    
    def __post_init__(self):
        if self.characters is None:
            self.characters = []
    
    def to_dict(self):
        return asdict(self)

@dataclass
class SetLocation:
    id: str
    name: str
    tone_sections: Dict[int, str]
    characters: List[str] = None
    
    def __post_init__(self):
        if self.characters is None:
            self.characters = []
    
    def to_dict(self):
        return asdict(self)

@dataclass
class Prop:
    id: str
    name: str
    category: str = "general"
    components: List[str] = None  # Fixed: changed from str to List[str]
    used_by: List[str] = None
    
    def __post_init__(self):
        if self.components is None:
            self.components = []
        if self.used_by is None:
            self.used_by = []
    
    def to_dict(self):
        return asdict(self)

@dataclass
class Character:
    id: str
    hanzi: str
    pinyin: str
    meaning: str
    actor: str  # actor ID
    set_location: str  # set location ID
    tone_section: int
    props: List[str] = None  # list of prop IDs
    memory_scene: str = ""
    audio_file: str = ""
    
    def __post_init__(self):
        if self.props is None:
            self.props = []
    
    def to_dict(self):
        return asdict(self)
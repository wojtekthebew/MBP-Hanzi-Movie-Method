# models.py
from dataclasses import dataclass, asdict, field
from typing import List, Dict

@dataclass
class Actor:
    id: str
    name: str
    PinyinInitial: str = ""
    image: str = ""
    characters: List[str] = field(default_factory=list)
    
    def to_dict(self):
        return asdict(self)

@dataclass
class SetLocation:
    id: str
    name: str
    tone_sections: Dict[int, str]
    image: str = ""
    characters: List[str] = field(default_factory=list)
    
    def to_dict(self):
        return asdict(self)

@dataclass
class Prop:
    id: str
    name: str
    category: str = "general"
    components: List[str] = field(default_factory=list)
    image: str = ""
    used_by: List[str] = field(default_factory=list)
    
    def to_dict(self):
        return asdict(self)

@dataclass
class Character:
    id: str
    hanzi: str
    pinyin: str
    meaning: str
    actor: str
    set_location: str
    tone_section: int
    props: List[str] = field(default_factory=list)
    plot: str = ""
    image: str = ""
    memory_scene: str = ""
    audio_file: str = ""
    
    def to_dict(self):
        return asdict(self)
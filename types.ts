
export enum ViewMode {
  OUTLINE = 'outline',
  TIMELINE = 'timeline',
  MAP = 'map',
  CHARACTERS = 'characters',
  ITEMS = 'items',
  SCENES = 'scenes',
  REFERENCES = 'references',
  CLUE_WALL = 'clue_wall', // New
  SETTINGS = 'settings',
  PREVIEW = 'preview',
}

export enum MapStyle {
  VINTAGE = 'vintage',
  REALISTIC = 'realistic',
  BLUEPRINT = 'blueprint',
  ISOMETRIC = 'isometric',
  PIXEL = 'pixel',
}

export enum OutlineTemplate {
  THREE_ACT = '三幕式结构',
  HEROS_JOURNEY = '英雄之旅',
  KISHOTENKETSU = '起承转合 (四段式)',
  HOLLYWOOD = '好莱坞大片',
  CLASSIC_COC = '经典COC调查',
  WHODUNIT = '暴风雪山庄/本格推理',
  NOIR = '黑色电影',
  SURVIVAL = '荒野求生/沙盒',
  ESCAPE_ROOM = '密室逃脱',
  HITCHCOCK = '希区柯克式悬疑',
  FREEFORM = '无模板 (自由创作)',
}

export enum VisualTheme {
  VINTAGE_1920 = 'vintage_1920',
  CTHULHU_MYTHOS = 'cthulhu_mythos',
  FILM_NOIR = 'film_noir',
  CYBERPUNK = 'cyberpunk',
  RETRO_FUTURISM = 'retro_futurism',
  MINIMALIST = 'minimalist',
  GOTHIC = 'gothic',
  PULP_FICTION = 'pulp_fiction',
  STEAMPUNK = 'steampunk',
  VAPORWAVE = 'vaporwave',
  POLAROID = 'polaroid',
  BLUEPRINT = 'blueprint',
  TERMINAL = 'terminal',
}

export interface SkillCheck {
    skill: string;
    difficulty: 'Regular' | 'Hard' | 'Extreme';
    success: string;
    failure: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  content: string; 
  type: 'background' | 'scenario' | 'ending'; // Added ending
  isInterventionPoint?: boolean;

  // Background Event Specifics
  eventLocation?: string;
  eventPeople?: string;
  eventResults?: string; 
  obtainableClues?: string; 
  imageUrl?: string;

  // Scenario Event Specifics
  prerequisites?: string;
  readAloud?: string;
  sceneDetails?: string; 
  sceneFlow?: string;
  sceneObjective?: string;
  
  // New: Skill Checks
  skillChecks?: SkillCheck[];

  // New: Ending Specifics
  endingCondition?: string;
  endingDescription?: string;

  // Linked Asset IDs
  linkedCharacterIds?: string[];
  linkedLocationIds?: string[];
  linkedItemIds?: string[];
  
  // Clue Wall Position
  boardX?: number;
  boardY?: number;
}

export interface MapLocation {
  id: string;
  x: number; 
  y: number; 
  name: string;
  description: string;
  npcs: string[];
  imageUrl?: string;
}

export interface Character {
  id: string;
  name: string;
  age: string;
  occupation: string;
  description: string; 
  personality: string;
  belief: string; 
  backstory: string;
  goal: string;
  actionStyle: string;
  skills: string; 
  secret: string; 
  imageUrl?: string;
  
  // Clue Wall Position
  boardX?: number;
  boardY?: number;
}

export type ItemType = 'Clue' | 'Weapon' | 'Tool' | 'Artifact' | 'Document';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  attributes?: string; 
  owner?: string;
  foundLocation?: string;
  imageUrl?: string;
  
  // Clue Wall Position
  boardX?: number;
  boardY?: number;
}

export interface ReferenceEntry {
  id: string;
  title: string;
  url: string;
  note: string;
}

export interface ScenarioOutline {
  title: string;
  template: OutlineTemplate;
  
  // New Fields for Standard COC Format
  era?: string; // 时代背景
  playerInfo?: string; // 玩家情报
  
  act1: string; 
  act2: string; 
  act3: string; 
  act4?: string; 
  truth: string; 
  faq?: string; // 守秘人建议
}

export interface ScenarioData {
  outline: ScenarioOutline;
  timeline: TimelineEvent[];
  locations: MapLocation[];
  characters: Character[];
  items: Item[];
  references: ReferenceEntry[];
  mapStyle?: MapStyle;
  mapLayoutSeed?: number; 
}

export interface SavedProject {
  id: string;
  name: string;
  lastModified: number;
  data: ScenarioData;
}

export interface UserInput {
  prompt: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
}

export interface GenerationRequest {
  viewMode: ViewMode;
  context?: ScenarioData; 
  userInput: UserInput;
}

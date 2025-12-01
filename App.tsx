
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import InputForm from './components/InputForm';
import OutlineView from './components/OutlineView';
import TimelineView from './components/TimelineView';
import MapView from './components/MapView';
import CharacterView from './components/CharacterView';
import ItemView from './components/ItemView';
import SceneView from './components/SceneView';
import SettingsView from './components/SettingsView';
import PreviewView from './components/PreviewView';
import ReferenceView from './components/ReferenceView';
import ClueWallView from './components/ClueWallView';
import { ViewMode, ScenarioData, UserInput, TimelineEvent, MapLocation, Character, Item, OutlineTemplate, VisualTheme, ReferenceEntry, ItemType } from './types';
import { generateContent } from './geminiService';

const INITIAL_SCENARIO: ScenarioData = {
  outline: {
    title: '',
    template: OutlineTemplate.THREE_ACT,
    era: '',
    playerInfo: '',
    act1: '',
    act2: '',
    act3: '',
    act4: '',
    truth: '',
    faq: ''
  },
  timeline: [],
  locations: [],
  characters: [],
  items: [],
  references: [],
  mapLayoutSeed: 12345 
};

// Theme Definitions with Improved Contrast and Fonts
const THEMES: Record<VisualTheme, React.CSSProperties> = {
  [VisualTheme.VINTAGE_1920]: {
    '--color-paper': '#f4f1ea',
    '--color-ink': '#1a1a1a',
    '--color-blood': '#8a1c1c',
    '--color-gold': '#b08d55', 
    '--color-charcoal': '#2d2d2d',
    '--color-sepia': '#e8e4d9',
    '--font-display': '"Cinzel", serif',
    '--font-serif': '"Playfair Display", serif',
    '--font-mono': '"Courier Prime", monospace',
    '--font-sans': '"Noto Serif SC", serif',
    '--bg-grain': "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
  } as React.CSSProperties,
  [VisualTheme.CTHULHU_MYTHOS]: {
    '--color-paper': '#0f1a15',
    '--color-ink': '#a8d5ba', 
    '--color-blood': '#ff4d4d',
    '--color-gold': '#5da383',
    '--color-charcoal': '#1a2f23',
    '--color-sepia': '#1c3329',
    '--font-display': '"Cinzel", serif',
    '--font-serif': '"Noto Serif SC", serif',
    '--font-mono': '"Courier Prime", monospace',
    '--font-sans': '"Noto Serif SC", serif',
    '--bg-grain': "url('https://www.transparenttextures.com/patterns/black-scales.png')",
  } as React.CSSProperties,
  [VisualTheme.FILM_NOIR]: {
    '--color-paper': '#e5e5e5',
    '--color-ink': '#000000',
    '--color-blood': '#cc0000',
    '--color-gold': '#666666',
    '--color-charcoal': '#1a1a1a',
    '--color-sepia': '#cccccc',
    '--font-display': '"Playfair Display", serif',
    '--font-serif': '"Times New Roman", serif',
    '--font-mono': '"Courier Prime", monospace',
    '--font-sans': '"Arial", sans-serif',
    '--bg-grain': "url('https://www.transparenttextures.com/patterns/noise.png')",
  } as React.CSSProperties,
  [VisualTheme.CYBERPUNK]: {
    '--color-paper': '#050510',
    '--color-ink': '#00ffff',
    '--color-blood': '#ff00ff',
    '--color-gold': '#ffff00',
    '--color-charcoal': '#121225',
    '--color-sepia': '#0a0a20',
    '--font-display': '"Orbitron", sans-serif',
    '--font-serif': '"Orbitron", sans-serif',
    '--font-mono': '"VT323", monospace',
    '--font-sans': '"Orbitron", sans-serif',
    '--bg-grain': "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
  } as React.CSSProperties,
  [VisualTheme.RETRO_FUTURISM]: {
    '--color-paper': '#f0f4f8',
    '--color-ink': '#004e64',
    '--color-blood': '#ff6b35',
    '--color-gold': '#f7c59f',
    '--color-charcoal': '#25a9ce',
    '--color-sepia': '#dbe9ee',
    '--font-display': '"Orbitron", sans-serif',
    '--font-serif': '"Playfair Display", serif',
    '--font-mono': '"Courier Prime", monospace',
    '--font-sans': '"Noto Serif SC", serif',
    '--bg-grain': "url('https://www.transparenttextures.com/patterns/stardust.png')",
  } as React.CSSProperties,
  [VisualTheme.MINIMALIST]: {
    '--color-paper': '#ffffff',
    '--color-ink': '#000000',
    '--color-blood': '#ff0000',
    '--color-gold': '#cccccc',
    '--color-charcoal': '#333333',
    '--color-sepia': '#f5f5f5',
    '--font-display': '"Helvetica Neue", sans-serif',
    '--font-serif': '"Georgia", serif',
    '--font-mono': '"Courier New", monospace',
    '--font-sans': '"Arial", sans-serif',
    '--bg-grain': "none",
  } as React.CSSProperties,
  [VisualTheme.GOTHIC]: {
    '--color-paper': '#1a0505',
    '--color-ink': '#b00000',
    '--color-blood': '#ff0000',
    '--color-gold': '#4a0000',
    '--color-charcoal': '#000000',
    '--color-sepia': '#2a0a0a',
    '--font-display': '"Cinzel", serif',
    '--font-serif': '"Playfair Display", serif',
    '--font-mono': '"Courier Prime", monospace',
    '--font-sans': '"Noto Serif SC", serif',
    '--bg-grain': "url('https://www.transparenttextures.com/patterns/dark-leather.png')",
  } as React.CSSProperties,
  [VisualTheme.PULP_FICTION]: {
    '--color-paper': '#fdfcdc',
    '--color-ink': '#001f3f',
    '--color-blood': '#ff4136',
    '--color-gold': '#ff851b',
    '--color-charcoal': '#85144b',
    '--color-sepia': '#f0e68c',
    '--font-display': '"Impact", sans-serif', 
    '--font-serif': '"Playfair Display", serif',
    '--font-mono': '"Courier Prime", monospace',
    '--font-sans': '"Noto Serif SC", serif',
    '--bg-grain': "url('https://www.transparenttextures.com/patterns/cardboard.png')",
  } as React.CSSProperties,
  [VisualTheme.STEAMPUNK]: {
    '--color-paper': '#dcc4ac',
    '--color-ink': '#4b3621',
    '--color-blood': '#800000',
    '--color-gold': '#b87333', 
    '--color-charcoal': '#2f1b0c',
    '--color-sepia': '#c2b280',
    '--font-display': '"Playfair Display", serif',
    '--font-serif': '"Courier Prime", monospace',
    '--font-mono': '"Courier Prime", monospace',
    '--font-sans': '"Noto Serif SC", serif',
    '--bg-grain': "url('https://www.transparenttextures.com/patterns/wood.png')",
  } as React.CSSProperties,
  [VisualTheme.VAPORWAVE]: {
    '--color-paper': '#1a1a2e', 
    '--color-ink': '#ff71ce', 
    '--color-blood': '#01cdfe', 
    '--color-gold': '#fffb96', 
    '--color-charcoal': '#2e2e4a',
    '--color-sepia': '#b967ff',
    '--font-display': '"Orbitron", sans-serif',
    '--font-serif': '"Noto Serif SC", serif',
    '--font-mono': '"VT323", monospace',
    '--font-sans': '"Noto Serif SC", serif',
    '--bg-grain': "linear-gradient(180deg, #1a1a2e 0%, #2a1a3e 100%)",
  } as React.CSSProperties,
  [VisualTheme.POLAROID]: {
    '--color-paper': '#fffbf0',
    '--color-ink': '#4a4a4a',
    '--color-blood': '#d9534f',
    '--color-gold': '#f0ad4e',
    '--color-charcoal': '#333333',
    '--color-sepia': '#f7f2e0',
    '--font-display': '"Courier Prime", monospace',
    '--font-serif': '"Courier Prime", monospace',
    '--font-mono': '"Courier Prime", monospace',
    '--font-sans': '"Courier Prime", monospace',
    '--bg-grain': "url('https://www.transparenttextures.com/patterns/white-paper.png')",
  } as React.CSSProperties,
  [VisualTheme.BLUEPRINT]: {
    '--color-paper': '#1e3a8a',
    '--color-ink': '#ffffff',
    '--color-blood': '#93c5fd',
    '--color-gold': '#fbbf24',
    '--color-charcoal': '#172554',
    '--color-sepia': '#1d4ed8',
    '--font-display': '"Courier Prime", monospace',
    '--font-serif': '"Courier Prime", monospace',
    '--font-mono': '"Courier Prime", monospace',
    '--font-sans': '"Courier Prime", monospace',
    '--bg-grain': "radial-gradient(#ffffff 1px, transparent 1px)",
  } as React.CSSProperties,
  [VisualTheme.TERMINAL]: {
    '--color-paper': '#000000',
    '--color-ink': '#33ff33', 
    '--color-blood': '#ff3333',
    '--color-gold': '#ffff33',
    '--color-charcoal': '#002200',
    '--color-sepia': '#001100',
    '--font-display': '"VT323", monospace',
    '--font-serif': '"VT323", monospace',
    '--font-mono': '"VT323", monospace',
    '--font-sans': '"VT323", monospace',
    '--bg-grain': "none",
  } as React.CSSProperties,
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>(ViewMode.OUTLINE);
  const [scenario, setScenario] = useState<ScenarioData>(INITIAL_SCENARIO);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [theme, setTheme] = useState<VisualTheme>(VisualTheme.VINTAGE_1920);

  const handleGenerate = async (input: UserInput) => {
    setIsLoading(true);
    try {
      const resultJSON = await generateContent({
        viewMode: (activeView === ViewMode.SETTINGS || activeView === ViewMode.PREVIEW || activeView === ViewMode.REFERENCES || activeView === ViewMode.CLUE_WALL) ? ViewMode.OUTLINE : activeView,
        userInput: input,
        context: scenario
      });

      let parsedData;
      try {
        const cleanJSON = resultJSON.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanJSON);
      } catch (e) {
        console.error("Failed to parse AI response", resultJSON);
        alert("The stars were wrong... (AI format error)");
        return;
      }

      // State Update Logic
      if (activeView === ViewMode.OUTLINE) {
        setScenario(prev => ({ ...prev, outline: { ...prev.outline, ...parsedData } }));
      } else if (activeView === ViewMode.TIMELINE) {
         const newItems = Array.isArray(parsedData) ? parsedData : [parsedData];
         const formattedEvents = newItems.map((ev: any) => ({
             id: Date.now().toString() + Math.random(),
             date: ev.date || "未知时间",
             title: ev.title || "未命名事件",
             content: ev.content || "",
             type: ev.type || 'scenario',
             isInterventionPoint: ev.isInterventionPoint,
             eventLocation: ev.eventLocation,
             eventPeople: ev.eventPeople,
             eventResults: ev.eventResults,
             obtainableClues: ev.obtainableClues,
             prerequisites: ev.prerequisites,
             readAloud: ev.readAloud,
             sceneDetails: ev.sceneDetails,
             sceneFlow: ev.sceneFlow,
             sceneObjective: ev.sceneObjective,
             skillChecks: ev.skillChecks || [],
             endingCondition: ev.endingCondition,
             endingDescription: ev.endingDescription
         }));
         setScenario(prev => ({ ...prev, timeline: [...prev.timeline, ...formattedEvents] }));
      } else if (activeView === ViewMode.MAP) {
          const newLocs = (Array.isArray(parsedData) ? parsedData : [parsedData]).map((loc: any) => ({
                id: Date.now().toString() + Math.random(),
                x: loc.x || Math.floor(Math.random() * 80) + 10,
                y: loc.y || Math.floor(Math.random() * 80) + 10,
                name: loc.name || "未命名地点",
                description: loc.description || "",
                npcs: loc.npcs || []
          }));
          setScenario(prev => ({ ...prev, locations: [...prev.locations, ...newLocs] }));
      } else if (activeView === ViewMode.CHARACTERS) {
          const newChars = (Array.isArray(parsedData) ? parsedData : [parsedData]).map((c: any) => ({
                 id: Date.now().toString() + Math.random(),
                 name: c.name || "未知",
                 age: c.age || "",
                 occupation: c.occupation || "",
                 description: c.description || "",
                 personality: c.personality || "",
                 belief: c.belief || "",
                 backstory: c.backstory || "",
                 goal: c.goal || "",
                 actionStyle: c.actionStyle || "",
                 skills: c.skills || "",
                 secret: c.secret || ""
          }));
          setScenario(prev => ({ ...prev, characters: [...prev.characters, ...newChars] }));
      } else if (activeView === ViewMode.ITEMS) {
          const newItems = (Array.isArray(parsedData) ? parsedData : [parsedData]).map((i: any) => ({
                 id: Date.now().toString() + Math.random(),
                 name: i.name || "新物品",
                 type: i.type || "Clue",
                 description: i.description || "",
                 attributes: i.attributes || "",
                 owner: i.owner || "",
                 foundLocation: i.foundLocation || ""
          }));
          setScenario(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
      } else if (activeView === ViewMode.SCENES && selectedEventId) {
          setScenario(prev => ({
              ...prev,
              timeline: prev.timeline.map(ev => ev.id === selectedEventId ? { ...ev, ...parsedData } : ev)
          }));
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || "An unexpected horror occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddScene = (type: 'background' | 'scenario' | 'ending') => {
    const newScene: TimelineEvent = {
        id: Date.now().toString(),
        date: "待定",
        title: type === 'background' ? "新调查简报" : type === 'ending' ? "新结局分支" : "新剧本场景",
        content: "",
        type: type,
        sceneDetails: "",
        readAloud: ""
    };
    setScenario(prev => ({
        ...prev,
        timeline: [...prev.timeline, newScene]
    }));
    setSelectedEventId(newScene.id);
  };

  const handleNavigate = (type: 'character' | 'location' | 'item', id: string) => {
      if (type === 'character') {
          setActiveView(ViewMode.CHARACTERS);
      } else if (type === 'location') {
          setSelectedLocationId(id);
          setActiveView(ViewMode.MAP);
      } else if (type === 'item') {
          setActiveView(ViewMode.ITEMS);
      }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-paper font-sans selection:bg-blood selection:text-white" style={THEMES[theme] as React.CSSProperties}>
      <div className="md:hidden bg-charcoal text-gold p-4 text-center font-display tracking-widest border-b-4 border-double border-gold z-50">
        Lovecraft Dislikes
      </div>

      <Sidebar 
        activeView={activeView} 
        currentTheme={theme}
        onSelect={(view) => {
          setActiveView(view);
          if (view !== ViewMode.SCENES && view !== ViewMode.MAP) {
              setSelectedEventId(null); 
              setSelectedLocationId(null);
          }
        }} 
      />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-paper transition-colors duration-500">
        
        <div className="h-16 w-full bg-ink border-b-4 border-gold shadow-md flex items-center justify-between px-8 relative z-20 shrink-0 transition-colors duration-500 no-print">
          <div className="text-paper/80 font-mono text-xs hidden md:block uppercase tracking-widest">
            Investigator: Keeper
          </div>
          <div className="text-gold font-display text-lg tracking-widest uppercase truncate max-w-lg">
             {scenario.outline.title || "Untitled Scenario"}
          </div>
          <div className="text-paper/80 font-mono text-xs hidden md:block">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative scroll-smooth bg-paper bg-grain transition-colors duration-500">
          <div className="min-h-full">
            {activeView === ViewMode.SETTINGS && (
                <SettingsView 
                    currentScenario={scenario}
                    onLoad={setScenario}
                    onNew={() => setScenario(INITIAL_SCENARIO)}
                    currentTheme={theme}
                    onThemeChange={setTheme}
                />
            )}

            {activeView === ViewMode.PREVIEW && (
                <PreviewView scenario={scenario} />
            )}
            
            {activeView === ViewMode.CLUE_WALL && (
                <ClueWallView 
                    scenario={scenario} 
                    onChange={(updates) => setScenario(prev => ({ ...prev, ...updates }))}
                />
            )}

            {activeView === ViewMode.REFERENCES && (
                <ReferenceView 
                    references={scenario.references} 
                    onChange={(refs) => setScenario(prev => ({ ...prev, references: refs }))}
                />
            )}

            {activeView === ViewMode.OUTLINE && (
                <OutlineView 
                    data={scenario.outline} 
                    onChange={(newOutline) => setScenario(prev => ({ ...prev, outline: newOutline }))} 
                />
            )}
            
            {activeView === ViewMode.TIMELINE && (
                <TimelineView 
                    events={scenario.timeline}
                    onChange={(newEvents) => setScenario(prev => ({ ...prev, timeline: newEvents }))}
                    onSelectEvent={(ev) => {
                        setSelectedEventId(ev.id);
                        setActiveView(ViewMode.SCENES); 
                    }}
                    onAutoGenerate={() => handleGenerate({
                        prompt: "AUTO_UPDATE",
                        tone: "Normal",
                        length: "medium"
                    })}
                />
            )}

            {activeView === ViewMode.SCENES && (
                <SceneView 
                    events={scenario.timeline}
                    selectedEventId={selectedEventId}
                    onSelectEvent={setSelectedEventId}
                    onChangeEvent={(id, updates) => setScenario(prev => ({
                        ...prev,
                        timeline: prev.timeline.map(ev => ev.id === id ? { ...ev, ...updates } : ev)
                    }))}
                    characters={scenario.characters}
                    locations={scenario.locations}
                    items={scenario.items}
                    onNavigate={handleNavigate}
                    onAddScene={handleAddScene}
                />
            )}

            {activeView === ViewMode.MAP && (
                <MapView 
                    locations={scenario.locations}
                    onChange={(newLocs) => setScenario(prev => ({ ...prev, locations: newLocs }))}
                    onSelectLocation={(loc) => setSelectedLocationId(loc ? loc.id : null)}
                    selectedLocationId={selectedLocationId}
                    onAutoGenerate={() => handleGenerate({
                        prompt: "AUTO_CREATE",
                        tone: "Normal",
                        length: "medium"
                    })}
                    mapSeed={scenario.mapLayoutSeed}
                    onUpdateSeed={(seed) => setScenario(prev => ({ ...prev, mapLayoutSeed: seed }))}
                />
            )}

            {activeView === ViewMode.CHARACTERS && (
                <CharacterView 
                    characters={scenario.characters}
                    onChange={(newChars) => setScenario(prev => ({ ...prev, characters: newChars }))}
                    onAutoGenerate={() => handleGenerate({
                        prompt: "AUTO_CREATE",
                        tone: "Normal",
                        length: "medium"
                    })}
                />
            )}

            {activeView === ViewMode.ITEMS && (
                <ItemView 
                    items={scenario.items}
                    onChange={(newItems) => setScenario(prev => ({ ...prev, items: newItems }))}
                    onAutoGenerate={() => handleGenerate({
                        prompt: "AUTO_CREATE",
                        tone: "Normal",
                        length: "medium"
                    })}
                />
            )}
          </div>
        </div>

        <InputForm viewMode={activeView} onSubmit={handleGenerate} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default App;

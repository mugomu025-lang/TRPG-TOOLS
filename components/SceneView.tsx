
import React from 'react';
import { TimelineEvent, Character, MapLocation, Item, SkillCheck } from '../types';
import { Plus, AlertTriangle, FileText, Search, Target, List, Upload, Link as LinkIcon, Briefcase, GitBranch, Dices, X } from 'lucide-react';

interface SceneViewProps {
  events: TimelineEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  onChangeEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  characters: Character[];
  locations: MapLocation[];
  items: Item[];
  onNavigate: (type: 'character' | 'location' | 'item', id: string) => void;
  onAddScene: (type: 'background' | 'scenario' | 'ending') => void;
}

const SceneView: React.FC<SceneViewProps> = ({ 
  events, selectedEventId, onSelectEvent, onChangeEvent, 
  characters, locations, items, onNavigate, onAddScene
}) => {
  const selectedEvent = events.find(ev => ev.id === selectedEventId);
  const backgroundEvents = events.filter(e => e.type === 'background' && !e.isInterventionPoint);
  const scenarioEvents = events.filter(e => (e.type === 'scenario' || !e.type) && !e.isInterventionPoint);
  const endingEvents = events.filter(e => e.type === 'ending');

  const handleImageUpload = (file: File) => {
    if (!selectedEvent) return;
    const reader = new FileReader();
    reader.onloadend = () => {
        onChangeEvent(selectedEvent.id, { imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const toggleLink = (type: 'character' | 'location' | 'item', id: string) => {
    if (!selectedEvent) return;
    const field = type === 'character' ? 'linkedCharacterIds' : type === 'location' ? 'linkedLocationIds' : 'linkedItemIds';
    // @ts-ignore
    const currentList = selectedEvent[field] || [];
    const newList = currentList.includes(id) 
        ? currentList.filter((existId: string) => existId !== id)
        : [...currentList, id];
    onChangeEvent(selectedEvent.id, { [field]: newList });
  };

  const renderAssetLinks = (event: TimelineEvent) => (
      <div className="bg-charcoal/5 p-4 border border-ink/20 mt-4">
          <label className="text-xs font-mono uppercase text-gray-500 block mb-2 font-bold flex items-center gap-2">
              <LinkIcon className="w-3 h-3" /> 关联档案 (Related Assets)
          </label>
          <div className="space-y-3">
              <div>
                  <span className="text-[10px] uppercase text-gray-400">Characters:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                      {characters.map(char => (
                          <button key={char.id} onClick={() => toggleLink('character', char.id)} className={`px-2 py-1 text-xs border rounded-sm transition-colors ${event.linkedCharacterIds?.includes(char.id) ? 'bg-ink text-gold border-ink' : 'bg-white text-gray-500 border-gray-300 hover:border-ink'}`}>{char.name}</button>
                      ))}
                  </div>
              </div>
               <div>
                  <span className="text-[10px] uppercase text-gray-400">Locations:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                      {locations.map(loc => (
                          <button key={loc.id} onClick={() => toggleLink('location', loc.id)} className={`px-2 py-1 text-xs border rounded-sm transition-colors ${event.linkedLocationIds?.includes(loc.id) ? 'bg-ink text-gold border-ink' : 'bg-white text-gray-500 border-gray-300 hover:border-ink'}`}>{loc.name}</button>
                      ))}
                  </div>
              </div>
               <div>
                  <span className="text-[10px] uppercase text-gray-400">Items:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                      {items.map(item => (
                          <button key={item.id} onClick={() => toggleLink('item', item.id)} className={`px-2 py-1 text-xs border rounded-sm transition-colors ${event.linkedItemIds?.includes(item.id) ? 'bg-blood text-white border-blood' : 'bg-white text-gray-500 border-gray-300 hover:border-blood'}`}>{item.name}</button>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderActiveLinks = (event: TimelineEvent) => {
      const activeChars = characters.filter(c => event.linkedCharacterIds?.includes(c.id));
      const activeLocs = locations.filter(l => event.linkedLocationIds?.includes(l.id));
      const activeItems = items.filter(i => event.linkedItemIds?.includes(i.id));

      if (activeChars.length === 0 && activeLocs.length === 0 && activeItems.length === 0) return null;

      return (
          <div className="flex flex-wrap gap-2 mb-4">
              {activeChars.map(c => <span key={c.id} onClick={() => onNavigate('character', c.id)} className="cursor-pointer bg-ink text-gold px-2 py-1 text-xs font-bold uppercase hover:bg-gold hover:text-ink">User: {c.name}</span>)}
              {activeLocs.map(l => <span key={l.id} onClick={() => onNavigate('location', l.id)} className="cursor-pointer bg-charcoal text-white px-2 py-1 text-xs font-bold uppercase hover:bg-gray-600">Loc: {l.name}</span>)}
              {activeItems.map(i => <span key={i.id} onClick={() => onNavigate('item', i.id)} className="cursor-pointer bg-blood text-white px-2 py-1 text-xs font-bold uppercase hover:bg-red-700">Item: {i.name}</span>)}
          </div>
      );
  };

  const addSkillCheck = (event: TimelineEvent) => {
      const newCheck: SkillCheck = { skill: "侦查", difficulty: "Regular", success: "", failure: "" };
      onChangeEvent(event.id, { skillChecks: [...(event.skillChecks || []), newCheck] });
  };

  const updateSkillCheck = (event: TimelineEvent, index: number, updates: Partial<SkillCheck>) => {
      const newChecks = [...(event.skillChecks || [])];
      newChecks[index] = { ...newChecks[index], ...updates };
      onChangeEvent(event.id, { skillChecks: newChecks });
  };

  const deleteSkillCheck = (event: TimelineEvent, index: number) => {
      const newChecks = [...(event.skillChecks || [])];
      newChecks.splice(index, 1);
      onChangeEvent(event.id, { skillChecks: newChecks });
  };

  const renderSkillChecks = (event: TimelineEvent) => (
      <div className="bg-white border-2 border-charcoal/20 p-4 mt-6">
           <div className="flex justify-between items-center mb-4">
                <label className="flex items-center gap-2 font-display text-sm uppercase text-ink">
                    <Dices className="w-4 h-4" /> 调查员技能检定 (Skill Checks)
                </label>
                <button onClick={() => addSkillCheck(event)} className="text-xs uppercase font-bold border border-ink px-2 py-1 hover:bg-ink hover:text-gold transition-colors">+ 添加检定</button>
           </div>
           
           <div className="space-y-4">
               {event.skillChecks?.map((check, idx) => (
                   <div key={idx} className="bg-gray-50 p-4 border border-gray-200 relative">
                       <button onClick={() => deleteSkillCheck(event, idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                       <div className="flex gap-4 mb-2">
                           <input 
                                value={check.skill}
                                onChange={(e) => updateSkillCheck(event, idx, { skill: e.target.value })}
                                className="font-bold font-mono text-sm bg-transparent border-b border-gray-300 w-32" 
                                placeholder="技能名"
                            />
                            <select 
                                value={check.difficulty}
                                onChange={(e) => updateSkillCheck(event, idx, { difficulty: e.target.value as any })}
                                className="text-xs bg-transparent border border-gray-300 p-1"
                            >
                                <option value="Regular">普通成功</option>
                                <option value="Hard">困难成功</option>
                                <option value="Extreme">极难成功</option>
                            </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <textarea 
                                value={check.success}
                                onChange={(e) => updateSkillCheck(event, idx, { success: e.target.value })}
                                className="w-full h-16 text-xs bg-green-50/50 border border-green-100 p-2 resize-none placeholder-green-800/30"
                                placeholder="成功结果..."
                           />
                           <textarea 
                                value={check.failure}
                                onChange={(e) => updateSkillCheck(event, idx, { failure: e.target.value })}
                                className="w-full h-16 text-xs bg-red-50/50 border border-red-100 p-2 resize-none placeholder-red-800/30"
                                placeholder="失败结果..."
                           />
                       </div>
                   </div>
               ))}
               {(!event.skillChecks || event.skillChecks.length === 0) && (
                   <div className="text-center text-xs text-gray-400 italic">暂无检定要求</div>
               )}
           </div>
      </div>
  );

  const renderBackgroundLayout = (event: TimelineEvent) => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-[#f0f0e0] p-8 border border-gray-400 shadow-md relative rotate-0">
            <div className="absolute top-4 right-4 border-2 border-blood text-blood font-display text-xl px-2 py-1 opacity-70 rotate-12">CONFIDENTIAL</div>
            <h2 className="font-display text-3xl text-ink uppercase tracking-widest border-b-2 border-ink pb-2 mb-6">事件调查简报 (Briefing)</h2>
            <div className="mb-6 w-full h-48 bg-gray-200 border-2 border-dashed border-gray-400 relative group overflow-hidden flex items-center justify-center">
                 {event.imageUrl ? (
                     <img src={event.imageUrl} alt="Briefing Evidence" className="w-full h-full object-cover grayscale contrast-125" />
                 ) : (
                     <div className="text-gray-400 flex flex-col items-center"><Upload className="w-6 h-6 mb-2" /><span className="text-xs uppercase font-mono">Upload Photographic Evidence</span></div>
                 )}
                 <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer"/>
            </div>
            {renderActiveLinks(event)}
            <div className="grid grid-cols-2 gap-8 mb-6">
                 <div><label className="text-xs font-mono uppercase text-gray-500 block mb-1">时间与地点</label><input value={event.eventLocation || ''} onChange={(e) => onChangeEvent(event.id, { eventLocation: e.target.value })} className="w-full bg-white border border-gray-300 p-2 font-serif text-ink shadow-inner" placeholder="发生地点..."/></div>
                 <div><label className="text-xs font-mono uppercase text-gray-500 block mb-1">涉及人物</label><input value={event.eventPeople || ''} onChange={(e) => onChangeEvent(event.id, { eventPeople: e.target.value })} className="w-full bg-white border border-gray-300 p-2 font-serif text-ink shadow-inner" placeholder="关键NPC..."/></div>
            </div>
            <div className="mb-6"><label className="text-xs font-mono uppercase text-gray-500 block mb-1">事件概述</label><textarea value={event.content || ''} onChange={(e) => onChangeEvent(event.id, { content: e.target.value })} className="w-full h-32 bg-white border border-gray-300 p-2 font-serif text-ink shadow-inner resize-none leading-relaxed"/></div>
            <div className="mb-6"><label className="flex items-center gap-2 text-xs font-bold font-mono text-blood uppercase mb-1"><AlertTriangle className="w-3 h-3" /> 获取条件</label><textarea value={event.prerequisites || ''} onChange={(e) => onChangeEvent(event.id, { prerequisites: e.target.value })} className="w-full bg-blood/5 border-l-2 border-blood outline-none font-serif text-sm text-ink resize-none h-12 p-2" placeholder="调查员需要做什么才能发现..."/></div>
            <div className="mb-6 p-4 bg-white border-l-4 border-gold"><label className="text-xs font-mono uppercase text-gold block mb-1 font-bold">事件结果</label><textarea value={event.eventResults || ''} onChange={(e) => onChangeEvent(event.id, { eventResults: e.target.value })} className="w-full h-24 bg-transparent border-none outline-none font-serif text-ink resize-none" placeholder="直接结果与间接影响..."/></div>
            <div className="p-4 bg-charcoal/5 border border-dashed border-charcoal/30"><label className="flex items-center gap-2 text-xs font-mono uppercase text-ink block mb-2 font-bold"><Search className="w-3 h-3" /> 可获得线索</label><textarea value={event.obtainableClues || ''} onChange={(e) => onChangeEvent(event.id, { obtainableClues: e.target.value })} className="w-full h-20 bg-transparent border-none outline-none font-serif text-ink resize-none italic" placeholder="关联的物品、档案或传闻..."/></div>
            {renderAssetLinks(event)}
        </div>
    </div>
  );

  const renderScenarioLayout = (event: TimelineEvent) => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
         <div className="border-b-2 border-ink pb-4">
            <input type="text" value={event.title} onChange={(e) => onChangeEvent(event.id, { title: e.target.value })} className="font-display text-3xl text-ink uppercase tracking-widest bg-transparent border-none outline-none w-full placeholder-gray-300" placeholder="场景标题"/>
            <div className="flex gap-4 mt-2"><span className="bg-ink text-gold px-2 py-0.5 text-[10px] font-mono uppercase">SCENARIO EVENT</span><input type="text" value={event.date} onChange={(e) => onChangeEvent(event.id, { date: e.target.value })} className="font-mono text-sm text-gray-500 bg-transparent border-none outline-none placeholder-gray-300" placeholder="时间/日期"/></div>
        </div>
        {renderActiveLinks(event)}
        <div className="bg-blood/5 border-l-4 border-blood p-4"><label className="flex items-center gap-2 text-xs font-bold font-mono text-blood uppercase mb-1"><AlertTriangle className="w-3 h-3" /> 剧情前置条件</label><textarea value={event.prerequisites || ''} onChange={(e) => onChangeEvent(event.id, { prerequisites: e.target.value })} className="w-full bg-transparent outline-none font-serif text-sm text-ink resize-none h-12" placeholder="触发此场景所需的条件..."/></div>
        <div className="bg-white border border-gray-300 p-6 shadow-sm relative"><div className="absolute -top-3 left-4 bg-white px-2 text-xs font-display uppercase tracking-widest text-gray-400 border border-gray-200">宣读文本 (Read Aloud)</div><textarea value={event.readAloud || ""} onChange={(e) => onChangeEvent(event.id, { readAloud: e.target.value })} className="w-full h-24 bg-transparent border-none outline-none font-serif text-lg italic text-ink leading-relaxed resize-none" placeholder="环境描写..."/></div>
        <div className="space-y-2"><label className="flex items-center gap-2 font-display text-lg uppercase text-ink"><FileText className="w-4 h-4" /> 剧本详情</label><div className="bg-white min-h-[300px] p-6 shadow-sm border border-gray-200 relative"><textarea value={event.sceneDetails || ""} onChange={(e) => onChangeEvent(event.id, { sceneDetails: e.target.value })} className="w-full h-full min-h-[300px] bg-transparent border-none outline-none font-serif text-base text-gray-800 leading-relaxed resize-none" placeholder="详细的事件流程..."/></div></div>
        
        {renderSkillChecks(event)}

        <div className="bg-charcoal/5 p-4 border border-dashed border-charcoal/30"><label className="flex items-center gap-2 text-xs font-mono uppercase text-ink block mb-2 font-bold"><Briefcase className="w-3 h-3" /> 关键道具与线索</label><div className="flex flex-wrap gap-2">{items.filter(i => event.linkedItemIds?.includes(i.id)).map(item => (<div key={item.id} className="bg-white border border-gray-300 p-2 flex items-center gap-2 shadow-sm"><span className="text-sm font-serif font-bold text-blood">{item.name}</span><span className="text-[10px] text-gray-500 uppercase">{item.type}</span></div>))}{(!event.linkedItemIds || event.linkedItemIds.length === 0) && (<span className="text-xs text-gray-400 italic">暂无关联物品 (请下方关联)</span>)}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-4 border border-gray-200"><label className="flex items-center gap-2 font-display text-xs uppercase text-ink mb-2"><List className="w-3 h-3" /> 剧情流程</label><textarea value={event.sceneFlow || ""} onChange={(e) => onChangeEvent(event.id, { sceneFlow: e.target.value })} className="w-full h-24 bg-transparent border-none outline-none font-mono text-xs text-ink resize-none" placeholder="1. ... 2. ... 3. ..."/></div><div className="bg-white p-4 border border-gray-200"><label className="flex items-center gap-2 font-display text-xs uppercase text-ink mb-2"><Target className="w-3 h-3" /> 剧情目的</label><textarea value={event.sceneObjective || ""} onChange={(e) => onChangeEvent(event.id, { sceneObjective: e.target.value })} className="w-full h-24 bg-transparent border-none outline-none font-serif text-sm text-ink resize-none" placeholder="本场景旨在揭示..."/></div></div>
        {renderAssetLinks(event)}
    </div>
  );

  const renderEndingLayout = (event: TimelineEvent) => (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pt-10">
           <div className="border-4 border-blood p-8 bg-paper relative shadow-2xl">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-blood text-white px-6 py-2 font-display text-xl uppercase tracking-widest">
                    ENDING BRANCH
                </div>
                
                <div className="mt-6 text-center">
                    <input 
                        value={event.title}
                        onChange={(e) => onChangeEvent(event.id, { title: e.target.value })}
                        className="text-center font-display text-4xl text-ink bg-transparent outline-none w-full border-b border-transparent focus:border-blood mb-4"
                        placeholder="结局名称"
                    />
                    <div className="flex justify-center gap-4">
                        <span className="font-mono text-xs text-gray-400 uppercase">CONDITION & OUTCOME</span>
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="bg-gray-100 p-4 border-l-4 border-charcoal">
                        <label className="font-bold font-mono text-xs uppercase text-charcoal block mb-2">结局前置条件 (Prerequisite Condition)</label>
                        <textarea 
                             value={event.endingCondition || ''}
                             onChange={(e) => onChangeEvent(event.id, { endingCondition: e.target.value })}
                             className="w-full h-20 bg-transparent outline-none font-serif text-ink resize-none"
                             placeholder="例如：调查员未能阻止仪式，或者 SAN 值归零..."
                        />
                    </div>

                    <div>
                        <label className="font-bold font-display text-lg uppercase text-ink block mb-4 text-center">--- 具体结局说明 (Ending Description) ---</label>
                        <textarea 
                             value={event.endingDescription || ''}
                             onChange={(e) => onChangeEvent(event.id, { endingDescription: e.target.value })}
                             className="w-full h-64 bg-white border border-gray-200 p-6 font-serif text-lg leading-relaxed text-ink resize-none shadow-inner outline-none focus:border-gold text-justify"
                             placeholder="描述调查员面临的最终命运..."
                        />
                    </div>
                </div>
           </div>
           {renderAssetLinks(event)}
      </div>
  );

  return (
    <div className="flex h-full pb-32">
      <div className="w-64 border-r border-gray-300 bg-paper/50 overflow-y-auto flex flex-col shrink-0 pb-16">
        {backgroundEvents.length > 0 && (
            <div>
                <div className="p-3 bg-charcoal/10 border-y border-charcoal/20 font-display text-[10px] uppercase tracking-widest text-ink/70">Background Briefings</div>
                <ul>{backgroundEvents.map(ev => (<li key={ev.id}><button onClick={() => onSelectEvent(ev.id)} className={`w-full text-left p-3 border-b border-gray-200 hover:bg-white transition-colors ${selectedEventId === ev.id ? 'bg-white border-l-4 border-l-charcoal' : 'text-gray-500'}`}><div className="text-[10px] font-mono text-gray-400">{ev.date}</div><div className="font-serif text-sm truncate">{ev.title || "背景事件"}</div></button></li>))}</ul>
            </div>
        )}
        <div>
            <div className="p-3 bg-gold/10 border-y border-gold/20 font-display text-[10px] uppercase tracking-widest text-gold mt-4">Scenario Script</div>
            <ul>{scenarioEvents.map(ev => (<li key={ev.id}><button onClick={() => onSelectEvent(ev.id)} className={`w-full text-left p-3 border-b border-gray-200 hover:bg-white transition-colors ${selectedEventId === ev.id ? 'bg-white border-l-4 border-l-blood' : 'text-gray-500'}`}><div className="text-[10px] font-mono text-gray-400">{ev.date}</div><div className="font-serif text-sm truncate">{ev.title || "场景"}</div></button></li>))}</ul>
        </div>
        {endingEvents.length > 0 && (
            <div>
                <div className="p-3 bg-blood/10 border-y border-blood/20 font-display text-[10px] uppercase tracking-widest text-blood mt-4">Endings</div>
                <ul>{endingEvents.map(ev => (<li key={ev.id}><button onClick={() => onSelectEvent(ev.id)} className={`w-full text-left p-3 border-b border-gray-200 hover:bg-white transition-colors ${selectedEventId === ev.id ? 'bg-white border-l-4 border-l-blood' : 'text-gray-500'}`}><div className="text-[10px] font-mono text-gray-400 uppercase">Ending</div><div className="font-serif text-sm truncate font-bold text-blood">{ev.title || "结局"}</div></button></li>))}</ul>
            </div>
        )}
        <div className="p-4 mt-auto border-t border-gray-300 flex flex-col gap-2">
            <button onClick={() => onAddScene('background')} className="w-full py-2 border border-charcoal text-xs font-mono uppercase hover:bg-charcoal hover:text-white transition-colors flex items-center justify-center gap-2"><Plus className="w-3 h-3" /> New Briefing</button>
            <button onClick={() => onAddScene('scenario')} className="w-full py-2 border border-gold text-ink text-xs font-mono uppercase hover:bg-gold hover:text-white transition-colors flex items-center justify-center gap-2"><Plus className="w-3 h-3" /> New Script</button>
            <button onClick={() => onAddScene('ending')} className="w-full py-2 border border-blood text-blood text-xs font-mono uppercase hover:bg-blood hover:text-white transition-colors flex items-center justify-center gap-2"><GitBranch className="w-3 h-3" /> New Ending</button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-[#f4f1ea]">
        {selectedEvent ? (
            selectedEvent.type === 'ending' ? renderEndingLayout(selectedEvent) :
            selectedEvent.type === 'background' ? renderBackgroundLayout(selectedEvent) : renderScenarioLayout(selectedEvent)
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 select-none">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-display text-2xl mb-4">选择事件以编辑详情</p>
                <p className="font-serif italic text-sm text-center">背景事件 | 剧本详情 | 结局分支</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SceneView;

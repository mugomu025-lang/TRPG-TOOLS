
import React, { useState } from 'react';
import { Character } from '../types';
import { Trash2, Plus, User, RefreshCw, Upload, Crosshair, BookOpen, Heart, Activity, Eye, EyeOff, X } from 'lucide-react';

interface CharacterViewProps {
  characters: Character[];
  onChange: (chars: Character[]) => void;
  onAutoGenerate: () => void;
}

const CharacterView: React.FC<CharacterViewProps> = ({ characters, onChange, onAutoGenerate }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  const handleUpdate = (id: string, updates: Partial<Character>) => {
    onChange(characters.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(characters.filter(c => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleSecret = (id: string) => {
    setRevealedSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addNew = () => {
    const newChar: Character = {
      id: Date.now().toString(),
      name: "新角色",
      age: "Unknown",
      occupation: "Unknown",
      description: "",
      personality: "",
      belief: "",
      backstory: "",
      goal: "",
      actionStyle: "",
      skills: "",
      secret: ""
    };
    onChange([...characters, newChar]);
    setExpandedId(newChar.id);
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        handleUpdate(id, { imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const activeChar = characters.find(c => c.id === expandedId);

  return (
    <div className="p-8 max-w-[90rem] mx-auto pb-32 relative min-h-full">
       <div className="border-b-2 border-ink pb-4 mb-8 flex justify-between items-end">
        <h2 className="font-display text-4xl text-ink uppercase tracking-widest">人物档案 (Dramatis Personae)</h2>
        <div className="flex gap-2">
            <button onClick={onAutoGenerate} className="flex items-center gap-2 bg-ink text-gold px-3 py-1 font-mono text-sm uppercase hover:bg-blood transition-colors">
                <RefreshCw className="w-4 h-4" /> 自动生成全员
            </button>
            <button onClick={addNew} className="flex items-center gap-2 text-ink hover:text-blood font-mono text-sm uppercase border border-ink px-3 py-1 hover:bg-ink hover:text-gold transition-colors">
                <Plus className="w-4 h-4" /> 添加角色
            </button>
        </div>
      </div>

      {/* Grid View (Thumbnails) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {characters.map(char => (
              <div 
                key={char.id} 
                onClick={() => setExpandedId(char.id)}
                className="group relative bg-[#f4f1ea] shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer border border-gray-300"
              >
                  {/* Folder Tab Look */}
                  <div className="absolute -top-3 left-0 w-24 h-4 bg-[#e8e4d9] border border-b-0 border-gray-300 rounded-t-md"></div>
                  
                  {/* Content */}
                  <div className="p-4 flex flex-col items-center gap-3">
                      <div className="w-24 h-32 bg-gray-200 border border-gray-300 shadow-inner overflow-hidden relative">
                           {char.imageUrl ? (
                                <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover sepia" />
                           ) : (
                                <User className="w-full h-full p-6 text-gray-300" />
                           )}
                           {/* Paperclip graphic via css or svg could go here */}
                           <div className="absolute -top-2 right-4 w-4 h-8 border-2 border-gray-400 rounded-full rotate-12 z-10"></div>
                      </div>
                      
                      <div className="text-center w-full">
                          <h3 className="font-display text-lg text-ink truncate border-b border-gray-300 pb-1 mb-1">{char.name}</h3>
                          <p className="font-mono text-[10px] text-gray-500 uppercase">{char.occupation || "未知职业"}</p>
                      </div>

                      <button 
                        onClick={(e) => handleDelete(char.id, e)}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          ))}
          {characters.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 font-serif italic">
                档案柜为空。
            </div>
          )}
      </div>

      {/* Expanded Modal / Overlay View */}
      {activeChar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setExpandedId(null)}>
              <div 
                className="bg-[#fcfbf9] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-ink p-8 relative flex flex-col md:flex-row gap-8"
                onClick={(e) => e.stopPropagation()}
              >
                  <button 
                    onClick={() => setExpandedId(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-ink"
                  >
                      <X className="w-8 h-8" />
                  </button>

                  {/* Left Column: Photo & Basic Info */}
                  <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-6">
                      <div className="aspect-[3/4] bg-charcoal/10 border-4 border-white shadow-lg rotate-[-2deg] relative group cursor-pointer overflow-hidden">
                          {activeChar.imageUrl ? (
                              <img src={activeChar.imageUrl} alt={activeChar.name} className="w-full h-full object-cover" />
                          ) : (
                              <div className="flex items-center justify-center h-full text-charcoal/30">
                                  <User className="w-24 h-24" />
                              </div>
                          )}
                          <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => e.target.files && handleImageUpload(activeChar.id, e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                           />
                           <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 uppercase tracking-widest text-xs pointer-events-none">
                               Change Photo
                           </div>
                      </div>

                      <div className="space-y-4 bg-white p-4 border border-gray-200 shadow-sm">
                          <div>
                            <label className="text-[10px] font-mono uppercase text-gray-400">Name</label>
                            <input 
                                value={activeChar.name}
                                onChange={(e) => handleUpdate(activeChar.id, { name: e.target.value })}
                                className="w-full font-display text-2xl text-ink bg-transparent border-b border-gray-300 outline-none"
                            />
                          </div>
                          <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="text-[10px] font-mono uppercase text-gray-400">Age</label>
                                <input 
                                    value={activeChar.age}
                                    onChange={(e) => handleUpdate(activeChar.id, { age: e.target.value })}
                                    className="w-full font-mono text-sm text-ink bg-transparent border-b border-gray-300 outline-none"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] font-mono uppercase text-gray-400">Occupation</label>
                                <input 
                                    value={activeChar.occupation}
                                    onChange={(e) => handleUpdate(activeChar.id, { occupation: e.target.value })}
                                    className="w-full font-mono text-sm text-ink bg-transparent border-b border-gray-300 outline-none"
                                />
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Detailed Text */}
                  <div className="flex-1 space-y-6">
                      <h2 className="font-display text-3xl text-ink uppercase tracking-widest border-b border-ink pb-2">Confidential File</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                               <label className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-blood"><Activity className="w-3 h-3" /> Appearance & Personality</label>
                               <textarea 
                                    value={activeChar.description + (activeChar.personality ? '\n' + activeChar.personality : '')}
                                    onChange={(e) => handleUpdate(activeChar.id, { description: e.target.value })}
                                    className="w-full h-32 bg-paper p-3 font-serif text-sm text-ink border border-gray-300 shadow-inner resize-none outline-none"
                                    placeholder="描述..."
                               />
                          </div>
                          <div className="space-y-1">
                               <label className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-blood"><Heart className="w-3 h-3" /> Core Belief & Goal</label>
                               <textarea 
                                    value={activeChar.belief + (activeChar.goal ? '\n' + activeChar.goal : '')}
                                    onChange={(e) => handleUpdate(activeChar.id, { belief: e.target.value })}
                                    className="w-full h-32 bg-paper p-3 font-serif text-sm text-ink border border-gray-300 shadow-inner resize-none outline-none"
                                    placeholder="描述..."
                               />
                          </div>
                      </div>

                      <div className="space-y-1">
                           <label className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-blood"><BookOpen className="w-3 h-3" /> Backstory</label>
                           <textarea 
                                value={activeChar.backstory}
                                onChange={(e) => handleUpdate(activeChar.id, { backstory: e.target.value })}
                                className="w-full h-24 bg-paper p-3 font-serif text-sm text-ink border border-gray-300 shadow-inner resize-none outline-none"
                                placeholder="背景故事..."
                           />
                      </div>

                      <div className="space-y-1">
                           <label className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-blood"><Crosshair className="w-3 h-3" /> Skills & Style</label>
                           <textarea 
                                value={activeChar.skills + (activeChar.actionStyle ? '\n' + activeChar.actionStyle : '')}
                                onChange={(e) => handleUpdate(activeChar.id, { skills: e.target.value })}
                                className="w-full h-24 bg-paper p-3 font-serif text-sm text-ink border border-gray-300 shadow-inner resize-none outline-none"
                                placeholder="技能与风格..."
                           />
                      </div>

                      {/* Secret */}
                      <div className={`border-2 border-dashed p-4 transition-colors ${revealedSecrets[activeChar.id] ? 'border-blood bg-blood/5' : 'border-gray-300 bg-gray-50'}`}>
                          <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => toggleSecret(activeChar.id)}>
                                <span className="font-display text-sm uppercase tracking-widest text-ink font-bold">Keeper's Secret</span>
                                {revealedSecrets[activeChar.id] ? <EyeOff className="w-4 h-4 text-blood" /> : <Eye className="w-4 h-4 text-gray-400" />}
                          </div>
                          {revealedSecrets[activeChar.id] && (
                              <textarea 
                                    value={activeChar.secret}
                                    onChange={(e) => handleUpdate(activeChar.id, { secret: e.target.value })}
                                    className="w-full h-20 bg-transparent text-sm font-mono text-blood outline-none resize-none"
                                    placeholder="秘密..."
                              />
                          )}
                      </div>
                  </div>

              </div>
          </div>
      )}
    </div>
  );
};

export default CharacterView;

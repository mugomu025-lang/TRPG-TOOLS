
import React from 'react';
import { TimelineEvent } from '../types';
import { Trash2, Plus, RefreshCw, AlertCircle, FileText, Play, GitBranch } from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
  onChange: (events: TimelineEvent[]) => void;
  onSelectEvent: (event: TimelineEvent) => void;
  onAutoGenerate: () => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ events, onChange, onSelectEvent, onAutoGenerate }) => {
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(events.filter(ev => ev.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<TimelineEvent>) => {
    onChange(events.map(ev => ev.id === id ? { ...ev, ...updates } : ev));
  };
  
  const endings = events.filter(e => e.type === 'ending');
  const mainEvents = events.filter(e => e.type !== 'ending');

  return (
    <div className="h-full flex flex-col p-8 pb-32">
      <div className="flex justify-between items-end border-b-2 border-ink pb-4 mb-4 shrink-0">
        <div>
            <h2 className="font-display text-4xl text-ink uppercase tracking-widest">时间轴 (Chronology)</h2>
            <p className="font-mono text-xs text-gray-500 mt-1">
                背景阴谋 -> 调查行动 -> 多重结局
            </p>
        </div>
        <button 
            onClick={onAutoGenerate}
            className="flex items-center gap-2 bg-ink text-gold px-4 py-2 font-display text-xs uppercase tracking-widest hover:bg-blood transition-colors"
        >
            <RefreshCw className="w-4 h-4" />
            自动推演时间线
        </button>
      </div>

      {/* Main Timeline Stream */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar-prominent border-t border-b border-ink/10 bg-paper/50 flex flex-col">
         {/* The Infinite Line */}
         <div className="absolute top-1/2 left-0 right-0 h-1 bg-ink/20 transform -translate-y-1/2 min-w-[200vw] z-0"></div>

         <div className="h-full flex items-center space-x-0 px-8 min-w-max pt-10 pb-10">
            {/* Start Marker */}
            <div className="flex flex-col items-center justify-center opacity-30 mr-12 relative z-10">
                <span className="font-mono text-[10px] text-ink uppercase tracking-widest mb-2">Start</span>
                <div className="w-3 h-3 bg-ink rounded-full"></div>
            </div>

            {mainEvents.map((event, index) => {
                const isBackground = event.type === 'background';
                const isIntervention = event.isInterventionPoint;

                if (isIntervention) {
                    return (
                        <div key={event.id} className="relative mx-8 flex flex-col items-center justify-center h-full z-10">
                             <div className="absolute top-0 bottom-0 w-1 bg-blood border-x border-blood border-dashed opacity-50"></div>
                             <div className="bg-blood text-white p-2 rounded-full shadow-lg border-4 border-paper z-20 animate-pulse">
                                 <AlertCircle className="w-8 h-8" />
                             </div>
                             <div className="bg-blood text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 mt-4 rounded z-20">
                                 调查员介入点
                             </div>
                             <div className="absolute bottom-20 text-center w-40">
                                 <input
                                    value={event.title}
                                    onChange={(e) => handleUpdate(event.id, { title: e.target.value })}
                                    className="text-center bg-transparent text-blood font-display uppercase tracking-widest outline-none"
                                 />
                             </div>
                        </div>
                    );
                }

                return (
                    <div key={event.id} className="relative w-64 shrink-0 px-4 group">
                        <div className={`absolute left-1/2 transform -translate-x-1/2 w-0.5 h-1/2 top-1/2 ${index % 2 === 0 ? 'origin-top rotate-0' : 'origin-bottom rotate-180 -translate-y-full'} bg-ink/20 z-0`}></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-paper border-2 border-ink rounded-full z-10 group-hover:bg-gold transition-colors"></div>

                        <div 
                            className={`
                                relative flex flex-col p-4 border-l-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl w-full
                                ${index % 2 === 0 ? 'mb-12 translate-y-[-20%]' : 'mt-12 translate-y-[20%]'}
                                ${isBackground 
                                    ? 'bg-[#e8e4d9] border-charcoal/50 text-ink/80 rotate-1 grayscale-[0.3]' 
                                    : 'bg-white border-gold text-ink -rotate-1'
                                }
                            `}
                            onClick={() => onSelectEvent(event)}
                        >
                             <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                                    {isBackground ? 'BACKGROUND' : 'SCENARIO'}
                                </span>
                                <button onClick={(e) => handleDelete(event.id, e)} className="text-gray-400 hover:text-red-600">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                             </div>

                             <input
                                type="text"
                                value={event.date}
                                onChange={(e) => handleUpdate(event.id, { date: e.target.value })}
                                className="font-mono text-xs font-bold text-blood bg-transparent outline-none border-b border-transparent focus:border-blood w-full mb-1"
                                placeholder="时间/日期"
                            />

                             <input
                                type="text"
                                value={event.title}
                                onChange={(e) => handleUpdate(event.id, { title: e.target.value })}
                                className="font-display text-lg text-ink bg-transparent outline-none border-b border-transparent focus:border-ink w-full mb-2 leading-tight"
                                placeholder="事件名称"
                            />

                             <textarea
                                value={event.content}
                                onChange={(e) => handleUpdate(event.id, { content: e.target.value })}
                                className="w-full h-20 bg-transparent resize-none text-xs font-serif text-ink/70 outline-none"
                                placeholder="事件简述..."
                            />

                            <div className="mt-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">
                                    {isBackground ? '点击查看档案线索' : '点击编辑剧本详情'}
                                </span>
                                {isBackground ? <FileText className="w-4 h-4 text-charcoal" /> : <Play className="w-4 h-4 text-gold" />}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Add Button */}
            <div className="pl-12">
                 <button 
                    onClick={() => onChange([...events, { id: Date.now().toString(), date: '新日期', title: '新事件', content: '', type: 'scenario' }])}
                    className="w-12 h-12 rounded-full border-2 border-dashed border-charcoal/40 flex items-center justify-center text-charcoal/40 hover:text-ink hover:border-ink transition-colors bg-white/50"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>
         </div>
      </div>

      {/* Endings Branch Section */}
      <div className="h-48 border-t-2 border-ink border-dashed p-4 overflow-x-auto bg-charcoal/5">
         <div className="flex gap-4 items-center h-full min-w-max">
             <div className="flex flex-col items-center justify-center px-8 border-r border-ink/20 mr-4">
                 <GitBranch className="w-8 h-8 text-blood mb-2" />
                 <span className="font-display uppercase tracking-widest text-ink font-bold">结局分支 (Endings)</span>
             </div>

             {endings.map(ending => (
                 <div 
                    key={ending.id} 
                    className="w-64 bg-paper border border-blood p-4 relative shadow-sm hover:shadow-md cursor-pointer group"
                    onClick={() => onSelectEvent(ending)}
                 >
                     <div className="absolute top-0 left-0 bg-blood text-white text-[9px] px-2 py-0.5 uppercase tracking-widest font-bold">ENDING</div>
                     <button onClick={(e) => handleDelete(ending.id, e)} className="absolute top-1 right-1 text-gray-300 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                     
                     <div className="mt-4">
                        <input
                            value={ending.title}
                            onChange={(e) => handleUpdate(ending.id, { title: e.target.value })}
                            className="font-display text-lg text-ink bg-transparent w-full outline-none mb-1"
                            placeholder="结局名称 (如: 全员生还)"
                        />
                        <textarea
                             value={ending.endingCondition || ''}
                             onChange={(e) => handleUpdate(ending.id, { endingCondition: e.target.value })}
                             className="w-full h-16 text-xs font-mono text-gray-600 bg-transparent resize-none outline-none"
                             placeholder="达成条件..."
                        />
                     </div>
                 </div>
             ))}

            <button 
                onClick={() => onChange([...events, { id: Date.now().toString(), date: '最终', title: '新结局', content: '', type: 'ending', endingCondition: '', endingDescription: '' }])}
                className="w-16 h-full border-2 border-dashed border-blood/30 flex flex-col items-center justify-center text-blood/50 hover:bg-blood/5 hover:text-blood transition-colors"
            >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-[9px] uppercase font-bold">Add Ending</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default TimelineView;

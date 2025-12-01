
import React, { useRef } from 'react';
import { ScenarioData } from '../types';
import { Printer } from 'lucide-react';

interface PreviewViewProps {
  scenario: ScenarioData;
}

const PreviewView: React.FC<PreviewViewProps> = ({ scenario }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const { outline, timeline, characters, locations, items } = scenario;
  const endings = timeline.filter(t => t.type === 'ending');
  const storyEvents = timeline.filter(t => t.type !== 'ending');

  return (
    <div className="h-full flex flex-col bg-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 bg-ink text-gold flex justify-between items-center shadow-md no-print shrink-0">
            <h2 className="font-display uppercase tracking-widest">模组预览 (Scenario Preview)</h2>
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gold text-ink px-4 py-2 font-bold uppercase text-xs hover:bg-white transition-colors"
            >
                <Printer className="w-4 h-4" /> 导出 PDF / 打印
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div 
                ref={contentRef} 
                className="max-w-4xl mx-auto bg-white p-12 shadow-xl text-black font-serif print-only min-h-[1100px]"
                contentEditable
                suppressContentEditableWarning
            >
                {/* Title */}
                <div className="text-center border-b-4 border-black pb-8 mb-12">
                    <h1 className="font-display text-5xl mb-4 uppercase">{outline.title || "UNTITLED SCENARIO"}</h1>
                    <p className="font-mono text-sm uppercase tracking-widest text-gray-600">A Call of Cthulhu Scenario</p>
                </div>

                {/* I. Module Background */}
                <section className="mb-12">
                    <h2 className="font-display text-2xl border-b-2 border-black mb-4 uppercase">一、模组背景 (Background)</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold uppercase text-sm mb-1 bg-gray-100 p-1 inline-block">模组简介</h3>
                            <p className="text-sm whitespace-pre-wrap">{outline.act1} {outline.act2}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold uppercase text-sm mb-1 bg-gray-100 p-1 inline-block">时代背景</h3>
                                <p className="text-sm">{outline.era || "1920s USA"}</p>
                            </div>
                            <div>
                                <h3 className="font-bold uppercase text-sm mb-1 bg-gray-100 p-1 inline-block">玩家情报</h3>
                                <p className="text-sm">{outline.playerInfo || "调查员们作为..."}</p>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-bold uppercase text-sm mb-1 bg-gray-100 p-1 inline-block">守秘人建议 (FAQ)</h3>
                             <p className="text-sm italic">{outline.faq}</p>
                        </div>
                    </div>
                </section>

                {/* II. Module Plot */}
                <section className="mb-12 break-inside-avoid">
                    <h2 className="font-display text-2xl border-b-2 border-black mb-4 uppercase">二、模组情节 (Plot)</h2>
                    <div className="space-y-6">
                         <div className="border-l-4 border-black pl-4">
                            <h3 className="font-bold uppercase text-sm mb-1">模组真相 (The Truth)</h3>
                            <p className="text-sm italic font-bold">{outline.truth}</p>
                        </div>
                        <div>
                            <h3 className="font-bold uppercase text-sm mb-2">模组剧情流程</h3>
                            <div className="space-y-4 border-l border-dashed border-gray-400 pl-4">
                                {storyEvents.map(event => (
                                    <div key={event.id} className="mb-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-mono font-bold text-xs bg-black text-white px-1">{event.date}</span>
                                            <span className="font-bold text-sm uppercase">{event.title}</span>
                                        </div>
                                        <p className="text-sm mt-1">{event.sceneDetails || event.content}</p>
                                        {event.readAloud && (
                                            <p className="text-xs italic bg-gray-50 p-2 mt-1 border-l-2 border-gray-300">"{event.readAloud}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* III. Module Endings */}
                <section className="mb-12 break-inside-avoid">
                    <h2 className="font-display text-2xl border-b-2 border-black mb-4 uppercase">三、模组结局 (Endings)</h2>
                    {endings.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {endings.map(end => (
                                <div key={end.id} className="border border-black p-4">
                                    <h3 className="font-display text-lg font-bold uppercase mb-2">{end.title}</h3>
                                    <p className="text-sm mb-2"><span className="font-bold">达成条件：</span>{end.endingCondition}</p>
                                    <p className="text-sm">{end.endingDescription}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">暂无结局分支。</p>
                    )}
                </section>

                {/* IV. Data Expansion */}
                <section className="mb-12 break-inside-avoid">
                    <h2 className="font-display text-2xl border-b-2 border-black mb-4 uppercase">四、资料拓展 (Data)</h2>
                    
                    <h3 className="font-bold uppercase text-lg mb-2 mt-4 border-b border-gray-300">人物 (Characters)</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {characters.map(char => (
                            <div key={char.id} className="text-sm border p-2">
                                <span className="font-bold block uppercase">{char.name}</span>
                                <span className="text-xs text-gray-500">{char.occupation}</span>
                                <p className="mt-1">{char.description}</p>
                            </div>
                        ))}
                    </div>

                    <h3 className="font-bold uppercase text-lg mb-2 mt-4 border-b border-gray-300">地点 (Locations)</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {locations.map(loc => (
                             <div key={loc.id} className="text-sm border p-2">
                                <span className="font-bold block uppercase">{loc.name}</span>
                                <p className="mt-1">{loc.description}</p>
                            </div>
                        ))}
                    </div>

                    <h3 className="font-bold uppercase text-lg mb-2 mt-4 border-b border-gray-300">物品 (Items)</h3>
                    <ul className="list-disc pl-5 text-sm">
                        {items.map(item => (
                            <li key={item.id} className="mb-1">
                                <span className="font-bold">{item.name}</span>: {item.description}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    </div>
  );
};

export default PreviewView;

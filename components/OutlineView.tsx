
import React from 'react';
import { ScenarioOutline, OutlineTemplate } from '../types';
import { HelpCircle } from 'lucide-react';

interface OutlineViewProps {
  data: ScenarioOutline;
  onChange: (newData: ScenarioOutline) => void;
}

const OutlineView: React.FC<OutlineViewProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof ScenarioOutline, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const templates = Object.values(OutlineTemplate);

  const getStructure = (template: OutlineTemplate) => {
    switch (template) {
        case OutlineTemplate.HEROS_JOURNEY:
            return ['第一幕：启程', '第二幕：启蒙', '第三幕：归来'];
        case OutlineTemplate.KISHOTENKETSU:
             return ['起 (Introduction)', '承 (Development)', '转 (Twist)', '合 (Conclusion)'];
        case OutlineTemplate.WHODUNIT:
             return ['案件发生', '搜查与推理', '揭露真凶'];
        case OutlineTemplate.CLASSIC_COC:
            return ['引入 (The Hook)', '调查 (The Investigation)', '恐怖 (The Horror)'];
        case OutlineTemplate.HOLLYWOOD:
            return ['第一幕', '第二幕', '第三幕'];
        case OutlineTemplate.NOIR:
            return ['委托', '背叛', '坠落'];
        case OutlineTemplate.FREEFORM:
            return ['自由创作内容'];
        default:
             return ['第一幕', '第二幕', '第三幕'];
    }
  };

  const labels = getStructure(data.template || OutlineTemplate.THREE_ACT);
  const isFreeform = data.template === OutlineTemplate.FREEFORM;
  const isFourPart = labels.length === 4;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div className="border-b-2 border-ink pb-4 mb-8 flex justify-between items-end">
        <h2 className="font-display text-4xl text-ink uppercase tracking-widest">模组档案 (Dossier)</h2>
        <span className="font-mono text-blood text-sm border border-blood px-2 py-1 rotate-3">TOP SECRET</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
            <label className="font-display text-ink text-xl uppercase block">模组标题 (Title)</label>
            <input
            type="text"
            value={data.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="输入模组名称..."
            className="w-full bg-transparent border-b-2 border-gray-400 focus:border-blood font-serif text-3xl py-2 px-1 outline-none transition-colors text-ink placeholder-gray-400"
            />
        </div>
        
        <div className="space-y-2">
            <label className="font-display text-ink text-sm uppercase block text-right">结构模板 (Structure Template)</label>
            <select
                value={data.template || OutlineTemplate.THREE_ACT}
                onChange={(e) => handleChange('template', e.target.value as OutlineTemplate)}
                className="w-full bg-paper border border-gray-300 font-mono text-sm py-2 px-3 outline-none focus:border-blood text-right text-ink"
            >
                {templates.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
      </div>
      
      {/* New Era and Player Info Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-charcoal/5 p-4 border border-ink/20">
          <div>
              <label className="font-display text-ink text-xs uppercase block mb-1">时代背景 (Era)</label>
              <input 
                 value={data.era || ''}
                 onChange={(e) => handleChange('era', e.target.value)}
                 className="w-full bg-transparent border-b border-gray-300 text-sm font-serif p-1"
                 placeholder="例如：1920s 美国禁酒令时期..."
              />
          </div>
          <div>
              <label className="font-display text-ink text-xs uppercase block mb-1">玩家情报 (Investigator Info)</label>
              <input 
                 value={data.playerInfo || ''}
                 onChange={(e) => handleChange('playerInfo', e.target.value)}
                 className="w-full bg-transparent border-b border-gray-300 text-sm font-serif p-1"
                 placeholder="例如：私家侦探、记者..."
              />
          </div>
      </div>

      {isFreeform ? (
        <div className="mt-8 space-y-2 bg-white p-6 shadow-sm border border-gray-200">
            <label className="font-display text-ink text-sm uppercase block border-b border-gray-200 pb-2 mb-2">
                自由创作内容 (Scenario Content)
            </label>
            <textarea
                value={data.act1}
                onChange={(e) => handleChange('act1', e.target.value)}
                className="w-full min-h-[500px] bg-transparent border-none focus:ring-0 p-0 font-serif leading-relaxed resize-none text-base text-ink"
                placeholder="在此处自由撰写您的模组..."
            />
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${isFourPart ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mt-8`}>
            {labels.map((label, idx) => {
                const field = idx === 0 ? 'act1' : idx === 1 ? 'act2' : idx === 2 ? 'act3' : 'act4';
                // @ts-ignore
                const value = data[field];
                return (
                    <div key={idx} className="space-y-2 bg-white p-4 shadow-sm border border-gray-200 flex flex-col">
                        <label className="font-display text-ink text-sm uppercase block border-b border-gray-200 pb-2 mb-2 min-h-[3rem] flex items-end">
                            {label}
                        </label>
                        <textarea
                            value={value}
                            // @ts-ignore
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="w-full flex-1 min-h-[250px] bg-transparent border-none focus:ring-0 p-0 font-serif leading-relaxed resize-none text-sm text-ink"
                            placeholder="在此处描述情节..."
                        />
                    </div>
                );
            })}
        </div>
      )}

      {/* Truth Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
            <div className="absolute -top-3 left-4 bg-paper px-2 font-mono text-xs text-blood border border-blood">
            仅限守秘人阅读 (KEEPER EYES ONLY)
            </div>
            <div className="border-2 border-blood border-dashed p-6 pt-8 bg-blood/5 h-full">
            <label className="font-display text-blood text-xl uppercase block mb-2">核心真相 (The Truth)</label>
            <textarea
                value={data.truth}
                onChange={(e) => handleChange('truth', e.target.value)}
                className="w-full h-48 bg-transparent border-none outline-none font-mono text-sm text-ink/80 resize-none"
                placeholder="幕后黑手是谁？神话生物的真实目的是什么？..."
            />
            </div>
        </div>

        {/* FAQ Section */}
        <div className="relative">
            <div className="absolute -top-3 left-4 bg-paper px-2 font-mono text-xs text-ink border border-ink">
                <HelpCircle className="inline w-3 h-3 mr-1" />
                守秘人 Q&A (FAQ)
            </div>
            <div className="border border-ink p-6 pt-8 bg-charcoal/5 h-full">
                <label className="font-display text-ink text-xl uppercase block mb-2">容易发生的问题及应对 (Problems & Answers)</label>
                <textarea
                    value={data.faq || ''}
                    onChange={(e) => handleChange('faq', e.target.value)}
                    className="w-full h-48 bg-transparent border-none outline-none font-serif text-sm text-ink resize-none"
                    placeholder="玩家如果攻击重要NPC怎么办？如果玩家错过了关键线索怎么办？..."
                />
            </div>
        </div>
      </div>

      <div className="bg-charcoal text-paper p-4 font-mono text-xs text-center mt-8 uppercase tracking-widest">
        Miskatonic University Library — Restricted Section
      </div>
    </div>
  );
};

export default OutlineView;


import React, { useState } from 'react';
import { UserInput, ViewMode } from '../types';
import { Sparkles, ArrowUpCircle } from 'lucide-react';

interface InputFormProps {
  viewMode: ViewMode;
  onSubmit: (input: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ viewMode, onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('黑色电影 (Noir)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit({ prompt, tone, length: 'medium' });
    setPrompt(''); 
  };

  const getPlaceholder = () => {
    switch (viewMode) {
      case ViewMode.OUTLINE: return "输入灵感：例如，一个发生在禁酒令时期的爵士乐团失踪案...";
      case ViewMode.TIMELINE: return "描述一个事件，或输入 'AUTO_UPDATE' 让AI自动推演背景与流程...";
      case ViewMode.MAP: return "描述一个地点，或输入 'AUTO_CREATE' 自动生成...";
      case ViewMode.CHARACTERS: return "描述一个人物，或输入 'AUTO_CREATE' 自动生成...";
      case ViewMode.ITEMS: return "描述一个物品，或输入 'AUTO_CREATE' 自动生成...";
      case ViewMode.SCENES: return "描述你想详细扩写的具体场景内容...";
      case ViewMode.REFERENCES: return "AI无法直接搜索互联网，请在此处手动整理资料...";
      case ViewMode.SETTINGS: return "在此处输入无效 (请在上方管理项目)...";
      default: return "输入灵感...";
    }
  };

  const getButtonLabel = () => {
    switch (viewMode) {
      case ViewMode.OUTLINE: return "草拟大纲";
      case ViewMode.TIMELINE: return "推演时间";
      case ViewMode.MAP: return "添加地点";
      case ViewMode.CHARACTERS: return "创建角色";
      case ViewMode.ITEMS: return "创建物品";
      case ViewMode.SCENES: return "扩写剧本";
      case ViewMode.REFERENCES: return "生成建议";
      default: return "生成";
    }
  };

  const tones = [
    "黑色电影 (Noir)",
    "宇宙恐怖 (Cosmic Horror)",
    "低俗小说 (Pulp)",
    "哥特浪漫 (Gothic)",
    "学院派 (Academic)",
    "纽约客 (New Yorker Wit)",
    "硬汉侦探 (Hardboiled)",
    "维多利亚 (Victorian)",
    "超现实主义 (Surreal)",
    "心理惊悚 (Psychological)"
  ];

  if (viewMode === ViewMode.SETTINGS) return null;

  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t-4 border-double border-ink p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-4 items-end">
        <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
                <label className="font-display text-xs text-ink uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-gold" /> 
                    AI 调查助手 ({getButtonLabel()})
                </label>
                <select 
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    className="text-xs bg-transparent font-mono outline-none text-gray-500 hover:text-ink cursor-pointer text-right max-w-[200px]"
                >
                    {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full bg-paper border border-gray-300 p-3 font-mono text-sm focus:outline-none focus:border-blood focus:ring-1 focus:ring-blood h-16 resize-none rounded-sm placeholder-gray-400 text-ink"
                disabled={isLoading}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
            />
        </div>

        <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`h-16 w-24 flex flex-col items-center justify-center border-2 border-ink font-display text-xs uppercase tracking-widest transition-all
              ${isLoading || !prompt.trim() 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300' 
                : 'bg-ink text-gold hover:bg-blood hover:text-white shadow-md active:translate-y-1'
              }
            `}
        >
            {isLoading ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    <ArrowUpCircle className="w-6 h-6 mb-1" />
                    输入
                </>
            )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;

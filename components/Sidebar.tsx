import React from 'react';
import { BookOpen, Clock, Map, Users, Briefcase, FileText, Settings, Printer, Globe, Terminal, Skull, Zap, Eye, Network } from 'lucide-react';
import { ViewMode, VisualTheme } from '../types';

interface SidebarProps {
  activeView: ViewMode;
  onSelect: (view: ViewMode) => void;
  currentTheme?: VisualTheme;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelect, currentTheme = VisualTheme.VINTAGE_1920 }) => {
  // Updated Order
  const menuItems = [
    { view: ViewMode.OUTLINE, label: '模组大纲 (Dossier)', icon: <BookOpen className="w-5 h-5" /> },
    { view: ViewMode.TIMELINE, label: '时间轴 (Timeline)', icon: <Clock className="w-5 h-5" /> },
    { view: ViewMode.SCENES, label: '剧本详情 (Scenes)', icon: <FileText className="w-5 h-5" /> },
    { view: ViewMode.MAP, label: '地点地图 (Locations)', icon: <Map className="w-5 h-5" /> },
    { view: ViewMode.CHARACTERS, label: '人物档案 (Characters)', icon: <Users className="w-5 h-5" /> },
    { view: ViewMode.ITEMS, label: '物品收集 (Collection)', icon: <Briefcase className="w-5 h-5" /> },
    { view: ViewMode.CLUE_WALL, label: '线索墙 (Clue Wall)', icon: <Network className="w-5 h-5" /> },
    { view: ViewMode.PREVIEW, label: '模组预览 (Preview)', icon: <Eye className="w-5 h-5" /> },
    { view: ViewMode.REFERENCES, label: '资料参考 (References)', icon: <Globe className="w-5 h-5" /> },
    { view: ViewMode.SETTINGS, label: '设置与存档 (Settings)', icon: <Settings className="w-5 h-5" /> },
  ];

  const getLogo = () => {
    // Custom Octopus SVG
    const OctopusLogo = (
        <svg viewBox="0 0 100 100" className={`w-12 h-12 mb-2 ${currentTheme === VisualTheme.CTHULHU_MYTHOS ? 'text-ink' : 'text-gold'} fill-current`}>
            {/* Head */}
            <path d="M30 30 Q50 10 70 30 Q80 40 75 55 Q70 70 50 70 Q30 70 25 55 Q20 40 30 30 Z" />
            {/* Eyes */}
            <circle cx="40" cy="45" r="3" fill="var(--color-paper)" />
            <circle cx="60" cy="45" r="3" fill="var(--color-paper)" />
            {/* Tentacles */}
            <path d="M35 65 Q20 80 10 70" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M45 68 Q40 90 30 95" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M55 68 Q60 90 70 95" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M65 65 Q80 80 90 70" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M25 50 Q10 50 5 60" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M75 50 Q90 50 95 60" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );

    switch (currentTheme) {
        case VisualTheme.TERMINAL:
            return (
                <div className="flex flex-col items-center">
                    <Terminal className="w-12 h-12 text-ink mb-2" />
                    <span className="font-mono text-xs tracking-tighter">[SYSTEM_ROOT]</span>
                </div>
            );
        case VisualTheme.CYBERPUNK:
        case VisualTheme.VAPORWAVE:
            return (
                <div className="flex flex-col items-center relative">
                    <Zap className="w-12 h-12 text-blood absolute top-0 animate-pulse opacity-50" />
                    <Skull className="w-12 h-12 text-ink relative z-10" />
                    <span className="font-display text-xs mt-2 text-blood">NEO-MYTHOS</span>
                </div>
            );
        case VisualTheme.BLUEPRINT:
            return (
                <div className="flex flex-col items-center border-2 border-white p-2">
                    <Eye className="w-10 h-10 text-white" />
                    <span className="font-mono text-[10px] mt-1">SCHEMATIC 001</span>
                </div>
            );
        default:
            return (
                 <div className="flex flex-col items-center">
                    {OctopusLogo}
                    <span className="font-display text-[10px] opacity-60">Lovecraft Dislikes</span>
                </div>
            );
    }
  };

  return (
    <aside className="w-full md:w-64 bg-ink text-paper border-r-4 border-double border-gold flex flex-col h-full shrink-0 shadow-2xl z-30 transition-colors duration-500 no-print">
      <div className="p-6 border-b border-charcoal bg-charcoal flex flex-col items-center">
        {getLogo()}
        <h1 className="font-display text-xl text-gold tracking-widest text-center uppercase leading-tight mt-2">
          克拉夫特不喜欢
        </h1>
        <p className="font-mono text-[10px] text-center text-gray-400 mt-2 tracking-tighter">
          SCENARIO WORKBENCH
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-4 px-3">
          {menuItems.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => onSelect(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-serif tracking-wide transition-all duration-300 border
                  ${
                    activeView === item.view
                      ? 'bg-paper text-ink border-gold translate-x-1 shadow-[4px_4px_0px_0px_var(--color-gold)]'
                      : 'border-transparent text-gray-400 hover:text-gold hover:border-gray-700 hover:bg-white/5'
                  }
                `}
              >
                {item.icon}
                <span className="uppercase tracking-widest text-xs font-bold">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-charcoal bg-ink text-center">
        <p className="font-mono text-[10px] text-gray-500">
          "Ph'nglui mglw'nafh..."
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
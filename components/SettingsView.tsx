
import React, { useEffect, useState } from 'react';
import { SavedProject, ScenarioData, VisualTheme } from '../types';
import { Save, Trash2, FolderOpen, FilePlus, Palette, Monitor, Archive } from 'lucide-react';

interface SettingsViewProps {
  currentScenario: ScenarioData;
  onLoad: (data: ScenarioData) => void;
  onNew: () => void;
  currentTheme: VisualTheme;
  onThemeChange: (theme: VisualTheme) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentScenario, onLoad, onNew, currentTheme, onThemeChange }) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('arkham_projects');
    if (stored) {
      setProjects(JSON.parse(stored));
    }
  }, []);

  const saveProject = () => {
    const newProject: SavedProject = {
      id: Date.now().toString(),
      name: currentScenario.outline.title || "未命名模组",
      lastModified: Date.now(),
      data: currentScenario
    };
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('arkham_projects', JSON.stringify(updatedProjects));
    alert("模组已保存至本地档案柜。");
  };

  const deleteProject = (id: string) => {
    if (!window.confirm("确定要销毁这份档案吗？此操作不可逆。")) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('arkham_projects', JSON.stringify(updated));
  };

  const loadProject = (project: SavedProject) => {
    if (window.confirm("加载新档案将覆盖当前未保存的工作。继续吗？")) {
        onLoad(project.data);
        alert(`已加载模组: ${project.name}`);
    }
  };

  const createNew = () => {
      if (window.confirm("确定要开始新的调查吗？当前未保存的内容将丢失。")) {
          onNew();
      }
  };

  const themes: { id: VisualTheme; name: string; color: string }[] = [
    { id: VisualTheme.VINTAGE_1920, name: '1920s 复古 (Vintage)', color: '#f4f1ea' },
    { id: VisualTheme.CTHULHU_MYTHOS, name: '克苏鲁神话 (Deep Green)', color: '#1a2f23' },
    { id: VisualTheme.FILM_NOIR, name: '黑色电影 (Noir)', color: '#e5e5e5' },
    { id: VisualTheme.CYBERPUNK, name: '赛博朋克 (Cyberpunk)', color: '#0d0221' },
    { id: VisualTheme.RETRO_FUTURISM, name: '复古未来 (Atom)', color: '#f0f4f8' },
    { id: VisualTheme.MINIMALIST, name: '极简主义 (Minimal)', color: '#ffffff' },
    { id: VisualTheme.GOTHIC, name: '哥特恐怖 (Gothic)', color: '#2b0a0a' },
    { id: VisualTheme.PULP_FICTION, name: '低俗小说 (Pulp)', color: '#fff8dc' },
    { id: VisualTheme.STEAMPUNK, name: '蒸汽朋克 (Steampunk)', color: '#d2b48c' },
    { id: VisualTheme.VAPORWAVE, name: '蒸汽波 (Vaporwave)', color: '#ffbdde' },
    { id: VisualTheme.POLAROID, name: '褪色拍立得 (Polaroid)', color: '#fffbf0' },
    { id: VisualTheme.BLUEPRINT, name: '工程蓝图 (Blueprint)', color: '#1e3a8a' },
    { id: VisualTheme.TERMINAL, name: '终端机 (Terminal)', color: '#000000' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32 space-y-12">
      
      {/* Project Management Section */}
      <section className="space-y-6">
        <div className="border-b-2 border-ink pb-4 flex items-end gap-4">
            <Archive className="w-8 h-8 text-ink" />
            <h2 className="font-display text-4xl text-ink uppercase tracking-widest">项目档案柜 (Archives)</h2>
        </div>

        <div className="flex gap-4">
             <button 
                onClick={saveProject}
                className="flex items-center gap-2 bg-ink text-gold px-6 py-3 font-display text-sm uppercase tracking-widest hover:bg-blood transition-colors shadow-lg"
             >
                <Save className="w-5 h-5" /> 保存当前模组
             </button>
             <button 
                onClick={createNew}
                className="flex items-center gap-2 bg-paper text-ink border border-ink px-6 py-3 font-display text-sm uppercase tracking-widest hover:bg-ink hover:text-gold transition-colors"
             >
                <FilePlus className="w-5 h-5" /> 新建模组
             </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
                <div key={p.id} className="bg-paper border-2 border-charcoal p-6 relative group hover:border-gold hover:shadow-lg transition-all">
                    <div className="absolute top-0 left-0 w-full h-1 bg-charcoal group-hover:bg-gold transition-colors"></div>
                    <h3 className="font-display text-xl text-ink mb-2 truncate">{p.name}</h3>
                    <p className="font-mono text-xs text-charcoal/60 mb-6">
                        {new Date(p.lastModified).toLocaleString()}
                    </p>
                    <div className="flex justify-between items-center mt-4 border-t border-gray-200 pt-4">
                         <button 
                            onClick={() => loadProject(p)}
                            className="flex items-center gap-2 text-ink hover:text-gold font-bold text-xs uppercase tracking-widest"
                         >
                            <FolderOpen className="w-4 h-4" /> 读取
                         </button>
                         <button 
                            onClick={() => deleteProject(p.id)}
                            className="text-gray-300 hover:text-red-600"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                    </div>
                </div>
            ))}
            {projects.length === 0 && (
                <div className="col-span-full py-8 text-center text-charcoal/50 border-2 border-dashed border-charcoal/30 rounded-lg">
                    档案柜是空的。请先保存您的创作。
                </div>
            )}
        </div>
      </section>

      {/* Visual Theme Section */}
      <section className="space-y-6 pt-12 border-t border-charcoal/20">
        <div className="border-b-2 border-ink pb-4 flex items-end gap-4">
             <Palette className="w-8 h-8 text-ink" />
             <h2 className="font-display text-4xl text-ink uppercase tracking-widest">视觉风格 (Visual Theme)</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {themes.map(t => (
                <button
                    key={t.id}
                    onClick={() => onThemeChange(t.id)}
                    className={`flex flex-col items-center justify-center p-4 border-2 transition-all relative overflow-hidden group h-32
                        ${currentTheme === t.id 
                            ? 'border-gold shadow-lg scale-105 bg-white/10' 
                            : 'border-charcoal/20 hover:border-ink bg-white/5'}
                    `}
                >
                    <div 
                        className="w-full h-full absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30" 
                        style={{ backgroundColor: t.color }}
                    ></div>
                    <div className="relative z-10 flex flex-col items-center gap-2">
                        <Monitor className={`w-6 h-6 ${currentTheme === t.id ? 'text-gold' : 'text-charcoal'}`} />
                        <span className={`font-mono text-xs font-bold uppercase tracking-wider text-center ${currentTheme === t.id ? 'text-ink' : 'text-charcoal'}`}>
                            {t.name}
                        </span>
                    </div>
                    {currentTheme === t.id && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                    )}
                </button>
            ))}
        </div>
      </section>

    </div>
  );
};

export default SettingsView;
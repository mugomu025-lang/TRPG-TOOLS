
import React, { useEffect, useState } from 'react';
import { SavedProject, ScenarioData } from '../types';
import { Save, Trash2, FolderOpen, FilePlus } from 'lucide-react';

interface ProjectViewProps {
  currentScenario: ScenarioData;
  onLoad: (data: ScenarioData) => void;
  onNew: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ currentScenario, onLoad, onNew }) => {
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

    // Check if updating existing by title matching (simple logic)
    // Ideally we would track the current Project ID in App state, but for now lets just append
    // Or better: Let's assume every save is a "Save As" or Update. 
    // Let's keep it simple: List of snapshots.
    // Improved: Update if ID matches? We don't track ID in scenario data.
    // Let's just Add to list.
    
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

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
       <div className="border-b-2 border-ink pb-4 mb-8">
        <h2 className="font-display text-4xl text-ink uppercase tracking-widest">项目档案柜 (Archives)</h2>
        <p className="font-mono text-sm text-gray-500 mt-2">您的所有模组均存储在本地浏览器中。</p>
      </div>

      <div className="flex gap-4 mb-8">
         <button 
            onClick={saveProject}
            className="flex items-center gap-2 bg-ink text-gold px-6 py-3 font-display text-sm uppercase tracking-widest hover:bg-blood transition-colors shadow-lg"
         >
            <Save className="w-5 h-5" /> 保存当前模组
         </button>
         <button 
            onClick={createNew}
            className="flex items-center gap-2 bg-white text-ink border border-ink px-6 py-3 font-display text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors"
         >
            <FilePlus className="w-5 h-5" /> 新建模组
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
            <div key={p.id} className="bg-paper border-2 border-gray-300 p-6 relative group hover:border-gold hover:shadow-lg transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 group-hover:bg-gold transition-colors"></div>
                
                <h3 className="font-display text-xl text-ink mb-2 truncate">{p.name}</h3>
                <p className="font-mono text-xs text-gray-400 mb-6">
                    最后修改: {new Date(p.lastModified).toLocaleString()}
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
            <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="font-serif italic mb-2">档案柜是空的。</p>
                <p className="font-mono text-xs">点击“保存当前模组”以存档。</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;

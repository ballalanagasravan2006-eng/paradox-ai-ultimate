import React from 'react';
import * as LucideIcons from 'lucide-react';
import { TOOLS } from '../data/tools';
import { Tool, ToolId } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool: (toolId: ToolId) => void;
  onOpenSettings: () => void;
}

export function Sidebar({ activeTool, onSelectTool, onOpenSettings }: SidebarProps) {
  return (
    <div className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full flex-shrink-0">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <LucideIcons.BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none text-zinc-100 tracking-tight">Paradox AI</h1>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono mt-0.5">Gemini Engine</p>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
          title="Engine Settings"
        >
          <LucideIcons.Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {TOOLS.map((tool) => {
          const Icon = LucideIcons[tool.icon as keyof typeof LucideIcons] as React.ElementType;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-md transition-colors",
                isActive ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-800/50 text-zinc-500 group-hover:text-zinc-300"
              )}>
                {Icon && <Icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{tool.name}</div>
                <div className="text-xs opacity-60 truncate">{tool.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

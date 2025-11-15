import React from 'react';
import { Languages, DollarSign, Palette } from 'lucide-react';

interface SettingsPanelProps {
  onSettingsAction: (action: string) => void;
}

export function SettingsPanel({ onSettingsAction }: SettingsPanelProps) {
  const actions = [
    { id: 'language', label: 'Language', icon: Languages, color: 'blue' },
    { id: 'currency', label: 'Currency', icon: DollarSign, color: 'blue' },
    { id: 'theme', label: 'Theme', icon: Palette, color: 'blue' },
  ];

  return (
    <div className="w-48 h-full bg-gray-900 border-l border-gray-800 p-4 flex flex-col gap-3 shadow-sm">
      <div className="mb-2">
        <h3 className="text-sm text-gray-400 tracking-wider uppercase">Control</h3>
      </div>
      
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onSettingsAction(action.id)}
            className="flex items-center gap-3 px-3 py-3 bg-black border border-gray-800 hover:border-blue-600 hover:bg-gray-950 rounded-lg transition-all duration-300 group"
          >
            <div className="p-1.5 bg-gray-800 group-hover:bg-blue-600 rounded transition-all duration-300">
              <Icon size={16} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}


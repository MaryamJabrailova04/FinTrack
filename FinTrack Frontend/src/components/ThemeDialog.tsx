import React from 'react';
import { X, Moon, Sun } from 'lucide-react';

interface ThemeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: string) => void;
  selectedTheme?: string;
}

export function ThemeDialog({
  isOpen,
  onClose,
  onSelectTheme,
  selectedTheme = 'dark',
}: ThemeDialogProps) {
  const themes = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">Select Theme</h2>
            <p className="text-sm text-gray-400 mt-1">Choose your preferred theme</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Theme Options */}
        <div className="p-6 space-y-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  onClose();
                }}
                className={`w-full p-4 rounded-lg border transition-all duration-300 text-left flex items-center gap-3 ${
                  selectedTheme === theme.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-600 hover:bg-gray-950'
                }`}
              >
                <Icon size={20} className={selectedTheme === theme.id ? 'text-white' : 'text-gray-400'} />
                <span className="text-base font-medium">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { User, Settings, Trophy, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface LeftPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onProfileDoubleClick?: () => void;
}

export function LeftPanel({ activeTab, onTabChange, onProfileDoubleClick }: LeftPanelProps) {
  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'rewards', label: 'Rewards', icon: Trophy },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <div className="w-64 h-screen bg-black border-r border-gray-800 p-6 flex flex-col gap-4">
      <div className="mb-8">
        <h1 className="text-2xl text-white tracking-wider">FinTrack AI</h1>
        <div className="h-0.5 w-12 bg-blue-600 mt-2" />
      </div>
      
      <nav className="flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onDoubleClick={() => {
                if (item.id === 'profile' && onProfileDoubleClick) {
                  onProfileDoubleClick();
                }
              }}
              className={
                isActive
                  ? 'flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-300 bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-300 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-gray-800/50'
              }
            >
              <Icon size={20} />
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

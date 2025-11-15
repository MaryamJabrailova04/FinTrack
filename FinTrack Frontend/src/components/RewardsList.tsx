import React from 'react';
import { Trophy, Lock } from 'lucide-react';

interface Reward {
  id: number;
  title: string;
  description: string;
  earned: boolean;
}

interface RewardsListProps {
  rewards: Reward[];
}

export function RewardsList({ rewards }: RewardsListProps) {
  return (
    <div className="h-full w-full p-8 pt-20 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl text-white tracking-wider uppercase mb-2">Rewards</h1>
          <p className="text-gray-400">Track your achievements and milestones</p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`bg-black border border-gray-800 rounded-xl p-6 transition-all duration-300 ${
                reward.earned ? 'hover:border-blue-600' : 'opacity-50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Trophy Icon */}
                <div className="p-3 rounded-lg flex-shrink-0 relative bg-gray-900">
                  {reward.earned ? (
                    <Trophy size={24} className="text-blue-600" />
                  ) : (
                    <div className="relative">
                      <Trophy size={24} className="text-gray-700" />
                      <div className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-1">
                        <Lock size={14} className="text-gray-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Reward Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-lg font-medium tracking-wide ${
                      reward.earned ? 'text-white' : 'text-gray-500'
                    }`}>
                      {reward.title}
                    </h3>
                    {!reward.earned && (
                      <Lock size={16} className="text-gray-600" />
                    )}
                  </div>
                  <p className={`text-sm ${
                    reward.earned ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {reward.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


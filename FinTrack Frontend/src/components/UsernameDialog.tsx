import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface UsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername?: string;
  onUpdateUsername?: (username: string) => void;
}

export function UsernameDialog({
  isOpen,
  onClose,
  currentUsername = '',
  onUpdateUsername,
}: UsernameDialogProps) {
  const [username, setUsername] = useState(currentUsername);

  // Update username when currentUsername prop changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername);
    }
  }, [isOpen, currentUsername]);

  const handleSubmit = () => {
    if (!username.trim()) {
      return;
    }

    if (onUpdateUsername) {
      onUpdateUsername(username.trim());
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">Change Username</h2>
            <p className="text-sm text-gray-400 mt-1">Update your username</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <Label className="text-gray-300">Username</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new username"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
            disabled={!username.trim()}
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}


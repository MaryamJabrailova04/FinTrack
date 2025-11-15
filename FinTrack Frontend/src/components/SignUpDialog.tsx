import React from 'react';
import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface SignUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp?: (data: { username: string; email: string; password: string }) => void;
}

export function SignUpDialog({
  isOpen,
  onClose,
  onSignUp,
}: SignUpDialogProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (!username || !email || !password) {
      return;
    }

    if (onSignUp) {
      onSignUp({ username, email, password });
    }

    // Reset form
    setUsername('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">Sign Up</h2>
            <p className="text-sm text-gray-400 mt-1">Create your account</p>
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
              placeholder="Enter your username"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-gray-300">Mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label className="text-gray-300">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 left-auto top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded transition-colors"
                style={{ right: '12px', left: 'auto' }}
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-gray-400 hover:text-white" />
                ) : (
                  <Eye size={18} className="text-gray-400 hover:text-white" />
                )}
              </button>
            </div>
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
            disabled={!username || !email || !password}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}


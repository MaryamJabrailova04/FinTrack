import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { renderGoogleButton } from '../services/google';

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn?: (data: { username: string; password: string }) => void | Promise<void>;
  onGoogleCredential?: (idToken: string) => void;
  onGoogleAuth?: () => void;
  loading?: boolean;
  error?: string | null;
}

export function SignInDialog({
  isOpen,
  onClose,
  onSignIn,
  onGoogleCredential,
  onGoogleAuth,
  loading = false,
  error = null,
}: SignInDialogProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && googleBtnRef.current && onGoogleCredential) {
      void renderGoogleButton(googleBtnRef.current, (idToken) => {
        onGoogleCredential(idToken);
      }).catch(console.error);
    }
  }, [isOpen, onGoogleCredential, onClose]);

  const handleSubmit = async () => {
    if (!username || !password || loading) {
      return;
    }

    try {
      if (onSignIn) {
        await onSignIn({ username, password });
      }
    } catch {
      return;
    }

    setUsername('');
    setPassword('');
    setShowPassword(false);
  };

  const handleForgetPassword = () => {
    // Handle forget password
    console.log('Forget password clicked');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">Sign In</h2>
            <p className="text-sm text-gray-400 mt-1">Welcome back</p>
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

          {/* Forget Password Button */}
          <div className="flex justify-end">
            <button
              onClick={handleForgetPassword}
              className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
            >
              Forget password?
            </button>
          </div>

          {/* Or separator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Google Sign In Button (rendered by Google) */}
          <div className="w-full flex items-center justify-center">
            <div ref={googleBtnRef} />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg p-3">{error}</div>
        )}

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
            disabled={!username || !password || loading}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}


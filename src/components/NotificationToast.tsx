import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface NotificationToastProps {
  message: string | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-slideUp">
      <div className="flex items-center gap-3 px-4 py-3 bg-neutral-950 border border-red-800 text-rose-200 rounded-2xl shadow-2xl shadow-red-950/80 backdrop-blur-xl">
        <div className="w-8 h-8 rounded-xl bg-red-950 border border-red-800/80 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-rose-400" />
        </div>
        <div className="pr-2">
          <p className="text-xs font-bold text-white">{message}</p>
        </div>
      </div>
    </div>
  );
};


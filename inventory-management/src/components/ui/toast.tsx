import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg z-50`}>
      {message}
    </div>
  );
};

// Simple toast function to show notifications
export const toast = {
  success: (message: string) => {
    const toastElement = document.createElement('div');
    toastElement.id = 'toast-container';
    document.body.appendChild(toastElement);
    
    const root = document.createElement('div');
    toastElement.appendChild(root);
    
    // This is a simplified version - in a real app, you'd use a proper state management solution
    const removeToast = () => {
      document.body.removeChild(toastElement);
    };
    
    // In a real implementation, you'd use ReactDOM.render or similar
    // For now, we'll just show a simple alert
    alert(message);
    setTimeout(removeToast, 3000);
  },
  
  error: (message: string) => {
    alert(message);
  },
  
  info: (message: string) => {
    alert(message);
  }
}; 
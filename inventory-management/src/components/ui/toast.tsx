import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';

// Toast types
type ToastType = 'success' | 'error' | 'info';

// Toast item structure
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Toast context
interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast component
interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  id,
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, id]);

  if (!isVisible) return null;

  const baseStyles = "fixed rounded-md shadow-lg z-50 p-4 transition-all duration-300 transform translate-y-0";
  
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  }[type];

  return (
    <div className={`${baseStyles} ${typeStyles} bottom-4 right-4`}>
      {message}
    </div>
  );
};

// Toaster component to manage multiple toasts
export const Toaster: React.FC = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    return null;
  }
  
  return null; // The actual toasts are rendered through the portal
};

// Toast provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [root, setRoot] = useState<any>(null);

  // Initialize the root once on component mount
  useEffect(() => {
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed z-50 flex flex-col gap-2 bottom-4 right-4';
      document.body.appendChild(toastContainer);
    }
    
    // Create and store the root
    const newRoot = createRoot(toastContainer);
    setRoot(newRoot);
    
    // Cleanup function
    return () => {
      // No need to unmount with createRoot API, it will be garbage collected
      if (toastContainer && toastContainer.parentNode) {
        toastContainer.parentNode.removeChild(toastContainer);
      }
    };
  }, []);

  const addToast = (message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Render toasts whenever the toasts array changes
  useEffect(() => {
    if (root) {
      const toastElements = (
        <>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </>
      );
      
      root.render(toastElements);
    }
  }, [toasts, root]);

  // Set up event listener for global toast events
  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        const { message, type, duration } = customEvent.detail;
        addToast(message, type, duration);
      }
    };
    
    window.addEventListener('toast', handleToast);
    
    return () => {
      window.removeEventListener('toast', handleToast);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook for using toast
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return {
    success: (message: string, duration?: number) => context.addToast(message, 'success', duration),
    error: (message: string, duration?: number) => context.addToast(message, 'error', duration),
    info: (message: string, duration?: number) => context.addToast(message, 'info', duration)
  };
};

// Simple toast function for components that don't have access to hooks
export const toast = {
  success: (message: string, duration?: number) => {
    const event = new CustomEvent('toast', { 
      detail: { message, type: 'success', duration } 
    });
    window.dispatchEvent(event);
  },
  
  error: (message: string, duration?: number) => {
    const event = new CustomEvent('toast', { 
      detail: { message, type: 'error', duration } 
    });
    window.dispatchEvent(event);
  },
  
  info: (message: string, duration?: number) => {
    const event = new CustomEvent('toast', { 
      detail: { message, type: 'info', duration } 
    });
    window.dispatchEvent(event);
  }
};
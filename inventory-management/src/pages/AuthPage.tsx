import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { LoginForm } from '../app/Landingpage/LoginForm';
import { ForgotPasswordForm } from '../app/Landingpage/ForgotPasswordForm';
import { useNavigate } from 'react-router-dom';

type AuthView = 'login' | 'forgot';

interface AuthPageProps {
  initialView?: AuthView;
}

export function AuthPage({ initialView = 'login' }: AuthPageProps) {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    setCurrentView('login');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-indigo-600 p-4">
          <h1 className="text-2xl font-bold text-center text-white">Inventory System</h1>
        </div>
        <CardContent className="p-6">
          {currentView === 'login' ? (
            <>
              <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">Sign In</h2>
              <LoginForm onForgotPassword={() => setCurrentView('forgot')} />
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">Reset Password</h2>
              <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthPage;
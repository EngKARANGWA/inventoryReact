import { LoginForm } from './LoginForm';
import { Card, CardContent } from '../../components/ui/card';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-indigo-600 p-4">
          <h1 className="text-2xl font-bold text-center text-white">Inventory System</h1>
        </div>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">Sign In</h2>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
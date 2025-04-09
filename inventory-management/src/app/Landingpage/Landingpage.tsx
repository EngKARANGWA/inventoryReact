import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Twitter, Phone } from '../../components/ui/icons';
import { toast } from '../../components/ui/toast';
import headerImage from '../../assets/header-image.jpg';

interface User {
  email: string;
  password: string;
  role: 'admin' | 'cashier' | 'user';
}

const users: User[] = [
  { email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { email: 'cashier@example.com', password: 'cashier123', role: 'cashier' },
  { email: 'user@example.com', password: 'user123', role: 'user' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    
    if (user) {
      // Store user info in localStorage for persistence
      localStorage.setItem('user', JSON.stringify({ email: user.email, role: user.role }));
      
      toast.success(`Welcome ${user.email}!`);
      
      // Navigate based on role using React Router
      if (user.role === 'cashier') {
        navigate('/dashboard-cashier');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className=" w-full overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0">
        <img
          src={headerImage}
          alt="Digital inventory system"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="w-full py-4 px-6 bg-black/20">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Inventory System</h1>
            <div className="flex gap-6">
              <a href="/documentation" className="text-white hover:text-blue-200">Documentation</a>
              <a href="/guidelines" className="text-white hover:text-blue-200">Guidelines</a>
              <a href="/tutorials" className="text-white hover:text-blue-200">Tutorials</a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 bg-black/30">
          <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Welcome Text */}
            <div className="text-white space-y-6">
              <h2 className="text-4xl font-bold">Welcome to Factory Management</h2>
              <p className="text-xl">
                Track inventory operations from production to delivery with our comprehensive system
              </p>
              <div className="space-y-4 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white">✓</span>
                  </div>
                  <span>Real-time inventory tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white">✓</span>
                  </div>
                  <span>Production process monitoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white">✓</span>
                  </div>
                  <span>Comprehensive reporting</span>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto">
              <Card className="bg-white shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-center mb-6 text-black">System Login</h3>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full text-white-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full text-white-100"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    >
                      Sign In
                    </Button>
                  </form>
                  <div className="mt-6 text-center text-sm text-gray-600">
                    <p className="font-medium">Demo Accounts:</p>
                    <p>Admin: admin@example.com / admin123</p>
                    <p>Cashier: cashier@example.com / cashier123</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-6 bg-black/20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white text-sm">
              © 2024 Inventory Management System. All rights reserved.
            </div>
            <div className="flex items-center gap-8">
              <a href="https://twitter.com" className="text-white hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://whatsapp.com" className="text-white hover:text-green-400 transition-colors">
                <Phone size={20} />
              </a>
              <a href="/contact" className="text-white hover:text-blue-400 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

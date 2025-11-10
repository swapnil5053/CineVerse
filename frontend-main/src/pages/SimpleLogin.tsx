import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const SimpleLogin = () => {
  const [email, setEmail] = useState('admin@theatre.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Login successful!');
        console.log('Login successful:', data);
        
        // Test auth status immediately
        const authResponse = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          console.log('Auth status:', authData);
          toast.success(`Welcome ${authData.user.name}!`);
        } else {
          console.log('Auth check failed:', authResponse.status);
          toast.error('Auth check failed');
        }
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAdminStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        credentials: 'include'
      });

      if (response.ok) {
        const stats = await response.json();
        console.log('Admin stats:', stats);
        toast.success('Admin stats loaded successfully!');
      } else {
        console.log('Admin stats failed:', response.status);
        toast.error('Admin stats failed - not authenticated?');
      }
    } catch (error) {
      console.error('Admin stats error:', error);
      toast.error('Admin stats error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Simple Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <Button onClick={testAdminStats} variant="outline" className="w-full">
            Test Admin Stats
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleLogin;
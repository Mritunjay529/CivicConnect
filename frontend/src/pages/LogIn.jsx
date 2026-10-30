import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../services/api';

export default function LogIn({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Citizen');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectUser = (selectedRole) => {
    const norm = (selectedRole || '').toLowerCase();
    if (norm === 'citizen') navigate('/citizen-dashboard');
    else if (norm === 'ngo') navigate('/ngo-dashboard');
    else if (norm === 'business') navigate('/business-dashboard');
    else if (norm === 'authority' || norm === 'municipal authority') navigate('/municipal-dashboard');
    else if (norm === 'admin') navigate('/admin-dashboard');
    else navigate('/');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.login(email.trim().toLowerCase(), password, role);
      if (!response?.success || !response?.data) {
        throw new Error(response?.message || 'Login failed. Please check your credentials and try again.');
      }

      const userData = response.data;
      const roleMap = {
        citizen: 'Citizen',
        ngo: 'NGO',
        business: 'Business',
        authority: 'Municipal Authority',
        admin: 'Admin'
      };
      const loggedInUser = {
        ...userData,
        id: userData._id || userData.id,
        _id: userData._id || userData.id,
        name: userData.name || userData.orgName || email.split('@')[0],
        email: userData.email || email.trim().toLowerCase(),
        role: roleMap[String(userData.role || role).toLowerCase()] || userData.role || role,
        points: userData.rewardPoints ?? userData.points ?? 0,
        activityHistory: userData.activityHistory || []
      };

      localStorage.setItem('civic_user', JSON.stringify(loggedInUser));
      setIsLoading(false);
      onLoginSuccess(loggedInUser);
      redirectUser(loggedInUser.role);
    } catch (fetchErr) {
      console.error('CivicConnect login failed:', fetchErr);
      setError(fetchErr.message || 'Unable to log in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col items-center min-h-[calc(100vh-64px)] justify-center">
      <Card className="w-full max-w-[460px] flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-secondary">Log In to CivicConnect</h2>
          <p className="text-sm text-secondary/60 mt-1">Access your civic account</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-custom-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <Input
            label="Role Type"
            type="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'Citizen', label: 'Citizen / Student' },
              { value: 'NGO', label: 'NGO Representative' },
              { value: 'Business', label: 'Corporate CSR rep' },
              { value: 'Municipal Authority', label: 'Municipal Officer / Representative' },
              { value: 'Admin', label: 'Administrator' }
            ]}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 font-bold"
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-border-custom">
          <p className="text-sm text-secondary/60">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/role-selection')}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Sign Up here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';


export default function LogIn({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Citizen');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const identifier = loginMethod === 'email' ? email : phone;
    if (!identifier || !password) {
      setError('Please fill out all fields.');
      return;
    }

    const nameFromIdentifier = loginMethod === 'email'
      ? email.split('@')[0]
          .split(/[._+-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : 'User ' + phone.slice(-4);

    // Mock Login Context Setup based on selected Role
    let mockUserObj = {
      id: 'usr-' + Math.floor(Math.random() * 100),
      name: nameFromIdentifier,
      role: role,
      email: loginMethod === 'email' ? email : '',
      phone: loginMethod === 'phone' ? phone : '',
      location: 'Metropolis City',
      points: 0,
      badges: [],
      activityHistory: []
    };

    onLoginSuccess(mockUserObj);
    redirectUser(role);
  };

  const redirectUser = (selectedRole) => {
    switch (selectedRole) {
      case 'Citizen':
        navigate('/citizen-dashboard');
        break;
      case 'NGO':
        navigate('/ngo-dashboard');
        break;
      case 'Business':
        navigate('/business-dashboard');
        break;
      case 'Municipal Authority':
        navigate('/municipal-dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col items-center min-h-[calc(100vh-64px)] justify-center">
      <Card className="w-full max-w-[450px] flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-secondary">Log In to CivicConnect</h2>
          <p className="text-sm text-secondary/60 mt-1">Access your civic dashboard</p>
        </div>

        {error && (
          <div className="bg-error-container border border-error/20 text-error p-3 rounded-custom-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="Role Type"
            type="select"
            value={role}
            onChange={(e) => {
              const newRole = e.target.value;
              setRole(newRole);
              if (newRole !== 'Citizen') {
                setLoginMethod('email');
              }
            }}
            options={[
              { value: 'Citizen', label: 'Citizen / Student' },
              { value: 'NGO', label: 'NGO Representative' },
              { value: 'Business', label: 'Corporate CSR rep' },
              { value: 'Municipal Authority', label: 'Municipal Officer / Representative' }
            ]}
          />

          {role === 'Citizen' && (
            /* Login Method Toggle */
            <div className="flex gap-2 p-1 bg-surface-low rounded-custom-lg border border-border-custom text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-1.5 rounded-custom-md text-center transition-all cursor-pointer ${
                  loginMethod === 'email'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-secondary/60 hover:text-secondary'
                }`}
              >
                Email Address
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-1.5 rounded-custom-md text-center transition-all cursor-pointer ${
                  loginMethod === 'phone'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-secondary/60 hover:text-secondary'
                }`}
              >
                Phone Number
              </button>
            </div>
          )}

          {loginMethod === 'email' ? (
            <Input
              label="Email Address"
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          ) : (
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          )}

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full mt-2">
            Log In
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-secondary/60">
            Don't have an account?{' '}
            <button onClick={() => navigate('/role-selection')} className="text-primary font-bold hover:underline">
              Sign Up here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}

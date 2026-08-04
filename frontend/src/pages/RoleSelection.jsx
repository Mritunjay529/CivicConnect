import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

export default function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'Citizen',
      title: 'Citizen / Student',
      description: 'Report localized infrastructure issues, earn civic reward points, RSVP to town halls, and sign up for local volunteering drives.',
      icon: 'emoji_people',
      color: 'text-primary'
    },
    {
      id: 'NGO',
      title: 'Non-Governmental Org (NGO)',
      description: 'Host volunteering opportunities, post events, verify citizens contributions, and collaborate with corporate sponsors.',
      icon: 'volunteer_activism',
      color: 'text-emerald-700'
    },
    {
      id: 'Business',
      title: 'Corporate / Business',
      description: 'Drive corporate social responsibility (CSR), fund municipal improvements, and sponsor local NGO projects.',
      icon: 'domain',
      color: 'text-blue-700'
    },
    {
      id: 'Municipal Authority',
      title: 'Municipal Authority / City Rep',
      description: 'Access the official complaint worklist, assign repairs, dispatch staff, and manage complaints prioritizing by AI ranking.',
      icon: 'account_balance',
      color: 'text-amber-700'
    }
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col items-center gap-8 min-h-[calc(100vh-64px)] justify-center">
      <div className="text-center max-w-[600px] flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-secondary">Join CivicConnect</h2>
        <p className="text-secondary/70">Select your account type to customize your experience and begin helping your city.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[900px]">
        {roles.map((role) => (
          <Card 
            key={role.id} 
            onClick={() => navigate(`/signup?role=${encodeURIComponent(role.id)}`)}
            className="flex gap-4 items-start hover:border-primary hover:shadow-sm transition-all duration-300"
          >
            <span className={`material-symbols-outlined text-[40px] p-3 bg-surface-low rounded-custom-lg ${role.color}`}>
              {role.icon}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-secondary flex items-center justify-between">
                {role.title}
                <span className="material-symbols-outlined text-[18px] text-secondary/40 group-hover:text-primary transition-colors">
                  arrow_forward
                </span>
              </h3>
              <p className="text-sm text-secondary/70 leading-relaxed">{role.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-sm text-secondary/60">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">
            Log In here
          </button>
        </p>
      </div>
    </div>
  );
}

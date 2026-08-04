import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProgressStepper from '../components/ProgressStepper';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

export default function SignUp({ onLoginSuccess }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role') || 'Citizen';

  const [signUpMethod, setSignUpMethod] = useState('email'); // 'email' or 'phone'
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Citizen Fields
    fullName: '',
    phone: '',
    age: '',
    isStudent: false,
    studentId: '',
    location: '',
    // NGO Fields
    ngoName: '',
    registrationNo: '',
    ngoContactName: '',
    ngoDomain: 'Environment',
    ngoLocation: '',
    // Business Fields
    businessName: '',
    taxId: '',
    bizContactName: '',
    website: '',
    csrFocus: 'Environment',
    // Municipal Fields
    employeeId: '',
    dept: 'Road Repair',
    cityName: '',
    verificationPin: '',
    // Terms check
    agreeTerms: false
  });

  const steps = ['Credentials', 'Profile Details', 'Confirmation'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert('You must agree to the terms & conditions.');
      return;
    }

    // Mock Login Context Activation
    let formattedName = '';
    let dashboardPath = '';

    if (role === 'Citizen') {
      formattedName = formData.fullName || 'New Citizen';
      dashboardPath = '/citizen-dashboard';
    } else if (role === 'NGO') {
      formattedName = formData.ngoName || 'New NGO';
      dashboardPath = '/ngo-dashboard';
    } else if (role === 'Business') {
      formattedName = formData.businessName || 'New Business';
      dashboardPath = '/business-dashboard';
    } else if (role === 'Municipal Authority') {
      formattedName = formData.fullName || 'City Official';
      dashboardPath = '/municipal-dashboard';
    }

    const mockUser = {
      id: 'usr-' + Math.floor(Math.random() * 1000),
      name: formattedName,
      role: role,
      email: signUpMethod === 'email' ? formData.email : '',
      phone: signUpMethod === 'phone' ? formData.phone : '',
      location: formData.location || formData.ngoLocation || formData.cityName || 'Metropolis',
      points: 100,
      badges: [],
      activityHistory: []
    };

    onLoginSuccess(mockUser);
    navigate(dashboardPath);
  };

  // Render inputs dynamically based on Step 1 (Credentials)
  const renderStep0 = () => (
    <div className="flex flex-col gap-4">
      {/* Sign Up Method Toggle */}
      {role === 'Citizen' && (
        <div className="flex gap-2 p-1 bg-surface-low rounded-custom-lg border border-border-custom text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSignUpMethod('email')}
            className={`flex-1 py-1.5 rounded-custom-md text-center transition-all cursor-pointer ${
              signUpMethod === 'email'
                ? 'bg-white text-primary shadow-sm'
                : 'text-secondary/60 hover:text-secondary'
            }`}
          >
            Email Address
          </button>
          <button
            type="button"
            onClick={() => setSignUpMethod('phone')}
            className={`flex-1 py-1.5 rounded-custom-md text-center transition-all cursor-pointer ${
              signUpMethod === 'phone'
                ? 'bg-white text-primary shadow-sm'
                : 'text-secondary/60 hover:text-secondary'
            }`}
          >
            Phone Number
          </button>
        </div>
      )}

      {signUpMethod === 'email' ? (
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      ) : (
        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      )}
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />
    </div>
  );

  // Render inputs dynamically based on Step 2 & Role Selection
  const renderStep1 = () => {
    switch (role) {
      case 'Citizen':
        return (
          <div className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              placeholder="Aria Chen"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              {signUpMethod === 'phone' ? (
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              ) : (
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              )}
              <Input
                label="Age"
                type="number"
                name="age"
                placeholder="21"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label="Primary Location (Neighborhood)"
              type="text"
              name="location"
              placeholder="Metropolis North"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <Input
              label="I am a Student"
              type="checkbox"
              name="isStudent"
              value={formData.isStudent}
              onChange={handleChange}
            />
            {formData.isStudent && (
              <Input
                label="Student Registration ID Number"
                type="text"
                name="studentId"
                placeholder="STU-88902"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            )}
          </div>
        );

      case 'NGO':
        return (
          <div className="flex flex-col gap-4">
            <Input
              label="NGO Name"
              type="text"
              name="ngoName"
              placeholder="GreenEarth Network"
              value={formData.ngoName}
              onChange={handleChange}
              required
            />
            <Input
              label="Government Registration Number"
              type="text"
              name="registrationNo"
              placeholder="NGO-DEPT-998822"
              value={formData.registrationNo}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Primary Contact Person"
                type="text"
                name="ngoContactName"
                placeholder="Sarah Jenkins"
                value={formData.ngoContactName}
                onChange={handleChange}
                required
              />
              <Input
                label="Focus Sector Domain"
                type="select"
                name="ngoDomain"
                value={formData.ngoDomain}
                onChange={handleChange}
                options={[
                  { value: 'Environment', label: 'Environmental Planning' },
                  { value: 'Social Support', label: 'Social & Food Support' },
                  { value: 'Education', label: 'Education & Mentoring' },
                  { value: 'Health', label: 'Health & Care Services' }
                ]}
              />
            </div>
            <Input
              label="Headquarters Address / Neighborhood"
              type="text"
              name="ngoLocation"
              placeholder="45 Pine St, Metropolis"
              value={formData.ngoLocation}
              onChange={handleChange}
              required
            />
          </div>
        );

      case 'Business':
        return (
          <div className="flex flex-col gap-4">
            <Input
              label="Company Name"
              type="text"
              name="businessName"
              placeholder="EcoTech Innovations"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Corporate Tax ID / EIN"
                type="text"
                name="taxId"
                placeholder="12-3456789"
                value={formData.taxId}
                onChange={handleChange}
                required
              />
              <Input
                label="Corporate Focus Sector"
                type="select"
                name="csrFocus"
                value={formData.csrFocus}
                onChange={handleChange}
                options={[
                  { value: 'Environment', label: 'Environment & Climate' },
                  { value: 'Infrastructure', label: 'Urban & Infrastructure' },
                  { value: 'Education', label: 'Tech & Youth Education' }
                ]}
              />
            </div>
            <Input
              label="Point of Contact Person"
              type="text"
              name="bizContactName"
              placeholder="David Kim"
              value={formData.bizContactName}
              onChange={handleChange}
              required
            />
            <Input
              label="Corporate Website URL"
              type="text"
              name="website"
              placeholder="https://ecotech.com"
              value={formData.website}
              onChange={handleChange}
            />
          </div>
        );

      case 'Municipal Authority':
        return (
          <div className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              placeholder="Mayor John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Municipal ID Number"
                type="text"
                name="employeeId"
                placeholder="MUN-10029"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
              <Input
                label="Assigned Department"
                type="select"
                name="dept"
                value={formData.dept}
                onChange={handleChange}
                options={[
                  { value: 'Road Repair', label: 'Road Repair & Paving' },
                  { value: 'Street Lighting', label: 'Street Lighting & Solar' },
                  { value: 'Waste Management', label: 'Waste & Sanitation' },
                  { value: 'Traffic Signage', label: 'Traffic & Signage' }
                ]}
              />
            </div>
            <Input
              label="Authorized City"
              type="text"
              name="cityName"
              placeholder="Metropolis City"
              value={formData.cityName}
              onChange={handleChange}
              required
            />
            <Input
              label="Municipal Authorization Access PIN (1234 for testing)"
              type="password"
              name="verificationPin"
              placeholder="••••"
              value={formData.verificationPin}
              onChange={handleChange}
              required
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Render Confirmation step
  const renderStep2 = () => (
    <div className="flex flex-col gap-6 text-center py-4">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-[64px] text-primary bg-surface-low p-4 rounded-full">
          gavel
        </span>
        <h4 className="text-lg font-bold text-secondary">Terms and Privacy Statement</h4>
        <p className="text-sm text-secondary/70 max-w-[500px]">
          By registering, you commit to providing accurate information. Municipal and NGO listings undergo strict validation. Citizen accounts will earn redeemable reward points upon verified contributions.
        </p>
      </div>

      <div className="bg-surface-low border border-border-custom p-4 rounded-custom-lg text-left">
        <h5 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Registration Details Summary</h5>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-secondary/80">
          <p><span className="font-semibold">Role:</span> {role}</p>
          <p><span className="font-semibold">Email:</span> {formData.email}</p>
          {role === 'Citizen' && (
            <>
              <p><span className="font-semibold">Name:</span> {formData.fullName}</p>
              <p><span className="font-semibold">Age:</span> {formData.age}</p>
              <p><span className="font-semibold">Student:</span> {formData.isStudent ? 'Yes' : 'No'}</p>
            </>
          )}
          {role === 'NGO' && (
            <>
              <p><span className="font-semibold">Org Name:</span> {formData.ngoName}</p>
              <p><span className="font-semibold">Sector:</span> {formData.ngoDomain}</p>
            </>
          )}
          {role === 'Business' && (
            <>
              <p><span className="font-semibold">Company:</span> {formData.businessName}</p>
              <p><span className="font-semibold">CSR Area:</span> {formData.csrFocus}</p>
            </>
          )}
          {role === 'Municipal Authority' && (
            <>
              <p><span className="font-semibold">Name:</span> {formData.fullName}</p>
              <p><span className="font-semibold">Department:</span> {formData.dept}</p>
            </>
          )}
        </div>
      </div>

      <Input
        label="I declare that the information provided is correct and agree to the CivicConnect Code of Conduct."
        type="checkbox"
        name="agreeTerms"
        value={formData.agreeTerms}
        onChange={handleChange}
        required
      />
    </div>
  );

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col items-center min-h-[calc(100vh-64px)] justify-center">
      <Card className="w-full max-w-[550px] flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-secondary">Create {role} Account</h2>
          <p className="text-sm text-secondary/60 mt-1">Step {currentStep + 1} of 3</p>
        </div>

        <ProgressStepper steps={steps} currentStep={currentStep} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          <div className="flex justify-between items-center gap-4 mt-4 pt-4 border-t border-border-custom">
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1"
            >
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                className="flex-1"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                className="flex-1 animate-pulse"
                disabled={!formData.agreeTerms}
              >
                Register & Sign In
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

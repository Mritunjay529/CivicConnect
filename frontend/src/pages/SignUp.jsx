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

  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    setErrorMessage('');
  };

  const handleNext = () => {
    setErrorMessage('');

    // Step 0 validation (Credentials)
    if (currentStep === 0) {
      if (!formData.email) {
        setErrorMessage('Please provide a valid email address.');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    // Step 1 validation (Profile Details)
    if (currentStep === 1) {
      if (role === 'Citizen' && !formData.fullName) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (role === 'NGO' && (!formData.ngoName || !formData.registrationNo || !formData.ngoContactName)) {
        setErrorMessage('Please complete all NGO organization details.');
        return;
      }
      if (role === 'Business' && (!formData.businessName || !formData.taxId || !formData.bizContactName)) {
        setErrorMessage('Please complete all corporate details.');
        return;
      }
      if (role === 'Municipal Authority' && (!formData.fullName || !formData.employeeId)) {
        setErrorMessage('Please fill in municipal authorization details.');
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrorMessage('');
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setErrorMessage('You must agree to the terms & conditions to proceed.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    // Role-to-param mapping
    const roleSlug = role === 'Municipal Authority' ? 'authority' : role.toLowerCase();

    const payload = {
      role: roleSlug,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || '',
      name: formData.fullName || formData.ngoContactName || formData.businessName || formData.email.split('@')[0],
      fullName: formData.fullName,
      orgName: formData.ngoName,
      registrationNumber: formData.registrationNo,
      contactPerson: formData.ngoContactName,
      businessName: formData.businessName,
      gstNumber: formData.taxId,
      csrFocusArea: formData.csrFocus,
      department: formData.dept,
      employeeId: formData.employeeId
    };

    let registeredUser = {
      email: formData.email,
      name: payload.name || 'User',
      role: role,
      points: 100,
      activityHistory: []
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok && result.success && result.data) {
        registeredUser = {
          ...result.data,
          id: result.data._id || result.data.id,
          _id: result.data._id || result.data.id,
          name: result.data.name || result.data.orgName || payload.name || payload.orgName || 'User',
          role: role,
          points: result.data.rewardPoints ?? result.data.points ?? 100,
          activityHistory: result.data.activityHistory || []
        };
        if (result.token) {
          localStorage.setItem('civic_token', result.token);
        }
        localStorage.setItem('civic_user', JSON.stringify(registeredUser));
      } else if (!response.ok && result.message) {
        setErrorMessage(result.message);
        setIsLoading(false);
        return;
      }
    } catch (fetchErr) {
      console.warn('Backend signup unavailable, proceeding with local registration:', fetchErr);
      localStorage.setItem('civic_user', JSON.stringify(registeredUser));
    }

    setIsLoading(false);
    onLoginSuccess(registeredUser);
    const roleNorm = (registeredUser.role || role).toLowerCase();
    if (roleNorm === 'citizen') navigate('/citizen-dashboard');
    else if (roleNorm === 'ngo') navigate('/ngo-dashboard');
    else if (roleNorm === 'business') navigate('/business-dashboard');
    else if (roleNorm === 'authority' || roleNorm === 'municipal authority') navigate('/municipal-dashboard');
    else navigate('/');
  };

  // Step 0 (Credentials)
  const renderStep0 = () => (
    <div className="flex flex-col gap-4">
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleChange}
        required
      />
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

  // Step 1 (Profile Details)
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
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
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
              label="Primary Neighborhood / Location"
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Govt Registration Number"
                type="text"
                name="registrationNo"
                placeholder="NGO-DEPT-998822"
                value={formData.registrationNo}
                onChange={handleChange}
                required
              />
              <Input
                label="Official Phone Number"
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
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
              label="Headquarters Address"
              type="text"
              name="ngoLocation"
              placeholder="45 Pine St, Metropolis"
              value={formData.ngoLocation}
              onChange={handleChange}
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
                label="Corporate Tax ID / GST"
                type="text"
                name="taxId"
                placeholder="12-3456789"
                value={formData.taxId}
                onChange={handleChange}
                required
              />
              <Input
                label="Corporate Phone"
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Point of Contact"
                type="text"
                name="bizContactName"
                placeholder="David Kim"
                value={formData.bizContactName}
                onChange={handleChange}
                required
              />
              <Input
                label="CSR Focus Sector"
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
                label="Municipal Employee ID"
                type="text"
                name="employeeId"
                placeholder="MUN-10029"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
              <Input
                label="Official Phone"
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <Input
                label="Authorized City"
                type="text"
                name="cityName"
                placeholder="Metropolis City"
                value={formData.cityName}
                onChange={handleChange}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Step 2 (Confirmation)
  const renderStep2 = () => (
    <div className="flex flex-col gap-6 text-center py-2">
      <div className="flex flex-col items-center gap-2">
        <span className="material-symbols-outlined text-[56px] text-primary bg-surface-low p-3 rounded-full">
          verified_user
        </span>
        <h4 className="text-lg font-bold text-secondary">Confirm Details</h4>
        <p className="text-xs text-secondary/70 max-w-[500px]">
          Please review your registration details below and accept the terms to create your account.
        </p>
      </div>

      <div className="bg-surface-low border border-border-custom p-4 rounded-custom-lg text-left">
        <h5 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Registration Summary</h5>
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-secondary/80">
          <p><span className="font-semibold">Role:</span> {role}</p>
          <p><span className="font-semibold">Email:</span> {formData.email}</p>
          {formData.phone && <p><span className="font-semibold">Phone:</span> {formData.phone}</p>}
          {role === 'Citizen' && (
            <>
              <p><span className="font-semibold">Name:</span> {formData.fullName}</p>
              <p><span className="font-semibold">Age:</span> {formData.age}</p>
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
              <p><span className="font-semibold">CSR Focus:</span> {formData.csrFocus}</p>
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
        label="I declare that the information provided is correct and agree to the CivicConnect Terms."
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
          <p className="text-sm text-secondary/60 mt-1">Step {currentStep + 1} of {steps.length}</p>
        </div>

        <ProgressStepper steps={steps} currentStep={currentStep} />

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-custom-lg text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          <div className="flex justify-between items-center gap-4 mt-2 pt-4 border-t border-border-custom">
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={currentStep === 0 || isLoading}
              className="flex-1"
            >
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
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
                className="flex-1"
                disabled={!formData.agreeTerms || isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

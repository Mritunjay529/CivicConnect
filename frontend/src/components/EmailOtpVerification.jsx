import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';

export default function EmailOtpVerification({
  email,
  purpose = 'signup', // 'signup' or 'login'
  onVerifiedSuccess,
  onCancel
}) {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  // Auto focus first digit on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for 60s resend cooldown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const fillOtp = (code) => {
    if (!code) return;
    const digits = code.toString().trim().slice(0, 6).split('');
    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      if (i < 6) newOtp[i] = d;
    });
    setOtpValues(newOtp);
    setErrorMsg('');
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleChange = (idx, value) => {
    setErrorMsg('');
    const cleanVal = value.replace(/\D/g, '');

    if (!cleanVal) {
      const newOtp = [...otpValues];
      newOtp[idx] = '';
      setOtpValues(newOtp);
      return;
    }

    // Handle full paste (e.g. copied 6-digit code from email)
    if (cleanVal.length > 1) {
      fillOtp(cleanVal);
      return;
    }

    const newOtp = [...otpValues];
    newOtp[idx] = cleanVal;
    setOtpValues(newOtp);

    if (cleanVal && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    setTimeout(() => {
      setIsLoading(false);
      onVerifiedSuccess({
        email,
        isEmailVerified: true,
        name: email.split('@')[0] || 'User',
        role: purpose === 'login' ? 'Citizen' : 'Citizen',
        points: 100,
        activityHistory: []
      });
    }, 500);
  };

  const handleResend = () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg('');
    setInfoMsg('');

    setTimeout(() => {
      setIsResending(false);
      setCooldown(60);
      setInfoMsg(`A fresh 6-digit verification code has been sent to ${email}.`);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-5 text-center py-1">
      <div className="flex flex-col items-center gap-2.5">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
        </div>
        <h3 className="text-2xl font-extrabold text-secondary">Verify Your Email</h3>
        <p className="text-sm text-secondary/70 max-w-[420px] leading-relaxed">
          We have sent a 6-digit verification code to: <br />
          <strong className="text-secondary font-bold text-base">{email}</strong>
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-custom-lg text-xs font-semibold text-center">
          {errorMsg}
        </div>
      )}

      {infoMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-custom-lg text-xs font-semibold text-center">
          {infoMsg}
        </div>
      )}

      <form onSubmit={handleVerify} className="flex flex-col gap-5">
        <div className="flex items-center justify-center gap-2.5 my-1">
          {otpValues.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              placeholder="•"
              className="w-12 h-14 text-center text-2xl font-black rounded-custom-lg bg-white border border-border-custom text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || otpValues.join('').length !== 6}
            className="w-full py-3 text-sm font-bold"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </Button>

          <div className="flex items-center justify-between text-xs text-secondary/70 pt-1 px-1">
            <span>Didn't receive the email?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className={`font-bold transition-all cursor-pointer ${
                cooldown > 0 || isResending
                  ? 'text-secondary/40 cursor-not-allowed'
                  : 'text-primary hover:underline'
              }`}
            >
              {isResending ? 'Resending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </button>
          </div>

          <p className="text-[11px] text-secondary/50 text-center leading-relaxed">
            💡 Please check your inbox and spam/junk folder for the verification code from CivicConnect.
          </p>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-secondary/60 hover:text-secondary mt-1 underline cursor-pointer"
            >
              ← Go back & change email
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

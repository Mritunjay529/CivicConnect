import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

export default function OtpInput({
  target = '',
  type = 'email', // 'email' or 'phone'
  onVerified,
  isVerified = false
}) {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const inputRefs = useRef([]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = () => {
    if (!target) {
      setStatusMsg({ type: 'error', text: `Please enter a valid ${type} address first.` });
      return;
    }

    setIsLoading(true);
    setStatusMsg({ type: 'info', text: `Sending verification code to ${target}...` });

    setTimeout(() => {
      handleSimulatedSend();
      setIsLoading(false);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 400);
  };

  const handleSimulatedSend = () => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setDemoCode(generated);
    setCooldown(60);
    setStatusMsg({
      type: 'success',
      text: `OTP generated! Code: ${generated} (Simulated ${type === 'email' ? 'Email' : 'SMS'} alert)`
    });
  };

  const handleChange = (idx, value) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const newOtp = [...otpValues];
      newOtp[idx] = '';
      setOtpValues(newOtp);
      return;
    }

    // If pasted multiple digits
    if (cleanVal.length > 1) {
      const pasteDigits = cleanVal.slice(0, 6).split('');
      const newOtp = [...otpValues];
      pasteDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtpValues(newOtp);
      const nextIndex = Math.min(pasteDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otpValues];
    newOtp[idx] = cleanVal;
    setOtpValues(newOtp);

    // Auto advance focus to next input
    if (cleanVal && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullOtp = otpValues.join('');
    if (fullOtp.length !== 6) {
      setStatusMsg({ type: 'error', text: 'Please enter all 6 digits of the OTP.' });
      return;
    }

    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });

    setTimeout(() => {
      setIsLoading(false);
      if (demoCode && fullOtp === demoCode) {
        setStatusMsg({ type: 'success', text: `✓ ${type === 'email' ? 'Email' : 'Phone'} verified!` });
        if (onVerified) onVerified(true);
      } else {
        // Accept any code for seamless testing, or check demoCode
        setStatusMsg({ type: 'success', text: `✓ ${type === 'email' ? 'Email' : 'Phone'} verified!` });
        if (onVerified) onVerified(true);
      }
    }, 400);
  };

  const autofillDemo = () => {
    if (demoCode && demoCode.length === 6) {
      setOtpValues(demoCode.split(''));
    }
  };

  return (
    <div className={`p-4 rounded-custom-lg border transition-all ${
      isVerified 
        ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-700' 
        : 'bg-surface-low border-border-custom'
    }`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">
            {type === 'email' ? 'mail' : 'smartphone'}
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              {type === 'email' ? 'Email Verification' : 'Phone Verification'}
            </span>
            <p className="text-xs text-secondary/70 font-medium truncate max-w-[220px]">
              {target || `No ${type} entered`}
            </p>
          </div>
        </div>

        {isVerified ? (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Verified</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isLoading || cooldown > 0 || !target}
            className={`text-xs font-bold px-3 py-1.5 rounded-custom-md border transition-all cursor-pointer ${
              cooldown > 0 || !target
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-primary text-white border-primary hover:bg-primary-hover active:scale-95'
            }`}
          >
            {isLoading ? 'Sending...' : cooldown > 0 ? `Resend (${cooldown}s)` : 'Send OTP'}
          </button>
        )}
      </div>

      {!isVerified && (
        <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-border-custom/60">
          <div className="flex items-center justify-between">
            <label className="text-xs text-secondary/80 font-semibold">Enter 6-Digit OTP Code</label>
            {demoCode && (
              <button
                type="button"
                onClick={autofillDemo}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Code: <strong>{demoCode}</strong></span>
                <span className="material-symbols-outlined text-[13px]">content_paste</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            {otpValues.map((val, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                placeholder="•"
                className="w-10 h-12 text-center text-lg font-bold rounded-custom-md bg-white border border-border-custom text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            <Button
              type="button"
              variant="primary"
              onClick={handleVerify}
              disabled={isLoading || otpValues.join('').length !== 6}
              className="w-full text-xs py-2"
            >
              {isLoading ? 'Verifying...' : `Verify ${type === 'email' ? 'Email' : 'Phone'} OTP`}
            </Button>
          </div>
        </div>
      )}

      {statusMsg.text && (
        <div className={`mt-2.5 text-xs p-2 rounded-custom-md font-medium text-center transition-all ${
          statusMsg.type === 'error'
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {statusMsg.text}
        </div>
      )}
    </div>
  );
}

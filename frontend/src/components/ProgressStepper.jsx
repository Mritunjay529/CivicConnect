import React from 'react';

export default function ProgressStepper({
  steps = [],
  currentStep = 0,
}) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-border-custom z-0" />
        
        {/* Active connector line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-300 z-0"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          
          return (
            <div key={idx} className="flex flex-col items-center z-10 relative flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-primary-on border-2 border-primary'
                    : isActive
                    ? 'bg-white text-primary border-2 border-primary shadow-sm'
                    : 'bg-white text-secondary/60 border-2 border-border-custom'
                }`}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap text-center ${
                  isActive ? 'text-primary' : 'text-secondary/60'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

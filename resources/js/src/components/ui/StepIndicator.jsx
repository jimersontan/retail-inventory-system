import React from 'react';
import { Check } from 'lucide-react';

const StepIndicator = ({ currentStep, steps = [] }) => {
    return (
        <div className="flex items-center w-full relative">
            {steps.map((step, index) => {
                const stepNum = index + 1;
                const isCompleted = currentStep > stepNum;
                const isCurrent = currentStep === stepNum;
                const isPending = currentStep < stepNum;

                const isLast = index === steps.length - 1;

                return (
                    <React.Fragment key={step.id}>
                        {/* Step Node */}
                        <div className="flex flex-col items-center relative z-10">
                            <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                                    isCompleted 
                                        ? 'bg-indigo-600 text-white' 
                                        : isCurrent 
                                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                                            : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                            </div>
                            <span 
                                className={`absolute top-10 text-xs font-medium text-center whitespace-nowrap ${
                                    isCompleted || isCurrent ? 'text-indigo-600' : 'text-slate-400'
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Line Connector */}
                        {!isLast && (
                            <div className="flex-1 h-0.5 mx-2 flex items-center">
                                <div 
                                    className={`w-full h-full transition-colors duration-300 ${
                                        isCompleted ? 'bg-indigo-600' : 'bg-slate-200'
                                    }`} 
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StepIndicator;

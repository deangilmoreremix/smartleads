import { useState, ReactNode } from 'react';
import { Check } from 'lucide-react';

interface Step {
  title: string;
  description?: string;
  content: ReactNode;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
}

export function MultiStepForm({ steps, onComplete }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps([...completedSteps, currentStep]);
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isCurrent = index === currentStep;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / steps.length}%` }}
                >
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      transition-all duration-300 z-10
                      ${
                        isCompleted
                          ? 'bg-green-500 text-white scale-110'
                          : isCurrent
                          ? 'bg-blue-500 text-white scale-125 shadow-lg'
                          : 'bg-gray-300 text-gray-600'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <p className="text-xs mt-2 text-gray-600 text-center">{step.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-6 min-h-[400px]">
        <div className="animate-in slide-in-from-right-4 fade-in" key={currentStep}>
          <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
          {steps[currentStep].description && (
            <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>
          )}
          <div>{steps[currentStep].content}</div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}

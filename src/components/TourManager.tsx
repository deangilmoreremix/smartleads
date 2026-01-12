import { useOnboarding, TourType } from '../contexts/OnboardingContext';
import TourStep from './TourStep';
import { tourDefinitions } from '../lib/tour-definitions';

export default function TourManager() {
  const {
    activeTour,
    currentStep,
    nextStep,
    prevStep,
    endTour,
    markTourCompleted
  } = useOnboarding();

  if (!activeTour || activeTour === 'welcome') return null;

  const steps = tourDefinitions[activeTour as keyof typeof tourDefinitions];
  if (!steps || steps.length === 0) return null;

  const handleNext = () => {
    if (currentStep >= steps.length - 1) {
      markTourCompleted(activeTour);
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  const handleSkip = () => {
    markTourCompleted(activeTour);
  };

  const step = steps[currentStep];
  if (!step) return null;

  return (
    <TourStep
      step={step}
      currentStep={currentStep + 1}
      totalSteps={steps.length}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkip={handleSkip}
      isLast={currentStep >= steps.length - 1}
    />
  );
}

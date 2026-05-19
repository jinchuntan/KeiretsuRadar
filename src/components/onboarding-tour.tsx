'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft, Search, BarChart3, Network, Shield, Activity, Zap } from 'lucide-react';

const TOUR_STORAGE_KEY = 'keiretsu-tour-completed';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'bottom' | 'top' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    targetId: 'tour-search',
    title: 'Signal Scan',
    description: 'Enter a supply chain, industry, or company name and hit "Run Scan" to begin collecting web intelligence.',
    icon: <Search className="h-4 w-4" />,
    position: 'bottom',
  },
  {
    targetId: 'tour-stats',
    title: 'Key Metrics',
    description: 'At-a-glance summary: total suppliers monitored, web signals collected, high-risk count, and average risk score.',
    icon: <BarChart3 className="h-4 w-4" />,
    position: 'bottom',
  },
  {
    targetId: 'tour-network',
    title: 'Keiretsu Network Map',
    description: 'Interactive supplier network graph. Node colors indicate risk level. Click any supplier node to view its detailed analysis.',
    icon: <Network className="h-4 w-4" />,
    position: 'top',
  },
  {
    targetId: 'tour-table',
    title: 'Supplier Risk Heatmap',
    description: 'All suppliers ranked by risk score. Click "Details" to explore individual risk breakdowns and evidence.',
    icon: <Shield className="h-4 w-4" />,
    position: 'top',
  },
  {
    targetId: 'tour-evidence',
    title: 'Evidence Trail',
    description: 'Live web signals sorted by recency. Each card shows the source, sentiment, and risk category.',
    icon: <Activity className="h-4 w-4" />,
    position: 'top',
  },
  {
    targetId: 'tour-actions',
    title: 'Recommended Actions',
    description: 'AI-generated procurement recommendations based on detected risks. Click through for the full boardroom brief.',
    icon: <Zap className="h-4 w-4" />,
    position: 'top',
  },
];

export function OnboardingTour({ active: externalActive }: { active?: boolean }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  // Activate on first visit or when externally triggered
  useEffect(() => {
    if (externalActive) {
      setCurrentStep(0);
      setIsActive(true);
      return;
    }
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      // Small delay to let the dashboard render first
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [externalActive]);

  const positionTooltip = useCallback(() => {
    if (!isActive) return;
    const step = tourSteps[currentStep];
    const el = document.getElementById(step.targetId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const tooltipW = 340;
    const gap = 12;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipW / 2;
        break;
      case 'top':
        top = rect.top - gap - 180;
        left = rect.left + rect.width / 2 - tooltipW / 2;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - 90;
        left = rect.right + gap;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - 90;
        left = rect.left - tooltipW - gap;
        break;
    }

    // Clamp within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipW - 16));
    top = Math.max(16, top);

    setTooltipStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipW}px`,
      zIndex: 10001,
    });

    // Scroll target into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [isActive, currentStep]);

  useEffect(() => {
    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip, true);
    return () => {
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip, true);
    };
  }, [positionTooltip]);

  function completeTour() {
    setIsActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  }

  function nextStep() {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  if (!isActive) return null;

  const step = tourSteps[currentStep];
  const targetEl = typeof document !== 'undefined' ? document.getElementById(step.targetId) : null;
  const targetRect = targetEl?.getBoundingClientRect();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0" y="0" width="100%" height="100%"
            fill="rgba(0,0,0,0.6)"
            mask="url(#tour-mask)"
            className="pointer-events-auto"
            onClick={completeTour}
          />
        </svg>

        {/* Highlight ring */}
        {targetRect && (
          <div
            className="absolute border-2 border-primary rounded-xl pointer-events-none animate-pulse"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div style={tooltipStyle} className="pointer-events-auto">
        <div className="rounded-xl border border-border bg-card shadow-2xl shadow-black/50 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {step.icon}
              </div>
              <h3 className="font-semibold text-sm">{step.title}</h3>
            </div>
            <button onClick={completeTour} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {tourSteps.length}
            </span>
            <div className="flex items-center gap-2">
              {currentStep === 0 ? (
                <Button variant="ghost" size="sm" onClick={completeTour} className="text-xs h-7">
                  Skip tour
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={prevStep} className="text-xs h-7 gap-1">
                  <ArrowLeft className="h-3 w-3" /> Back
                </Button>
              )}
              <Button size="sm" onClick={nextStep} className="text-xs h-7 gap-1">
                {currentStep < tourSteps.length - 1 ? (
                  <>Next <ArrowRight className="h-3 w-3" /></>
                ) : (
                  'Finish'
                )}
              </Button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/** Reset tour so it shows again on next visit */
export function resetTour() {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}

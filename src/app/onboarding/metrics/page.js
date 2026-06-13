"use client";
/**
 * Onboarding Metrics — Admin Dashboard Page
 * ============================================
 * Shows conversion funnel and KPIs for onboarding flow.
 * Accessible at /onboarding/metrics
 */
import OnboardingFunnel from '@/components/onboarding/OnboardingFunnel';

export default function OnboardingMetricsPage() {
  return (
    <div className="animate-fade-in py-8 px-4">
      <OnboardingFunnel />
    </div>
  );
}

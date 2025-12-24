
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingList } from './Onboarding/OnboardingList';
import { OnboardingDetail } from './Onboarding/OnboardingDetail';

export const Onboarding: React.FC = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/" element={<OnboardingList />} />
        <Route path=":id" element={<OnboardingDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

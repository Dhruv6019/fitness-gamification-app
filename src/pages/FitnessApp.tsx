import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { WorkoutsPage } from '@/pages/WorkoutsPage';
import { ChallengesPage } from '@/pages/ChallengesPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { RewardsPage } from '@/pages/RewardsPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { WorkoutForm } from '@/components/workout/WorkoutForm';

export const FitnessApp: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-workout':
        return (
          <div className="container mx-auto p-6">
            <WorkoutForm 
              onWorkoutAdded={() => setCurrentPage('dashboard')}
              onClose={() => setCurrentPage('dashboard')}
            />
          </div>
        );
      case 'workouts':
        return <WorkoutsPage />;
      case 'challenges':
        return <ChallengesPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'rewards':
        return <RewardsPage />;
      case 'progress':
      case 'social':
      case 'profile':
        return (
          <div className="container mx-auto p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
              <p className="text-muted-foreground">
                This feature is being developed. Check back soon!
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderContent()}
    </AppLayout>
  );
};
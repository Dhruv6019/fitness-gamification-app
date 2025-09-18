import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Card } from '@/components/ui/card';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">FitGam</h1>
          <p className="text-muted-foreground">Transform your fitness journey into an exciting game</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Auth Form */}
          <div className="order-2 lg:order-1">
            {isLogin ? (
              <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
            ) : (
              <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </div>
          
          {/* Features Preview */}
          <div className="order-1 lg:order-2 space-y-6">
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
              <h3 className="text-xl font-semibold mb-4">🏆 Gamified Fitness</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Earn points and level up with every workout
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Unlock badges for achieving milestones
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Compete with friends on leaderboards
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Join exciting fitness challenges
                </li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-gradient-to-r from-secondary/10 to-accent/10">
              <h3 className="text-xl font-semibold mb-4">📊 Track Everything</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Log workouts with detailed metrics
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Monitor progress with beautiful charts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Set and achieve fitness goals
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Get personalized insights
                </li>
              </ul>
            </Card>
            
            <Card className="p-6 bg-gradient-to-r from-accent/10 to-primary/10">
              <h3 className="text-xl font-semibold mb-4">🎁 Rewards System</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Redeem points for exclusive rewards
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Unlock premium features and content
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Get discounts at partner locations
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
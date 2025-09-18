import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  Flame, 
  Clock, 
  TrendingUp, 
  Award,
  Activity,
  Calendar,
  Users,
  Gift
} from 'lucide-react';
import { getWorkouts, getChallenges, getUserProgress, getNotifications } from '@/utils/localStorage';
import { calculateLevel, getPointsForNextLevel } from '@/utils/gamification';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Workout, Challenge, UserProgress as UserProgressType } from '@/types/fitness';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressType[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    if (user) {
      const allWorkouts = getWorkouts().filter(w => w.userId === user.id);
      setWorkouts(allWorkouts);
      
      // Get recent workouts (last 7 days)
      const sevenDaysAgo = subDays(new Date(), 7);
      const recent = allWorkouts
        .filter(w => new Date(w.date) >= sevenDaysAgo)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      setRecentWorkouts(recent);
      
      const allChallenges = getChallenges().filter(c => c.isActive);
      setChallenges(allChallenges);
      
      const progress = getUserProgress().filter(p => p.userId === user.id);
      setUserProgress(progress);
    }
  }, [user]);

  if (!user) return null;

  const currentLevel = calculateLevel(user.points);
  const pointsForNext = getPointsForNextLevel(user.points);
  const levelProgress = ((user.points % 1000) / 1000) * 100;

  // Calculate weekly stats
  const weeklyWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    const weekAgo = subDays(new Date(), 7);
    return workoutDate >= weekAgo;
  });

  const weeklyCalories = weeklyWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const weeklyDuration = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}! 👋</h1>
          <p className="text-muted-foreground">Ready to crush your fitness goals today?</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-bold text-primary">{user.workoutStreak} days</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-2xl font-bold text-primary">{currentLevel}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.points.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {pointsForNext} points to level {currentLevel + 1}
            </p>
            <Progress value={levelProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              {weeklyWorkouts.length} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalCaloriesBurned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {weeklyCalories} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(weeklyDuration / 60)}h {weeklyDuration % 60}m</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workouts">Recent Workouts</TabsTrigger>
          <TabsTrigger value="challenges">Active Challenges</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest workouts this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentWorkouts.length > 0 ? (
                  recentWorkouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{workout.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(workout.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{workout.duration}min</p>
                        <p className="text-xs text-muted-foreground">{workout.caloriesBurned} cal</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent workouts</p>
                    <p className="text-sm text-muted-foreground">Start tracking your fitness journey!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge Progress</CardTitle>
                <CardDescription>Your active challenges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenges.slice(0, 3).map((challenge) => {
                  const progress = userProgress.find(p => p.challengeId === challenge.id);
                  const progressPercent = progress?.progress || 0;
                  
                  return (
                    <div key={challenge.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{challenge.title}</p>
                        <Badge variant={progressPercent >= 100 ? "default" : "secondary"}>
                          {progressPercent >= 100 ? "Complete" : `${Math.round(progressPercent)}%`}
                        </Badge>
                      </div>
                      <Progress value={Math.min(progressPercent, 100)} />
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                    </div>
                  );
                })}
                
                {challenges.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active challenges</p>
                    <p className="text-sm text-muted-foreground">Join a challenge to boost your motivation!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
              <CardDescription>Your workout history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workouts.slice(0, 10).map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{workout.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(workout.date), 'EEEE, MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{workout.duration}</p>
                        <p className="text-muted-foreground">minutes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{workout.caloriesBurned}</p>
                        <p className="text-muted-foreground">calories</p>
                      </div>
                      {workout.distance && (
                        <div className="text-center">
                          <p className="font-medium">{workout.distance}</p>
                          <p className="text-muted-foreground">km</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="font-medium">Level {workout.intensityLevel}</p>
                        <p className="text-muted-foreground">intensity</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => {
              const progress = userProgress.find(p => p.challengeId === challenge.id);
              const progressPercent = progress?.progress || 0;
              const isCompleted = progressPercent >= 100;
              
              return (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {challenge.title}
                      <Badge variant={isCompleted ? "default" : "secondary"}>
                        {isCompleted ? "Complete" : "Active"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <Progress value={Math.min(progressPercent, 100)} />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span>{challenge.bonusPoints} points</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{challenge.duration} days</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{challenge.participants.length} participants</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
              <CardDescription>Achievements you've unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              {user.badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Earned {format(new Date(badge.earnedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No badges yet</p>
                  <p className="text-sm text-muted-foreground">Complete workouts and challenges to earn your first badge!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
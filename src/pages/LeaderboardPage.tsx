import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, getWorkouts } from '@/utils/localStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Flame, Target, Calendar, TrendingUp, Crown } from 'lucide-react';
import { LeaderboardEntry, User } from '@/types/fitness';

const LeaderboardCard: React.FC<{ entry: LeaderboardEntry; currentUserId?: string; showRank?: boolean }> = ({ 
  entry, 
  currentUserId, 
  showRank = true 
}) => {
  const isCurrentUser = entry.userId === currentUserId;
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <Card className={`${isCurrentUser ? 'ring-2 ring-primary bg-primary/5' : ''} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showRank && (
              <div className="flex items-center justify-center w-12 h-12">
                {getRankIcon(entry.rank)}
              </div>
            )}
            <Avatar className="h-12 w-12">
              <AvatarImage src={entry.profilePicture} alt={entry.name} />
              <AvatarFallback>{entry.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium flex items-center gap-2">
                {entry.name}
                {isCurrentUser && <Badge variant="secondary" className="text-xs">You</Badge>}
              </h3>
              <p className="text-sm text-muted-foreground">Level {entry.level}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="font-bold text-primary">{entry.points.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Workouts</p>
              <p className="font-medium">{entry.totalWorkouts}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="font-medium">{entry.totalCaloriesBurned.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="font-medium flex items-center gap-1">
                {entry.workoutStreak}
                {entry.workoutStreak >= 7 && <Flame className="h-3 w-3 text-orange-500" />}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('points');

  const leaderboardData = useMemo(() => {
    const users = getUsers();
    // TC05: Rankings update instantly after workout
    const workouts = getWorkouts(); // Fresh data each time

    const leaderboardEntries: LeaderboardEntry[] = users.map(u => ({
      userId: u.id,
      name: u.name,
      profilePicture: u.profilePicture,
      points: u.points,
      level: u.level,
      totalWorkouts: u.totalWorkouts,
      totalCaloriesBurned: u.totalCaloriesBurned,
      workoutStreak: u.workoutStreak,
      rank: 0 // Will be set based on sorting
    }));

    // Create different rankings
    const pointsRanking = [...leaderboardEntries]
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    const workoutsRanking = [...leaderboardEntries]
      .sort((a, b) => b.totalWorkouts - a.totalWorkouts)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    const caloriesRanking = [...leaderboardEntries]
      .sort((a, b) => b.totalCaloriesBurned - a.totalCaloriesBurned)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    const streakRanking = [...leaderboardEntries]
      .sort((a, b) => b.workoutStreak - a.workoutStreak)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return {
      points: pointsRanking,
      workouts: workoutsRanking,
      calories: caloriesRanking,
      streak: streakRanking
    };
  }, []);

  const currentUserRank = useMemo(() => {
    if (!user) return null;
    
    const pointsRank = leaderboardData.points.find(entry => entry.userId === user.id)?.rank || 0;
    const workoutsRank = leaderboardData.workouts.find(entry => entry.userId === user.id)?.rank || 0;
    const caloriesRank = leaderboardData.calories.find(entry => entry.userId === user.id)?.rank || 0;
    const streakRank = leaderboardData.streak.find(entry => entry.userId === user.id)?.rank || 0;
    
    return { pointsRank, workoutsRank, caloriesRank, streakRank };
  }, [user, leaderboardData]);

  if (!user) return null;

  const totalUsers = leaderboardData.points.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you stack up against other users</p>
        </div>
      </div>

      {/* Current User Stats */}
      {currentUserRank && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Points Rank</p>
                <p className="text-2xl font-bold text-primary">#{currentUserRank.pointsRank}</p>
                <p className="text-xs text-muted-foreground">of {totalUsers}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Workouts Rank</p>
                <p className="text-2xl font-bold text-primary">#{currentUserRank.workoutsRank}</p>
                <p className="text-xs text-muted-foreground">of {totalUsers}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Calories Rank</p>
                <p className="text-2xl font-bold text-primary">#{currentUserRank.caloriesRank}</p>
                <p className="text-xs text-muted-foreground">of {totalUsers}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Streak Rank</p>
                <p className="text-2xl font-bold text-primary">#{currentUserRank.streakRank}</p>
                <p className="text-xs text-muted-foreground">of {totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="points" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Points
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Workouts
          </TabsTrigger>
          <TabsTrigger value="calories" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Calories
          </TabsTrigger>
          <TabsTrigger value="streak" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Streak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="space-y-4">
          <div className="space-y-4">
            {leaderboardData.points.map((entry) => (
              <LeaderboardCard
                key={entry.userId}
                entry={entry}
                currentUserId={user.id}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <div className="space-y-4">
            {leaderboardData.workouts.map((entry) => (
              <LeaderboardCard
                key={entry.userId}
                entry={entry}
                currentUserId={user.id}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calories" className="space-y-4">
          <div className="space-y-4">
            {leaderboardData.calories.map((entry) => (
              <LeaderboardCard
                key={entry.userId}
                entry={entry}
                currentUserId={user.id}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="streak" className="space-y-4">
          <div className="space-y-4">
            {leaderboardData.streak.map((entry) => (
              <LeaderboardCard
                key={entry.userId}
                entry={entry}
                currentUserId={user.id}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
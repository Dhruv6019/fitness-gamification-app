import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getChallenges, getWorkouts, getUserProgress, updateUserProgress } from '@/utils/localStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Clock, Users, Calendar, CheckCircle, Award } from 'lucide-react';
import { format, parseISO, isValid, isAfter, isBefore } from 'date-fns';
import { Challenge, UserProgress as UserProgressType, Workout } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';

const safeFormatDate = (dateInput: string | Date, formatString: string = 'MMM dd, yyyy') => {
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, formatString);
  } catch {
    return 'Invalid date';
  }
};

const challengeTypeColors = {
  distance: 'bg-blue-100 text-blue-800',
  duration: 'bg-green-100 text-green-800',
  frequency: 'bg-purple-100 text-purple-800',
  calories: 'bg-red-100 text-red-800'
};

const challengeTypeIcons = {
  distance: '🏃‍♂️',
  duration: '⏱️',
  frequency: '🔄',
  calories: '🔥'
};

export const ChallengesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('available');

  const challenges = getChallenges();
  const userProgress = getUserProgress();
  const userWorkouts = user ? getWorkouts().filter(w => w.userId === user.id) : [];

  const calculateChallengeProgress = (challenge: Challenge): number => {
    if (!user) return 0;

    const existingProgress = userProgress.find(
      p => p.userId === user.id && p.challengeId === challenge.id
    );

    if (existingProgress?.completed) return 100;

    const challengeStart = new Date(challenge.startDate);
    const challengeEnd = new Date(challenge.endDate);
    
    const relevantWorkouts = userWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= challengeStart && workoutDate <= challengeEnd;
    });

    let progress = 0;
    
    switch (challenge.type) {
      case 'frequency':
        progress = (relevantWorkouts.length / challenge.target) * 100;
        break;
      case 'duration':
        const totalDuration = relevantWorkouts.reduce((sum, w) => sum + w.duration, 0);
        progress = (totalDuration / challenge.target) * 100;
        break;
      case 'distance':
        const totalDistance = relevantWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);
        progress = (totalDistance / challenge.target) * 100;
        break;
      case 'calories':
        const totalCalories = relevantWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
        progress = (totalCalories / challenge.target) * 100;
        break;
    }

    return Math.min(progress, 100);
  };

  const joinChallenge = (challengeId: string) => {
    if (!user) return;
    
    // Update challenge participants (in a real app, this would be done on the backend)
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge && !challenge.participants.includes(user.id)) {
      challenge.participants.push(user.id);
      
      toast({
        title: "Challenge joined! 🎯",
        description: `You've joined "${challenge.title}". Good luck!`,
      });
    }
  };

  const { availableChallenges, joinedChallenges, completedChallenges } = useMemo(() => {
    if (!user) return { availableChallenges: [], joinedChallenges: [], completedChallenges: [] };

    const now = new Date();
    
    const available = challenges.filter(challenge => {
      const endDate = new Date(challenge.endDate);
      const isActive = isAfter(endDate, now);
      const hasJoined = challenge.participants.includes(user.id);
      const progress = calculateChallengeProgress(challenge);
      
      return isActive && !hasJoined && progress < 100;
    });

    const joined = challenges.filter(challenge => {
      const endDate = new Date(challenge.endDate);
      const isActive = isAfter(endDate, now);
      const hasJoined = challenge.participants.includes(user.id);
      const progress = calculateChallengeProgress(challenge);
      
      return isActive && hasJoined && progress < 100;
    });

    const completed = challenges.filter(challenge => {
      const hasJoined = challenge.participants.includes(user.id);
      const progress = calculateChallengeProgress(challenge);
      
      return hasJoined && progress >= 100;
    });

    return { availableChallenges: available, joinedChallenges: joined, completedChallenges: completed };
  }, [user, challenges, userProgress, userWorkouts]);

  if (!user) return null;

  const ChallengeCard: React.FC<{ challenge: Challenge; showJoinButton?: boolean; showProgress?: boolean; completed?: boolean }> = ({ 
    challenge, 
    showJoinButton = false, 
    showProgress = false,
    completed = false 
  }) => {
    const progress = calculateChallengeProgress(challenge);
    const isExpired = isBefore(new Date(challenge.endDate), new Date());

    return (
      <Card className={`${completed ? 'bg-green-50 border-green-200' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{challengeTypeIcons[challenge.type]}</span>
                {challenge.title}
                {completed && <CheckCircle className="h-5 w-5 text-green-600" />}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{challenge.description}</p>
            </div>
            <Badge className={challengeTypeColors[challenge.type]}>
              {challenge.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>
                {challenge.target} {challenge.type === 'frequency' ? 'workouts' : 
                 challenge.type === 'duration' ? 'minutes' :
                 challenge.type === 'distance' ? 'km' : 'calories'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.duration} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.participants.length} joined</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.bonusPoints} points</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Ends: {safeFormatDate(challenge.endDate)}</span>
            {isExpired && <Badge variant="secondary">Expired</Badge>}
          </div>

          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {showJoinButton && !isExpired && (
            <Button 
              onClick={() => joinChallenge(challenge.id)}
              className="w-full"
            >
              Join Challenge
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fitness Challenges</h1>
          <p className="text-muted-foreground">Join challenges and earn bonus points</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{availableChallenges.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{joinedChallenges.length}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedChallenges.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available ({availableChallenges.length})</TabsTrigger>
          <TabsTrigger value="joined">In Progress ({joinedChallenges.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedChallenges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No available challenges</h3>
                <p className="text-muted-foreground">Check back later for new challenges!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availableChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} showJoinButton />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined" className="space-y-4">
          {joinedChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No active challenges</h3>
                <p className="text-muted-foreground">Join a challenge to start earning bonus points!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {joinedChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} showProgress />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No completed challenges</h3>
                <p className="text-muted-foreground">Complete a challenge to see it here!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} showProgress completed />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
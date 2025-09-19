import { User, Workout, Badge, Notification } from '@/types/fitness';
import { addNotification, updateUser, getCurrentUser } from './localStorage';

export const calculateWorkoutPoints = (workout: Workout): number => {
  let points = 0;
  
  // Base points for duration (1 point per minute)
  points += workout.duration;
  
  // Bonus points for intensity
  points += workout.intensityLevel * 10;
  
  // Bonus points for calories burned (1 point per 10 calories)
  points += Math.floor(workout.caloriesBurned / 10);
  
  // Distance bonus for cardio workouts (10 points per km)
  if (workout.distance && ['running', 'cycling', 'walking'].includes(workout.type)) {
    points += Math.floor(workout.distance * 10);
  }
  
  return Math.max(points, 10); // Minimum 10 points
};

export const calculateLevel = (points: number): number => {
  // Level formula: every 1000 points = 1 level
  return Math.floor(points / 1000) + 1;
};

export const getPointsForNextLevel = (currentPoints: number): number => {
  const currentLevel = calculateLevel(currentPoints);
  return currentLevel * 1000 - currentPoints;
};

export const checkAndAwardBadges = (user: User, workout?: Workout): Badge[] => {
  const newBadges: Badge[] = [];
  const existingBadgeIds = user.badges.map(b => b.id);

  // Streak badges
  if (user.workoutStreak >= 7 && !existingBadgeIds.includes('streak_7')) {
    newBadges.push({
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Complete 7 days in a row',
      icon: '🔥',
      requirement: '7-day workout streak',
      earnedAt: new Date().toISOString(),
      category: 'streak'
    });
  }

  if (user.workoutStreak >= 30 && !existingBadgeIds.includes('streak_30')) {
    newBadges.push({
      id: 'streak_30',
      name: 'Monthly Master',
      description: 'Complete 30 days in a row',
      icon: '🏆',
      requirement: '30-day workout streak',
      earnedAt: new Date().toISOString(),
      category: 'streak'
    });
  }

  // Milestone badges
  if (user.totalWorkouts >= 10 && !existingBadgeIds.includes('workouts_10')) {
    newBadges.push({
      id: 'workouts_10',
      name: 'Getting Started',
      description: 'Complete 10 workouts',
      icon: '💪',
      requirement: '10 total workouts',
      earnedAt: new Date().toISOString(),
      category: 'milestone'
    });
  }

  if (user.totalWorkouts >= 50 && !existingBadgeIds.includes('workouts_50')) {
    newBadges.push({
      id: 'workouts_50',
      name: 'Fitness Enthusiast',
      description: 'Complete 50 workouts',
      icon: '🌟',
      requirement: '50 total workouts',
      earnedAt: new Date().toISOString(),
      category: 'milestone'
    });
  }

  if (user.totalWorkouts >= 100 && !existingBadgeIds.includes('workouts_100')) {
    newBadges.push({
      id: 'workouts_100',
      name: 'Fitness Beast',
      description: 'Complete 100 workouts',
      icon: '🦁',
      requirement: '100 total workouts',
      earnedAt: new Date().toISOString(),
      category: 'milestone'
    });
  }

  if (user.totalCaloriesBurned >= 10000 && !existingBadgeIds.includes('calories_10000')) {
    newBadges.push({
      id: 'calories_10000',
      name: 'Calorie Crusher',
      description: 'Burn 10,000 calories',
      icon: '🔥',
      requirement: '10,000 calories burned',
      earnedAt: new Date().toISOString(),
      category: 'milestone'
    });
  }

  // Level badges
  const currentLevel = calculateLevel(user.points);
  
  // TC04: 1,000 points badge
  if (user.points >= 1000 && !existingBadgeIds.includes('points_1000')) {
    newBadges.push({
      id: 'points_1000',
      name: 'Point Master',
      description: 'Earn 1,000 points',
      icon: '💎',
      requirement: '1,000 points earned',
      earnedAt: new Date().toISOString(),
      category: 'milestone'
    });
  }
  
  if (currentLevel >= 5 && !existingBadgeIds.includes('level_5')) {
    newBadges.push({
      id: 'level_5',
      name: 'Rising Star',
      description: 'Reach level 5',
      icon: '⭐',
      requirement: 'Reach level 5',
      earnedAt: new Date().toISOString(),
      category: 'milestone'
    });
  }

  if (currentLevel >= 10 && !existingBadgeIds.includes('level_10')) {
    newBadges.push({
      id: 'level_10',
      name: 'Elite Athlete',
      description: 'Reach level 10',
      icon: '👑',
      requirement: 'Reach level 10',
      earnedAt: new Date().toISOString(),
      category: 'milestone'
    });
  }

  // Workout type specific badges
  if (workout) {
    const workoutTypeBadgeId = `first_${workout.type}`;
    if (!existingBadgeIds.includes(workoutTypeBadgeId)) {
      const workoutTypeNames: Record<string, string> = {
        running: 'First Run',
        cycling: 'First Ride',
        gym: 'First Lift',
        yoga: 'First Flow',
        swimming: 'First Swim',
        walking: 'First Walk',
        basketball: 'First Game',
        football: 'First Match',
        tennis: 'First Set'
      };

      const workoutTypeIcons: Record<string, string> = {
        running: '🏃',
        cycling: '🚴',
        gym: '🏋️',
        yoga: '🧘',
        swimming: '🏊',
        walking: '🚶',
        basketball: '⛹️',
        football: '⚽',
        tennis: '🎾'
      };

      if (workoutTypeNames[workout.type]) {
        newBadges.push({
          id: workoutTypeBadgeId,
          name: workoutTypeNames[workout.type],
          description: `Complete your first ${workout.type} workout`,
          icon: workoutTypeIcons[workout.type] || '🏃',
          requirement: `First ${workout.type} workout`,
          earnedAt: new Date().toISOString(),
          category: 'milestone'
        });
      }
    }
  }

  return newBadges;
};

export const updateUserWithWorkout = (workout: Workout): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const points = calculateWorkoutPoints(workout);
  const workoutDate = new Date(workout.date).toDateString();
  const lastWorkoutDate = currentUser.lastWorkoutDate ? new Date(currentUser.lastWorkoutDate).toDateString() : null;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  // Calculate streak
  let newStreak = currentUser.workoutStreak;
  let streakReset = false;
  
  if (lastWorkoutDate === yesterday || !lastWorkoutDate) {
    newStreak = currentUser.workoutStreak + 1;
  } else if (lastWorkoutDate !== workoutDate) {
    streakReset = currentUser.workoutStreak > 0; // TC08: Track if streak was reset
    newStreak = 1; // Reset streak if there's a gap
  }

  const updatedUser: User = {
    ...currentUser,
    points: currentUser.points + points,
    level: calculateLevel(currentUser.points + points),
    workoutStreak: newStreak,
    lastWorkoutDate: workout.date,
    totalWorkouts: currentUser.totalWorkouts + 1,
    totalCaloriesBurned: currentUser.totalCaloriesBurned + workout.caloriesBurned
  };

  // Check for new badges
  const newBadges = checkAndAwardBadges(updatedUser, workout);
  updatedUser.badges = [...updatedUser.badges, ...newBadges];

  updateUser(updatedUser);

  // TC08: Streak reset notification
  if (streakReset) {
    addNotification({
      id: `streak_reset_${Date.now()}`,
      userId: currentUser.id,
      type: 'streak_warning',
      title: 'Streak Reset',
      message: `Your ${currentUser.workoutStreak}-day streak has been reset. Start a new one today!`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  // Create notifications for new badges
  newBadges.forEach(badge => {
    addNotification({
      id: `badge_${badge.id}_${Date.now()}`,
      userId: currentUser.id,
      type: 'badge_earned',
      title: 'New Badge Earned!',
      message: `You've earned the "${badge.name}" badge!`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  // Level up notification
  if (updatedUser.level > currentUser.level) {
    addNotification({
      id: `level_up_${Date.now()}`,
      userId: currentUser.id,
      type: 'badge_earned',
      title: 'Level Up!',
      message: `Congratulations! You've reached level ${updatedUser.level}!`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }
};

export const generateMotivationalMessages = (user: User): string[] => {
  const messages = [
    `You're on a ${user.workoutStreak}-day streak! Keep it up!`,
    `You've burned ${user.totalCaloriesBurned.toLocaleString()} calories total! Amazing!`,
    `Level ${user.level} achieved! You're unstoppable!`,
    `${user.totalWorkouts} workouts completed! You're building great habits!`,
    `${user.points.toLocaleString()} points earned! Your dedication shows!`
  ];

  return messages.filter(() => Math.random() > 0.5).slice(0, 2);
};
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  age: number;
  weight: number;
  height: number;
  fitnessGoals: string[];
  activityPreferences: string[];
  points: number;
  level: number;
  badges: Badge[];
  joinedChallenges: string[];
  friends: string[];
  workoutStreak: number;
  lastWorkoutDate?: string;
  totalWorkouts: number;
  totalCaloriesBurned: number;
  createdAt: string;
}

export interface Workout {
  id: string;
  userId: string;
  type: WorkoutType;
  duration: number; // in minutes
  distance?: number; // in kilometers
  caloriesBurned: number;
  intensityLevel: 1 | 2 | 3 | 4 | 5;
  date: string;
  createdAt: string;
}

export type WorkoutType = 'running' | 'cycling' | 'gym' | 'yoga' | 'swimming' | 'walking' | 'basketball' | 'football' | 'tennis' | 'other';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'distance' | 'duration' | 'frequency' | 'calories';
  target: number;
  bonusPoints: number;
  duration: number; // in days
  startDate: string;
  endDate: string;
  participants: string[];
  isActive: boolean;
  createdBy: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earnedAt: string;
  category: 'streak' | 'milestone' | 'challenge' | 'social';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'workout_reminder' | 'challenge_complete' | 'badge_earned' | 'streak_warning' | 'friend_request';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'virtual' | 'discount' | 'premium';
  category: string;
  isRedeemed: boolean;
}

export interface UserProgress {
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  profilePicture?: string;
  points: number;
  level: number;
  totalWorkouts: number;
  totalCaloriesBurned: number;
  workoutStreak: number;
  rank: number;
}
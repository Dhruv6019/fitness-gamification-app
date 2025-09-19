import { User, Workout, Challenge, Badge, Notification, Reward, UserProgress } from '@/types/fitness';

const STORAGE_KEYS = {
  USERS: 'fitness_users',
  CURRENT_USER: 'fitness_current_user',
  WORKOUTS: 'fitness_workouts',
  CHALLENGES: 'fitness_challenges',
  NOTIFICATIONS: 'fitness_notifications',
  REWARDS: 'fitness_rewards',
  USER_PROGRESS: 'fitness_user_progress',
} as const;

// Generic storage functions
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// User management
export const getUsers = (): User[] => getFromStorage(STORAGE_KEYS.USERS, []);
export const setUsers = (users: User[]): void => setToStorage(STORAGE_KEYS.USERS, users);

export const getCurrentUser = (): User | null => getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
export const setCurrentUser = (user: User | null): void => setToStorage(STORAGE_KEYS.CURRENT_USER, user);

export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  setUsers(users);
};

export const updateUser = (updatedUser: User): void => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === updatedUser.id);
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    setUsers(users);
    
    // Update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  }
};

// Workout management
export const getWorkouts = (): Workout[] => getFromStorage(STORAGE_KEYS.WORKOUTS, []);
export const setWorkouts = (workouts: Workout[]): void => setToStorage(STORAGE_KEYS.WORKOUTS, workouts);

export const addWorkout = (workout: Workout): void => {
  const workouts = getWorkouts();
  workouts.push(workout);
  setWorkouts(workouts);
};

export const updateWorkout = (updatedWorkout: Workout): void => {
  const workouts = getWorkouts();
  const workoutIndex = workouts.findIndex(w => w.id === updatedWorkout.id);
  if (workoutIndex !== -1) {
    workouts[workoutIndex] = updatedWorkout;
    setWorkouts(workouts);
  }
};

export const deleteWorkout = (workoutId: string): void => {
  const workouts = getWorkouts();
  const filteredWorkouts = workouts.filter(w => w.id !== workoutId);
  setWorkouts(filteredWorkouts);
};

// Challenge management
export const getChallenges = (): Challenge[] => getFromStorage(STORAGE_KEYS.CHALLENGES, []);
export const setChallenges = (challenges: Challenge[]): void => setToStorage(STORAGE_KEYS.CHALLENGES, challenges);

export const addChallenge = (challenge: Challenge): void => {
  const challenges = getChallenges();
  challenges.push(challenge);
  setChallenges(challenges);
};

// Notifications
export const getNotifications = (): Notification[] => getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
export const setNotifications = (notifications: Notification[]): void => setToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);

export const addNotification = (notification: Notification): void => {
  const notifications = getNotifications();
  notifications.unshift(notification); // Add to beginning
  setNotifications(notifications);
};

// Rewards
export const getRewards = (): Reward[] => getFromStorage(STORAGE_KEYS.REWARDS, []);
export const setRewards = (rewards: Reward[]): void => setToStorage(STORAGE_KEYS.REWARDS, rewards);

// User Progress
export const getUserProgress = (): UserProgress[] => getFromStorage(STORAGE_KEYS.USER_PROGRESS, []);
export const setUserProgress = (progress: UserProgress[]): void => setToStorage(STORAGE_KEYS.USER_PROGRESS, progress);

export const updateUserProgress = (userId: string, challengeId: string, progress: number): void => {
  const allProgress = getUserProgress();
  const existingIndex = allProgress.findIndex(p => p.userId === userId && p.challengeId === challengeId);
  
  if (existingIndex !== -1) {
    allProgress[existingIndex].progress = progress;
    if (progress >= 100) {
      allProgress[existingIndex].completed = true;
      allProgress[existingIndex].completedAt = new Date().toISOString();
    }
  } else {
    allProgress.push({
      userId,
      challengeId,
      progress,
      completed: progress >= 100,
      completedAt: progress >= 100 ? new Date().toISOString() : undefined
    });
  }
  
  setUserProgress(allProgress);
};

// Initialize default data
export const initializeDefaultData = (): void => {
  // Initialize demo user if no users exist
  const users = getUsers();
  if (users.length === 0) {
    const demoUser: User = {
      id: 'demo_user_123',
      email: 'demo@fitgam.com',
      name: 'Demo User',
      profilePicture: '',
      age: 25,
      weight: 70,
      height: 175,
      fitnessGoals: ['weight_loss', 'muscle_gain'],
      activityPreferences: ['running', 'gym', 'yoga'],
      points: 150,
      level: 2,
      badges: [
        {
          id: 'early_bird',
          name: 'Early Bird',
          description: 'Workout before 7 AM',
          icon: '🌅',
          requirement: 'Complete a workout before 7 AM',
          earnedAt: new Date('2024-01-15').toISOString(),
          category: 'streak'
        },
        {
          id: 'consistency_champion',
          name: 'Consistency Champion',
          description: 'Maintain a 7-day workout streak',
          icon: '🏆',
          requirement: 'Complete workouts for 7 consecutive days',
          earnedAt: new Date('2024-01-20').toISOString(),
          category: 'streak'
        }
      ],
      joinedChallenges: [],
      friends: [],
      workoutStreak: 5,
      totalWorkouts: 12,
      totalCaloriesBurned: 3600,
      createdAt: new Date('2024-01-01').toISOString()
    };
    setUsers([demoUser]);
  }

  // Initialize default data
  // Initialize default challenges if none exist
  const challenges = getChallenges();
  if (challenges.length === 0) {
    const defaultChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Weekly Warrior',
        description: 'Complete 5 workouts in 7 days',
        type: 'frequency',
        target: 5,
        bonusPoints: 500,
        duration: 7,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        participants: [],
        isActive: true,
        createdBy: 'system'
      },
      {
        id: '2',
        title: 'Distance Champion',
        description: 'Run or cycle 25km in 14 days',
        type: 'distance',
        target: 25,
        bonusPoints: 750,
        duration: 14,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        participants: [],
        isActive: true,
        createdBy: 'system'
      },
      {
        id: '3',
        title: 'Calorie Crusher',
        description: 'Burn 2000 calories in 10 days',
        type: 'calories',
        target: 2000,
        bonusPoints: 600,
        duration: 10,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        participants: [],
        isActive: true,
        createdBy: 'system'
      }
    ];
    setChallenges(defaultChallenges);
  }

  // Initialize default rewards if none exist
  const rewards = getRewards();
  if (rewards.length === 0) {
    const defaultRewards: Reward[] = [
      {
        id: '1',
        name: 'Premium Theme',
        description: 'Unlock exclusive app themes',
        pointsCost: 1000,
        type: 'premium',
        category: 'Customization',
        isRedeemed: false
      },
      {
        id: '2',
        name: 'Workout Playlist',
        description: 'Access to premium workout music',
        pointsCost: 500,
        type: 'virtual',
        category: 'Entertainment',
        isRedeemed: false
      },
      {
        id: '3',
        name: 'Gym Discount',
        description: '20% off at partner gyms',
        pointsCost: 2000,
        type: 'discount',
        category: 'Fitness',
        isRedeemed: false
      },
      {
        id: '4',
        name: 'Personal Trainer Session',
        description: 'Free 1-hour session with certified trainer',
        pointsCost: 3000,
        type: 'premium',
        category: 'Fitness',
        isRedeemed: false
      }
    ];
    setRewards(defaultRewards);
  }
};
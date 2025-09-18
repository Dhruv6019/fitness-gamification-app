import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/fitness';
import { getCurrentUser, setCurrentUser, getUsers, addUser } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'points' | 'level' | 'badges' | 'joinedChallenges' | 'friends' | 'workoutStreak' | 'totalWorkouts' | 'totalCaloriesBurned' | 'createdAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = getUsers();
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser) {
        // In a real app, you'd verify the password hash
        setUser(foundUser);
        setCurrentUser(foundUser);
        toast({
          title: "Welcome back!",
          description: `Good to see you again, ${foundUser.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred during login.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'points' | 'level' | 'badges' | 'joinedChallenges' | 'friends' | 'workoutStreak' | 'totalWorkouts' | 'totalCaloriesBurned' | 'createdAt'> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = getUsers();
      const existingUser = users.find(u => u.email === userData.email);
      
      if (existingUser) {
        toast({
          title: "Signup failed",
          description: "An account with this email already exists.",
          variant: "destructive",
        });
        return false;
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        name: userData.name,
        profilePicture: userData.profilePicture,
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        fitnessGoals: userData.fitnessGoals,
        activityPreferences: userData.activityPreferences,
        points: 0,
        level: 1,
        badges: [],
        joinedChallenges: [],
        friends: [],
        workoutStreak: 0,
        totalWorkouts: 0,
        totalCaloriesBurned: 0,
        createdAt: new Date().toISOString()
      };

      addUser(newUser);
      setUser(newUser);
      setCurrentUser(newUser);
      
      toast({
        title: "Welcome to FitGam!",
        description: "Your account has been created successfully!",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An error occurred during signup.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setCurrentUser(updatedUser);
      
      // Update in localStorage
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('fitness_users', JSON.stringify(users));
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUserProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
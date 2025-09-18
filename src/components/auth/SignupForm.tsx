import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  age: z.number().min(13, 'Must be at least 13 years old').max(120, 'Please enter a valid age'),
  weight: z.number().min(30, 'Please enter a valid weight').max(500, 'Please enter a valid weight'),
  height: z.number().min(100, 'Please enter a valid height').max(250, 'Please enter a valid height'),
  fitnessGoals: z.array(z.string()).min(1, 'Please select at least one fitness goal'),
  activityPreferences: z.array(z.string()).min(1, 'Please select at least one activity preference'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const fitnessGoalsOptions = [
  'Weight Loss',
  'Muscle Gain',
  'Endurance',
  'Strength',
  'Flexibility',
  'General Fitness',
  'Sports Performance'
];

const activityPreferencesOptions = [
  'Running',
  'Cycling',
  'Gym/Weight Training',
  'Yoga',
  'Swimming',
  'Walking',
  'Basketball',
  'Football',
  'Tennis',
  'Other Sports'
];

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fitnessGoals: [],
      activityPreferences: []
    }
  });

  const watchedFitnessGoals = watch('fitnessGoals') || [];
  const watchedActivityPreferences = watch('activityPreferences') || [];

  const handleCheckboxChange = (field: 'fitnessGoals' | 'activityPreferences', value: string, checked: boolean) => {
    const currentValues = field === 'fitnessGoals' ? watchedFitnessGoals : watchedActivityPreferences;
    
    if (checked) {
      setValue(field, [...currentValues, value]);
    } else {
      setValue(field, currentValues.filter(item => item !== value));
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    const { confirmPassword, ...signupData } = data;
    const success = await signup(signupData);
    if (!success) {
      setError('email', { message: 'An account with this email already exists' });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Join FitGam</CardTitle>
        <CardDescription className="text-center">
          Create your account and start your gamified fitness journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Age"
                {...register('age', { valueAsNumber: true })}
                className={errors.age ? 'border-destructive' : ''}
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Weight"
                {...register('weight', { valueAsNumber: true })}
                className={errors.weight ? 'border-destructive' : ''}
              />
              {errors.weight && (
                <p className="text-sm text-destructive">{errors.weight.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Height"
                {...register('height', { valueAsNumber: true })}
                className={errors.height ? 'border-destructive' : ''}
              />
              {errors.height && (
                <p className="text-sm text-destructive">{errors.height.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fitness Goals</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {fitnessGoalsOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`goal-${goal}`}
                    checked={watchedFitnessGoals.includes(goal)}
                    onCheckedChange={(checked) => handleCheckboxChange('fitnessGoals', goal, checked as boolean)}
                  />
                  <Label htmlFor={`goal-${goal}`} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>
            {errors.fitnessGoals && (
              <p className="text-sm text-destructive">{errors.fitnessGoals.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Activity Preferences</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {activityPreferencesOptions.map((activity) => (
                <div key={activity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`activity-${activity}`}
                    checked={watchedActivityPreferences.includes(activity)}
                    onCheckedChange={(checked) => handleCheckboxChange('activityPreferences', activity, checked as boolean)}
                  />
                  <Label htmlFor={`activity-${activity}`} className="text-sm">{activity}</Label>
                </div>
              ))}
            </div>
            {errors.activityPreferences && (
              <p className="text-sm text-destructive">{errors.activityPreferences.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={onSwitchToLogin}
            className="text-sm"
          >
            Already have an account? Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
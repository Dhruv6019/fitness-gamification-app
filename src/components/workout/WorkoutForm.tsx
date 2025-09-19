import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { addWorkout } from '@/utils/localStorage';
import { updateUserWithWorkout } from '@/utils/gamification';
import { useToast } from '@/hooks/use-toast';
import { WorkoutType, Workout } from '@/types/fitness';
import { Activity, Clock, Flame, MapPin, Zap } from 'lucide-react';

const workoutSchema = z.object({
  type: z.enum(['running', 'cycling', 'gym', 'yoga', 'swimming', 'walking', 'basketball', 'football', 'tennis', 'other']),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(600, 'Duration cannot exceed 10 hours'),
  distance: z.number().optional(),
  caloriesBurned: z.number().min(1, 'Calories must be at least 1').max(5000, 'Please enter a realistic calorie amount'),
  intensityLevel: z.number().min(1).max(5),
  date: z.string()
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

interface WorkoutFormProps {
  onWorkoutAdded?: () => void;
  onClose?: () => void;
}

const workoutTypes: { value: WorkoutType; label: string; icon: string; hasDistance: boolean }[] = [
  { value: 'running', label: 'Running', icon: '🏃‍♂️', hasDistance: true },
  { value: 'cycling', label: 'Cycling', icon: '🚴‍♂️', hasDistance: true },
  { value: 'walking', label: 'Walking', icon: '🚶‍♂️', hasDistance: true },
  { value: 'gym', label: 'Gym/Weight Training', icon: '🏋️‍♂️', hasDistance: false },
  { value: 'yoga', label: 'Yoga', icon: '🧘‍♀️', hasDistance: false },
  { value: 'swimming', label: 'Swimming', icon: '🏊‍♂️', hasDistance: true },
  { value: 'basketball', label: 'Basketball', icon: '⛹️‍♂️', hasDistance: false },
  { value: 'football', label: 'Football', icon: '⚽', hasDistance: false },
  { value: 'tennis', label: 'Tennis', icon: '🎾', hasDistance: false },
  { value: 'other', label: 'Other', icon: '💪', hasDistance: false }
];

const intensityLabels = ['Very Light', 'Light', 'Moderate', 'Hard', 'Very Hard'];

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ onWorkoutAdded, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [intensityLevel, setIntensityLevel] = useState([3]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      intensityLevel: 3
    }
  });

  const selectedType = watch('type');
  const hasDistance = workoutTypes.find(t => t.value === selectedType)?.hasDistance || false;

  const onSubmit = async (data: WorkoutFormData) => {
    if (!user) return;

    // TC06: Validate workout duration
    if (!data.duration || data.duration <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid workout details",
        variant: "destructive"
      });
      return;
    }

    const workout: Workout = {
      id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      type: data.type,
      duration: data.duration,
      distance: data.distance,
      caloriesBurned: data.caloriesBurned,
      intensityLevel: data.intensityLevel as 1 | 2 | 3 | 4 | 5,
      date: new Date(data.date).toISOString(),
      createdAt: new Date().toISOString()
    };

    try {
      addWorkout(workout);
      updateUserWithWorkout(workout);
      
      // TC02: Confirm activity saved and reflected in dashboard
      toast({
        title: "Activity saved and reflected in dashboard! 🎉",
        description: `Your ${data.type} workout has been logged successfully.`,
      });
      
      reset();
      setIntensityLevel([3]);
      onWorkoutAdded?.();
      onClose?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Log New Workout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Workout Type</Label>
              <Select onValueChange={(value) => setValue('type', value as WorkoutType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 30"
                {...register('duration', { valueAsNumber: true })}
                className={errors.duration ? 'border-destructive' : ''}
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caloriesBurned" className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Calories Burned
              </Label>
              <Input
                id="caloriesBurned"
                type="number"
                placeholder="e.g., 300"
                {...register('caloriesBurned', { valueAsNumber: true })}
                className={errors.caloriesBurned ? 'border-destructive' : ''}
              />
              {errors.caloriesBurned && (
                <p className="text-sm text-destructive">{errors.caloriesBurned.message}</p>
              )}
            </div>
          </div>

          {hasDistance && (
            <div className="space-y-2">
              <Label htmlFor="distance" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Distance (km)
              </Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                placeholder="e.g., 5.0"
                {...register('distance', { valueAsNumber: true })}
                className={errors.distance ? 'border-destructive' : ''}
              />
              {errors.distance && (
                <p className="text-sm text-destructive">{errors.distance.message}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Intensity Level
            </Label>
            <div className="space-y-3">
              <Slider
                value={intensityLevel}
                onValueChange={(value) => {
                  setIntensityLevel(value);
                  setValue('intensityLevel', value[0]);
                }}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                {intensityLabels.map((label, index) => (
                  <span
                    key={index}
                    className={`text-center ${
                      intensityLevel[0] === index + 1 ? 'text-primary font-medium' : ''
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="text-center">
                <span className="text-lg font-medium text-primary">
                  Level {intensityLevel[0]}: {intensityLabels[intensityLevel[0] - 1]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1">
              Log Workout
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
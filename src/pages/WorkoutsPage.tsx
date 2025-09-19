import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkouts, deleteWorkout } from '@/utils/localStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, Clock, Flame, MapPin, Trash2, Search, Filter } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { Workout, WorkoutType } from '@/types/fitness';
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

const workoutTypeEmojis: Record<WorkoutType, string> = {
  running: '🏃‍♂️',
  cycling: '🚴‍♂️',
  walking: '🚶‍♂️',
  gym: '🏋️‍♂️',
  yoga: '🧘‍♀️',
  swimming: '🏊‍♂️',
  basketball: '⛹️‍♂️',
  football: '⚽',
  tennis: '🎾',
  other: '💪'
};

const intensityColors = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800'
};

export const WorkoutsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteWorkoutId, setDeleteWorkoutId] = useState<string | null>(null);

  const workouts = useMemo(() => {
    if (!user) return [];
    
    const allWorkouts = getWorkouts().filter(w => w.userId === user.id);
    
    let filtered = allWorkouts;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(w => w.type === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        safeFormatDate(w.date).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user, searchTerm, filterType]);

  const handleDeleteWorkout = (workoutId: string) => {
    try {
      deleteWorkout(workoutId);
      toast({
        title: "Workout deleted",
        description: "The workout has been removed from your history.",
      });
      setDeleteWorkoutId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workout. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Workouts</h1>
          <p className="text-muted-foreground">Track and manage your fitness activities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
                <p className="text-2xl font-bold">{totalWorkouts}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calories Burned</p>
                <p className="text-2xl font-bold">{totalCalories.toLocaleString()}</p>
              </div>
              <Flame className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold">{totalDistance.toFixed(1)} km</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(workoutTypeEmojis).map(([type, emoji]) => (
              <SelectItem key={type} value={type}>
                {emoji} {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Workouts List */}
      <div className="space-y-4">
        {workouts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No workouts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Start logging your workouts to see them here!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {workoutTypeEmojis[workout.type]}
                    </div>
                    <div>
                      <h3 className="font-medium capitalize">{workout.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {safeFormatDate(workout.date, 'EEEE, MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{workout.duration}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Calories</p>
                        <p className="font-medium">{workout.caloriesBurned}</p>
                      </div>
                      {workout.distance && (
                        <div>
                          <p className="text-sm text-muted-foreground">Distance</p>
                          <p className="font-medium">{workout.distance} km</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Intensity</p>
                        <Badge className={`text-xs ${intensityColors[workout.intensityLevel as keyof typeof intensityColors]}`}>
                          Level {workout.intensityLevel}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteWorkoutId(workout.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteWorkoutId} onOpenChange={() => setDeleteWorkoutId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteWorkoutId && handleDeleteWorkout(deleteWorkoutId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
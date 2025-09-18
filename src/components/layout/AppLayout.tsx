import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  Activity,
  Target,
  Trophy,
  Users,
  Gift,
  Settings,
  LogOut,
  Plus,
  Bell,
  Menu,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'workouts', label: 'Workouts', icon: Activity },
  { id: 'challenges', label: 'Challenges', icon: Target },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'social', label: 'Friends', icon: Users },
  { id: 'rewards', label: 'Rewards', icon: Gift },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const NavContent = () => (
    <nav className="space-y-2">
      {navigationItems.map((item) => (
        <Button
          key={item.id}
          variant={currentPage === item.id ? "default" : "ghost"}
          className={cn(
            "w-full justify-start gap-3",
            currentPage === item.id ? "bg-primary text-primary-foreground" : ""
          )}
          onClick={() => {
            onPageChange(item.id);
            setIsMobileMenuOpen(false);
          }}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center border-b px-6">
                  <h2 className="text-lg font-semibold">FitGam</h2>
                </div>
                <div className="p-6">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">FitGam</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Level {user.level}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange('add-workout')}
              className="hidden sm:flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Workout
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                3
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPageChange('profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-muted/10">
          <div className="flex-1 p-6">
            <NavContent />
          </div>
          
          {/* User stats in sidebar */}
          <div className="border-t p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Points</span>
                <span className="font-medium">{user.points.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Streak</span>
                <span className="font-medium">{user.workoutStreak} days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Workouts</span>
                <span className="font-medium">{user.totalWorkouts}</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange('add-workout')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Workout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile FAB for adding workout */}
      <Button
        size="icon"
        onClick={() => onPageChange('add-workout')}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};
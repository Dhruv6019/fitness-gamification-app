import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRewards, setRewards, updateUser } from '@/utils/localStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Star, Percent, ShoppingBag, Check, AlertCircle, Coins } from 'lucide-react';
import { Reward } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';

const rewardTypeIcons = {
  virtual: Gift,
  discount: Percent,
  premium: Star
};

const rewardTypeColors = {
  virtual: 'bg-blue-100 text-blue-800',
  discount: 'bg-green-100 text-green-800',
  premium: 'bg-purple-100 text-purple-800'
};

export const RewardsPage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('available');

  const rewards = getRewards();

  const handleRedeemReward = (reward: Reward) => {
    if (!user) return;

    if (user.points < reward.pointsCost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.pointsCost - user.points} more points to redeem this reward.`,
        variant: "destructive"
      });
      return;
    }

    // Update user points
    updateUserProfile({ points: user.points - reward.pointsCost });

    // Mark reward as redeemed
    const updatedRewards = rewards.map(r => 
      r.id === reward.id ? { ...r, isRedeemed: true } : r
    );
    setRewards(updatedRewards);

    toast({
      title: "Reward Redeemed! 🎉",
      description: `You've successfully redeemed "${reward.name}". Enjoy your reward!`,
    });
  };

  const { availableRewards, redeemedRewards } = useMemo(() => {
    const available = rewards.filter(r => !r.isRedeemed);
    const redeemed = rewards.filter(r => r.isRedeemed);
    
    return { availableRewards: available, redeemedRewards: redeemed };
  }, [rewards]);

  const RewardCard: React.FC<{ reward: Reward; isRedeemed?: boolean }> = ({ reward, isRedeemed = false }) => {
    const IconComponent = rewardTypeIcons[reward.type];
    const canAfford = user ? user.points >= reward.pointsCost : false;

    return (
      <Card className={`${isRedeemed ? 'bg-gray-50 border-gray-200' : ''} hover:shadow-md transition-shadow`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${isRedeemed ? 'bg-gray-200' : 'bg-primary/10'}`}>
                <IconComponent className={`h-6 w-6 ${isRedeemed ? 'text-gray-500' : 'text-primary'}`} />
              </div>
              <div>
                <CardTitle className={`${isRedeemed ? 'text-gray-600' : ''}`}>
                  {reward.name}
                  {isRedeemed && <Check className="inline h-4 w-4 ml-2 text-green-600" />}
                </CardTitle>
                <p className={`text-sm ${isRedeemed ? 'text-gray-500' : 'text-muted-foreground'} mt-1`}>
                  {reward.description}
                </p>
              </div>
            </div>
            <Badge className={rewardTypeColors[reward.type]}>
              {reward.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{reward.pointsCost.toLocaleString()} points</span>
            </div>
            <Badge variant="secondary">{reward.category}</Badge>
          </div>

          {!isRedeemed && (
            <div className="space-y-2">
              {!canAfford && (
                <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>Need {(reward.pointsCost - (user?.points || 0)).toLocaleString()} more points</span>
                </div>
              )}
              <Button 
                onClick={() => handleRedeemReward(reward)}
                disabled={!canAfford}
                className="w-full"
                variant={canAfford ? "default" : "outline"}
              >
                {canAfford ? 'Redeem Reward' : 'Insufficient Points'}
              </Button>
            </div>
          )}

          {isRedeemed && (
            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded">
              <Check className="h-4 w-4" />
              <span className="font-medium">Redeemed</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rewards Store</h1>
          <p className="text-muted-foreground">Redeem your points for exclusive rewards</p>
        </div>
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-700">Your Points</p>
                <p className="text-2xl font-bold text-yellow-800">{user.points.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Rewards</p>
                <p className="text-2xl font-bold">{availableRewards.length}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rewards Redeemed</p>
                <p className="text-2xl font-bold">{redeemedRewards.length}</p>
              </div>
              <Gift className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points Spent</p>
                <p className="text-2xl font-bold">
                  {redeemedRewards.reduce((sum, r) => sum + r.pointsCost, 0).toLocaleString()}
                </p>
              </div>
              <Coins className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available ({availableRewards.length})</TabsTrigger>
          <TabsTrigger value="redeemed">Redeemed ({redeemedRewards.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableRewards.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No rewards available</h3>
                <p className="text-muted-foreground">Check back later for new rewards!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRewards.map((reward) => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="redeemed" className="space-y-4">
          {redeemedRewards.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No redeemed rewards</h3>
                <p className="text-muted-foreground">Redeem some rewards to see them here!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {redeemedRewards.map((reward) => (
                <RewardCard key={reward.id} reward={reward} isRedeemed />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Activity } from 'lucide-react';
import { useApplicationServices } from '../../contexts/ApplicationServiceContext';
import { CreditUsage } from '../../../domain/entities/CreditUsage';

export const CreditUsageStats: React.FC = () => {
  const { adminService } = useApplicationServices();
  const [creditUsage, setCreditUsage] = useState<CreditUsage[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCreditUsage();
  }, []);

  const loadCreditUsage = async () => {
    try {
      // TODO: Add credit usage methods to AdminApplicationService
      const usageStats = await adminService.getCreditUsageStats();
      setCreditUsage([]); // Empty for now
      setStats(usageStats);

    } catch (error) {
      console.error('Error loading credit usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading credit usage stats...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCreditsUsed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Operation</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats?.usageByType ? 
                Object.entries(stats.usageByType).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'None'
                : 'None'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.usageByMonth ? 
                stats.usageByMonth[new Date().toISOString().slice(0, 7)] || 0
                : 0
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Usage by Operation Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.usageByType && Object.entries(stats.usageByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="font-medium">{type.replace(/_/g, ' ')}</span>
                <Badge variant="secondary">{String(count)} credits</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Credit Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {creditUsage.slice(0, 20).map(usage => (
              <div key={usage.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{usage.operationType.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">
                    {usage.createdAt.toLocaleDateString()} at {usage.createdAt.toLocaleTimeString()}
                  </p>
                </div>
                <Badge variant="destructive">
                  -{usage.creditsConsumed} credits
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

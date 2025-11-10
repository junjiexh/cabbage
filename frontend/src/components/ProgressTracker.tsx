import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { progressApi } from '@/services/api';
import { ProgressStats } from '@/types';
import { TrendingUp, CheckCircle2, ListTodo, Calendar } from 'lucide-react';

export function ProgressTracker() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await progressApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Progress Tracker</h2>
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Progress Tracker</h2>
          <p className="text-muted-foreground">Failed to load progress data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Progress Tracker</h2>
        <p className="text-muted-foreground">
          Track your productivity and achievements
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTodos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTodos} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall task completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledItemsCompleted}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalScheduledItems} items completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Done</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTodos}</div>
            <p className="text-xs text-muted-foreground">
              Tasks marked as complete
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Completion Progress</CardTitle>
          <CardDescription>
            Visual representation of your overall task progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Completed Tasks</p>
              <p className="text-2xl font-bold text-primary">{stats.completedTodos}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Remaining Tasks</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {stats.totalTodos - stats.completedTodos}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.totalScheduledItems > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule Progress</CardTitle>
            <CardDescription>
              How you're doing with today's AI-generated schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Schedule Completion</span>
                <span className="font-medium">
                  {Math.round((stats.scheduledItemsCompleted / stats.totalScheduledItems) * 100)}%
                </span>
              </div>
              <Progress
                value={(stats.scheduledItemsCompleted / stats.totalScheduledItems) * 100}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Completed Items</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.scheduledItemsCompleted}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Remaining Items</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {stats.totalScheduledItems - stats.scheduledItemsCompleted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
          <CardDescription>Your productivity snapshot for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Total tasks in your list</span>
              <span className="font-medium">{stats.totalTodos}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Tasks completed</span>
              <span className="font-medium text-primary">{stats.completedTodos}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Schedule items completed</span>
              <span className="font-medium text-primary">{stats.scheduledItemsCompleted}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Overall completion rate</span>
              <span className="font-bold text-lg text-primary">{stats.completionRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

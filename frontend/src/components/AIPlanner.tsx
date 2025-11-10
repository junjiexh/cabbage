import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { plannerApi } from '@/services/api';
import { DailyPlan, ScheduleItem } from '@/types';
import { Calendar, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

export function AIPlanner() {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTodayPlan();
  }, []);

  const loadTodayPlan = async () => {
    try {
      const data = await plannerApi.getTodayPlan();
      setPlan(data);
    } catch (error) {
      console.error('Failed to load plan:', error);
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setMessage('');
    try {
      const newPlan = await plannerApi.generatePlan();
      setPlan(newPlan);
      setMessage('Plan generated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to generate plan');
      console.error('Failed to generate plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleScheduleItem = async (itemId: number, completed: boolean) => {
    if (!plan) return;
    try {
      await plannerApi.updateScheduleItem(plan.id!, itemId, !completed);
      await loadTodayPlan();
    } catch (error) {
      console.error('Failed to update schedule item:', error);
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const getCompletionPercentage = () => {
    if (!plan || plan.scheduleItems.length === 0) return 0;
    const completed = plan.scheduleItems.filter((item) => item.completed).length;
    return Math.round((completed / plan.scheduleItems.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Planner</h2>
          <p className="text-muted-foreground">
            Let AI create your perfect daily schedule
          </p>
        </div>
        <Button onClick={handleGeneratePlan} disabled={loading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? 'Generating...' : 'Plan My Day'}
        </Button>
      </div>

      {message && (
        <Card className={message.includes('success') ? 'border-primary' : 'border-destructive'}>
          <CardContent className="py-4">
            <p className={message.includes('success') ? 'text-primary' : 'text-destructive'}>
              {message}
            </p>
          </CardContent>
        </Card>
      )}

      {!plan ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No Plan Yet</h3>
                <p className="text-muted-foreground">
                  Click "Plan My Day" to generate your personalized schedule
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>
                    {new Date(plan.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            {plan.scheduleItems.map((item, index) => (
              <Card
                key={item.id || index}
                className={item.completed ? 'opacity-60 bg-muted/50' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={item.completed}
                      onChange={() => handleToggleScheduleItem(item.id!, item.completed)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </span>
                      </div>
                      <h3
                        className={`font-semibold ${
                          item.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    {item.completed && (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

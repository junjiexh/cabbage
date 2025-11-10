import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { userSettingsApi } from '@/services/api';
import { UserSettings as UserSettingsType } from '@/types';
import { Save, Plus, X } from 'lucide-react';

export function UserSettings() {
  const [settings, setSettings] = useState<UserSettingsType>({
    wakeUpTime: '07:00',
    sleepTime: '23:00',
    workStartTime: '09:00',
    workEndTime: '17:00',
    goals: [],
    todayFocus: '',
  });
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await userSettingsApi.get();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      await userSettingsApi.update(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setSettings({ ...settings, goals: [...settings.goals, newGoal.trim()] });
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setSettings({
      ...settings,
      goals: settings.goals.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Settings</h2>
        <p className="text-muted-foreground">
          Configure your schedule and goals to help the AI plan your day
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Schedule</CardTitle>
          <CardDescription>Set your typical daily routine times</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wakeUpTime">Wake Up Time</Label>
              <Input
                id="wakeUpTime"
                type="time"
                value={settings.wakeUpTime}
                onChange={(e) => setSettings({ ...settings, wakeUpTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleepTime">Sleep Time</Label>
              <Input
                id="sleepTime"
                type="time"
                value={settings.sleepTime}
                onChange={(e) => setSettings({ ...settings, sleepTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workStartTime">Work Start Time</Label>
              <Input
                id="workStartTime"
                type="time"
                value={settings.workStartTime}
                onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEndTime">Work End Time</Label>
              <Input
                id="workEndTime"
                type="time"
                value={settings.workEndTime}
                onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Long-term Goals</CardTitle>
          <CardDescription>Add recurring habits or goals you want to achieve</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Exercise 3x a week"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            />
            <Button onClick={addGoal} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {settings.goals.map((goal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <span>{goal}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGoal(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {settings.goals.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No goals added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Main Focus</CardTitle>
          <CardDescription>What do you want to prioritize today?</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe your main focus for today..."
            value={settings.todayFocus}
            onChange={(e) => setSettings({ ...settings, todayFocus: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
        {message && (
          <span
            className={message.includes('success') ? 'text-primary' : 'text-destructive'}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}

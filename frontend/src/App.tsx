import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { UserSettings } from './components/UserSettings';
import { TodoList } from './components/TodoList';
import { AIPlanner } from './components/AIPlanner';
import { ProgressTracker } from './components/ProgressTracker';
import { Settings, ListTodo, Sparkles, BarChart3 } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Cabbage
                </div>
                <span className="text-sm text-muted-foreground">AI Daily Planner</span>
              </div>
              <div className="flex space-x-1">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Planner</span>
                </NavLink>
                <NavLink
                  to="/todos"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  <ListTodo className="h-4 w-4" />
                  <span className="font-medium">Tasks</span>
                </NavLink>
                <NavLink
                  to="/progress"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Progress</span>
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Settings</span>
                </NavLink>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<AIPlanner />} />
            <Route path="/todos" element={<TodoList />} />
            <Route path="/progress" element={<ProgressTracker />} />
            <Route path="/settings" element={<UserSettings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

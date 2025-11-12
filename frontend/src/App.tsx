import { useState, useEffect } from 'react'
import './App.css'
import type {Todo, TimelineItem, User, OnboardingResponse} from './types'
import { api } from './api'
import { Onboarding } from './Onboarding'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [todos, setTodos] = useState<Todo[]>([])
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [newTodo, setNewTodo] = useState({ title: '', description: '', duration: 30, priority: 3 })
  const [startTime, setStartTime] = useState('09:00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Get or create user
      const userData = await api.getCurrentUser()
      setUser(userData)

      // If onboarding is completed, load todos
      if (userData.onboarding_completed) {
        await loadTodos()
      }
    } catch (err) {
      setError('Failed to initialize app')
      console.error(err)
    } finally {
      setUserLoading(false)
    }
  }

  const handleOnboardingComplete = (response: OnboardingResponse) => {
    setUser(response.user)
    setTodos(response.todos)
  }

  const loadTodos = async () => {
    try {
      const data = await api.getTodos()
      setTodos(data || [])
    } catch (err) {
      setError('Failed to load todos')
      console.error(err)
    }
  }

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.title) return

    try {
      await api.createTodo(newTodo)
      setNewTodo({ title: '', description: '', duration: 30, priority: 3 })
      await loadTodos()
    } catch (err) {
      setError('Failed to add todo')
      console.error(err)
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      await api.deleteTodo(id)
      await loadTodos()
    } catch (err) {
      setError('Failed to delete todo')
      console.error(err)
    }
  }

  const handlePlanDay = async () => {
    if (todos.length === 0) {
      setError('Add some todos first!')
      return
    }

    setLoading(true)
    setError('')
    try {
      const timelineData = await api.planDay(todos, startTime)
      setTimeline(timelineData)
    } catch (err) {
      setError('Failed to generate timeline')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking user
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🥬</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // Show onboarding if user hasn't completed it
  if (user && !user.onboarding_completed) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="app">
      <header>
        <h1>🥬 Cabbage - Day Planner</h1>
        {user && <p className="text-sm text-gray-600">欢迎回来, {user.username}!</p>}
      </header>

      <div className="container">
        <div className="todos-section">
          <h2>Todo List</h2>

          <form onSubmit={handleAddTodo} className="todo-form">
            <input
              type="text"
              placeholder="Task title"
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Duration (min)"
              value={newTodo.duration}
              onChange={(e) => setNewTodo({ ...newTodo, duration: parseInt(e.target.value) })}
              min="1"
            />
            <select
              value={newTodo.priority}
              onChange={(e) => setNewTodo({ ...newTodo, priority: parseInt(e.target.value) })}
            >
              <option value="1">Priority: Low</option>
              <option value="2">Priority: Medium-Low</option>
              <option value="3">Priority: Medium</option>
              <option value="4">Priority: Medium-High</option>
              <option value="5">Priority: High</option>
            </select>
            <button type="submit">Add Todo</button>
          </form>

          <div className="todos-list">
            {todos.length === 0 ? (
              <p className="empty-state">No todos yet. Add one above!</p>
            ) : (
              todos.map((todo) => (
                <div key={todo.id} className="todo-item">
                  <div className="todo-content">
                    <h3>{todo.title}</h3>
                    <p>{todo.description}</p>
                    <div className="todo-meta">
                      <span>{todo.duration} min</span>
                      <span>Priority: {todo.priority}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTodo(todo.id!)} className="delete-btn">
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="plan-section">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <button onClick={handlePlanDay} disabled={loading} className="plan-btn">
              {loading ? 'Planning...' : '📅 Plan My Day'}
            </button>
          </div>

          {error && <div className="error">{error}</div>}
        </div>

        <div className="timeline-section">
          <h2>Timeline</h2>
          {timeline.length === 0 ? (
            <p className="empty-state">Click "Plan My Day" to generate your timeline</p>
          ) : (
            <div className="timeline-list">
              {timeline.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-time">
                    <strong>{item.start_time}</strong> - {item.end_time}
                  </div>
                  <div className="timeline-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className="duration">{item.duration} minutes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

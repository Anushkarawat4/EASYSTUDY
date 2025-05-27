import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../App.css';
import './calender.css';
import Navbar from '../components/navbar';
import ProfileIcon from '../components/profileicon';
import PomodoroSticky from '../components/pomodorosticky';

const CATEGORY_EMOJIS = {
  Work: '💼',
  Home: '🏠',
  Shopping: '🛒',
  Fitness: '💪',
  Other: '📝',
};

function ReminderPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('Work');

  // Load tasks from localStorage once on mount
  useEffect(() => {
    const saved = localStorage.getItem('monthlyTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage whenever tasks changes
  useEffect(() => {
    localStorage.setItem('monthlyTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleDateChange = (date) => setSelectedDate(date);

  const handleAddTask = () => {
    if (!input.trim()) return;
    const key = selectedDate.toDateString();
    const newTask = { text: input.trim(), category };

    setTasks((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newTask],
    }));

    setInput('');
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const key = date.toDateString();
    if (tasks[key]?.length) {
      return <div className="dot-marker" />;
    }
    return null;
  };

  return (
    <div className="reminder-page bg-grid">
      <div className="top-left">
        <ProfileIcon />
      </div>

      <div className="calendar-row" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
        <PomodoroSticky />

        {/* Left side: Input + Tasks */}
        <div className="task-sidebar" style={{ minWidth: '300px', maxWidth: '350px' }}>
          <h3>🗓️ Tasks for {selectedDate.toDateString()}:</h3>

          <div className="task-input" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={input}
              placeholder="Enter task description"
              onChange={(e) => setInput(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
              }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', marginTop: '0.5rem', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
            >
              {Object.keys(CATEGORY_EMOJIS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddTask}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '10px',
                backgroundColor: '#4f46e5',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Add Task
            </button>
          </div>

          {tasks[selectedDate.toDateString()]?.length > 0 ? (
            <ul className="task-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
              {tasks[selectedDate.toDateString()].map((task, i) => (
                <li
                  key={i}
                  className={`task-item category-${task.category.toLowerCase()}`}
                  style={{
                    padding: '8px 12px',
                    marginBottom: '6px',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    backgroundColor: getCategoryColor(task.category),
                  }}
                >
                  {CATEGORY_EMOJIS[task.category]} {task.text}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#555', fontStyle: 'italic' }}>No tasks for this day.</p>
          )}
        </div>

        {/* Right side: Calendar */}
        <div className="calendar-container" style={{ maxWidth: '400px' }}>
          <h2 className="calendar-title" style={{ textAlign: 'center' }}>
            📅 Monthly Reminder
          </h2>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={tileContent}
            className="kawaii-calendar"
          />
        </div>
      </div>

      <Navbar />
    </div>
  );
}

function getCategoryColor(cat) {
  switch (cat) {
    case 'Work':
      return '#007bff';
    case 'Home':
      return '#28a745';
    case 'Shopping':
      return '#fd7e14';
    case 'Fitness':
      return '#6f42c1';
    default:
      return '#6c757d';
  }
}

export default ReminderPage;

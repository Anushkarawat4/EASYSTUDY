import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import './index.css';

function HabitTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
  const [habits, setHabits] = useState([]);
  const [formData, setFormData] = useState({ name: '', category: 'Health' });
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState({ minutes: 25, seconds: 0, running: false });
  const [timerPosition, setTimerPosition] = useState({ x: 50, y: 50 });
  const [showTimer, setShowTimer] = useState(true);
  const timerRef = useRef(null);

  // Redirect if no email
  useEffect(() => {
    if (!userEmail) {
      console.log('No userEmail, redirecting to login');
      navigate('/login');
    } else {
      localStorage.setItem('userEmail', userEmail);
    }
  }, [userEmail, navigate]);

  // Fetch habits
  useEffect(() => {
    const fetchHabits = async () => {
      if (!userEmail) return;
      try {
        console.log('Fetching habits for:', userEmail);
        const response = await fetch(`/habits?userEmail=${encodeURIComponent(userEmail)}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch habits: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        console.log('Habits response:', data);
        setHabits(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Habit fetch error:', error);
        setErrors({ server: 'Network error: ' + error.message });
      }
    };
    fetchHabits();
  }, [userEmail, location]); // Add location to refresh habits on navigation

  // Sync habits to daily tasks
  useEffect(() => {
    const syncHabits = async () => {
      if (!userEmail) return;
      try {
        console.log('Syncing habits to tasks for:', userEmail);
        const response = await fetch('/sync-habits-to-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to sync habits: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        console.log('Sync response:', data);
      } catch (error) {
        console.error('Sync habits error:', error);
        setErrors({ server: 'Network error: ' + error.message });
      }
    };
    syncHabits();
  }, [userEmail, habits]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: 'Habit name is required' });
      return;
    }

    try {
      console.log('Adding habit:', { ...formData, userEmail });
      const response = await fetch('/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userEmail }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add habit: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setHabits([...habits, data.habit]);
      setFormData({ name: '', category: 'Health' });
      setErrors({});
      console.log('Habit added:', data.habit);
    } catch (error) {
      console.error('Habit add error:', error);
      setErrors({ server: 'Network error: ' + error.message });
    }
  };

  // Update streak
  const updateStreak = async (habitId, date, completed) => {
    const today = DateTime.now().setZone('Asia/Kolkata').toISODate();
    if (date > today) {
      console.log('Cannot update future dates');
      return;
    }

    try {
      console.log('Updating streak:', { habitId, date, completed });
      const response = await fetch(`/habits/${habitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, completed }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update streak: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setHabits(habits.map(h => h._id === habitId ? data.habit : h));
      console.log('Streak updated:', data.habit);
    } catch (error) {
      console.error('Streak update error:', error);
      setErrors({ server: 'Network error: ' + error.message });
    }
  };

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval;
    if (timer.running) {
      interval = setInterval(() => {
        if (timer.seconds === 0) {
          if (timer.minutes === 0) {
            setTimer({ ...timer, running: false });
            alert('Pomodoro session complete!');
          } else {
            setTimer({ minutes: timer.minutes - 1, seconds: 59, running: true });
          }
        } else {
          setTimer({ ...timer, seconds: timer.seconds - 1 });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = () => setTimer({ ...timer, running: true });
  const resetTimer = () => setTimer({ minutes: 25, seconds: 0, running: false });
  const closeTimer = () => setShowTimer(false);
  const toggleTimer = () => setShowTimer(!showTimer);

  // Draggable Timer
  const handleMouseDown = (e) => {
    const startX = e.clientX - timerPosition.x;
    const startY = e.clientY - timerPosition.y;

    const handleMouseMove = (e) => {
      setTimerPosition({
        x: e.clientX - startX,
        y: e.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Render streak grid
  const renderStreak = (habit) => {
    if (!habit || !Array.isArray(habit.streak)) {
      console.warn('Invalid habit or streak:', habit);
      return null;
    }

    const today = DateTime.now().setZone('Asia/Kolkata');
    const startDate = habit.streak.length > 0
      ? DateTime.fromISO(habit.streak[0].date, { zone: 'Asia/Kolkata' })
      : today;
    const days = Array.from({ length: 21 }, (_, i) => {
      const date = startDate.plus({ days: i });
      return date.toISODate();
    });

    return days.map((date, index) => {
      const entry = habit.streak.find(e => e.date === date);
      const isMissed = entry && !entry.completed;
      const isFuture = date > today.toISODate();
      return (
        <div
          key={date}
          className={`w-6 h-6 rounded-full ${isFuture ? 'bg-gray-200' : entry?.completed ? 'bg-pink-800' : isMissed ? 'bg-purple-800' : 'bg-gray-200'} ${!isFuture ? 'cursor-pointer' : ''}`}
          onClick={() => !isFuture && updateStreak(habit._id, date, !entry?.completed)}
          title={date}
        ></div>
      );
    });
  };

  if (!userEmail) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#fedcfd] rounded-lg px-4 py-2">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#e0bffb] rounded-full flex items-center justify-center overflow-hidden">
            <img src="/purple app icon_(credits to owner).jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl tracking-wider">STUDY-EASY</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTimer}
            className="bg-[#f9c7fa] text-black px-3 py-1 rounded text-sm"
          >
            {showTimer ? 'Hide Pomodoro' : 'Show Pomodoro'}
          </button>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <img src="/download (1).jpg" alt="Profile" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </div>

      {/* Pomodoro Timer */}
      {showTimer && (
        <div
          ref={timerRef}
          className="fixed bg-[#fedcfd] rounded-lg p-4 shadow-md cursor-move z-50"
          style={{ left: timerPosition.x, top: timerPosition.y, userSelect: 'none' }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg">Pomodoro</h3>
            <button
              onClick={closeTimer}
              className="text-purple-800 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="text-2xl text-center mb-2">
            {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
          </div>
          <div className="flex justify-center gap-2">
            <button
              className="bg-[#f9c7fa] text-black px-3 py-1 rounded text-sm"
              onClick={startTimer}
              disabled={timer.running}
            >
              Start
            </button>
            <button
              className="bg-[#f9c7fa] text-black px-3 py-1 rounded text-sm"
              onClick={resetTimer}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col mt-10">
        <div className="bg-[#fedcfd] rounded-lg p-6 w-full">
          <h2 className="text-2xl mb-4 text-center">Habit Tracker</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Habit Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 rounded bg-white text-black"
              />
              {errors.name && <p className="text-purple-800 text-sm">{errors.name}</p>}
            </div>
            <div className="mb-4">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 rounded bg-white text-black"
              >
                <option value="Health">Health</option>
                <option value="Productivity">Productivity</option>
                <option value="Learning">Learning</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#f9c7fa] text-black px-6 py-2 rounded w-full mb-2"
            >
              Add Habit
            </button>
          </form>
          {errors.server && <p className="text-purple-800 text-sm mb-4">{errors.server}</p>}

          {/* Separator */}
          <hr className="border-gray-300 my-6" />

          {/* Habits List */}
          <div>
            {habits.length === 0 ? (
              <p className="text-sm text-center">No habits added yet.</p>
            ) : (
              <ul className="space-y-4">
                {habits.map(habit => (
                  <li key={habit._id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">{habit.name} ({habit.category})</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {renderStreak(habit) || <p className="text-sm text-purple-800">Error rendering streak</p>}
                    </div>
                    <p className="text-sm mt-2">
                      Days Left: {21 - (habit.streak?.filter(e => e.completed).length || 0)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#fedcfd] p-4 flex justify-around">
        <Link to="/daily-todo" state={{ email: userEmail }} className="text-black text-sm">Daily To-Do List</Link>
        <Link to="/habit-tracker" state={{ email: userEmail }} className="text-black text-sm font-semibold">Habit Tracker</Link>
        <Link to="/monthly-planner" state={{ email: userEmail }} className="text-black text-sm">Monthly Planner</Link>
      </div>
    </div>
  );
}

export default HabitTracker;
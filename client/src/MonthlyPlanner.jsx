import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './index.css';

function MonthlyPlanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
  const [tasks, setTasks] = useState([]);
  const [monthTasks, setMonthTasks] = useState([]);
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);
  const [formData, setFormData] = useState({ title: '', dueDate: '' });
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState({ minutes: 25, seconds: 0, running: false });
  const [timerPosition, setTimerPosition] = useState({ x: 50, y: 50 });
  const [showTimer, setShowTimer] = useState(true);
  const timerRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Redirect if no email
  useEffect(() => {
    if (!userEmail) {
      console.log('No userEmail, redirecting to login');
      navigate('/login');
    } else {
      localStorage.setItem('userEmail', userEmail);
    }
  }, [userEmail, navigate]);

  // Fetch tasks due soon
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userEmail) return;
      try {
        console.log('Fetching tasks due soon for:', userEmail);
        const response = await fetch(`/tasks?userEmail=${encodeURIComponent(userEmail)}&dueSoon=true`);
        const data = await response.json();
        console.log('Tasks due soon response:', data);
        if (response.ok) {
          setTasks(Array.isArray(data) ? data : []);
        } else {
          setErrors(data.errors || { server: 'Failed to fetch tasks' });
        }
      } catch (error) {
        console.error('Task fetch error:', error);
        setErrors({ server: 'Network error: ' + error.message });
      }
    };
    fetchTasks();
  }, [userEmail]);

  // Fetch tasks for current month
  useEffect(() => {
    const fetchMonthTasks = async () => {
      if (!userEmail) return;
      const monthQuery = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`;
      try {
        console.log('Fetching tasks for month:', monthQuery);
        const response = await fetch(`/tasks?userEmail=${encodeURIComponent(userEmail)}&month=${monthQuery}`);
        const data = await response.json();
        console.log('Month tasks response:', data);
        if (response.ok) {
          setMonthTasks(Array.isArray(data) ? data : []);
        } else {
          setErrors(data.errors || { server: 'Failed to fetch month tasks' });
        }
      } catch (error) {
        console.error('Month task fetch error:', error);
        setErrors({ server: 'Network error: ' + error.message });
      }
    };
    fetchMonthTasks();
  }, [userEmail, currentMonth]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) {
      setErrors({
        title: !formData.title.trim() ? 'Task title is required' : '',
        dueDate: !formData.dueDate ? 'Due date is required' : '',
      });
      return;
    }

    try {
      console.log('Adding task:', { ...formData, userEmail });
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setMonthTasks([...monthTasks, data.task]);
        const dueDate = new Date(data.task.dueDate);
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        if (dueDate <= threeDaysFromNow && dueDate >= new Date()) {
          setTasks([...tasks, data.task]);
        }
        setFormData({ title: '', dueDate: '' });
        setErrors({});
        console.log('Task added:', data.task);
      } else {
        setErrors(data.errors || { server: 'Failed to add task' });
      }
    } catch (error) {
      console.error('Task add error:', error);
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

  // Calendar Logic
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];
  let week = Array(7).fill(null);
  for (let i = 0; i < firstDay; i++) week[i] = null;
  days.forEach((day, i) => {
    week[(i + firstDay) % 7] = day;
    if ((i + firstDay) % 7 === 6 || i === days.length - 1) {
      weeks.push([...week]);
      week = Array(7).fill(null);
    }
  });

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const selectDate = (day) => {
    if (!day) return;
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setFormData({ ...formData, dueDate: formattedDate });
    // Show tasks for the selected date
    const dateTasks = monthTasks.filter(task => {
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === formattedDate;
    });
    setSelectedDateTasks(dateTasks);
  };

  // Check if a day has tasks
  const hasTasks = (day) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formattedDate = date.toISOString().split('T')[0];
    return monthTasks.some(task => {
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === formattedDate;
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
          <h2 className="text-2xl mb-4 text-center">Monthly Planner</h2>

          {/* Calendar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <button onClick={prevMonth} className="bg-[#f9c7fa] text-black px-3 py-1 rounded">Prev</button>
              <h3 className="text-lg">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={nextMonth} className="bg-[#f9c7fa] text-black px-3 py-1 rounded">Next</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="font-semibold">{day}</div>
              ))}
              {weeks.map((week, i) => (
                week.map((day, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`p-2 relative ${day ? 'bg-white rounded cursor-pointer hover:bg-gray-100' : 'bg-transparent'}`}
                    onClick={() => selectDate(day)}
                  >
                    {day}
                    {hasTasks(day) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-800 rounded-full"></div>
                    )}
                  </div>
                ))
              ))}
            </div>
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Task/Reminder Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 rounded bg-white text-black"
              />
              {errors.title && <p className="text-purple-800 text-sm">{errors.title}</p>}
            </div>
            <div className="mb-4">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-2 rounded bg-white text-black"
              />
              {errors.dueDate && <p className="text-purple-800 text-sm">{errors.dueDate}</p>}
            </div>
            <button
              type="submit"
              className="bg-[#f9c7fa] text-black px-6 py-2 rounded w-full mb-2"
            >
              Add Task
            </button>
          </form>
          {errors.server && <p className="text-purple-800 text-sm mb-4">{errors.server}</p>}

          {/* Separator */}
          <hr className="border-gray-300 my-6" />

          {/* Selected Date Tasks */}
          {selectedDateTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                Tasks for {new Date(selectedDateTasks[0].dueDate).toLocaleDateString()}
              </h3>
              <ul className="space-y-4">
                {selectedDateTasks.map(task => (
                  <li key={task._id} className="bg-white p-4 rounded-lg shadow">
                    <span>{task.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reminders List */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Reminders (Due in 3 Days)</h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-center">No reminders due soon.</p>
            ) : (
              <ul className="space-y-4">
                {tasks.map(task => (
                  <li key={task._id} className="bg-white p-4 rounded-lg shadow">
                    <span>{task.title} (Due: {new Date(task.dueDate).toLocaleDateString()})</span>
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
        <Link to="/habit-tracker" state={{ email: userEmail }} className="text-black text-sm">Habit Tracker</Link>
        <Link to="/monthly-planner" state={{ email: userEmail }} className="text-black text-sm font-semibold">Monthly Planner</Link>
      </div>
    </div>
  );
}

export default MonthlyPlanner;
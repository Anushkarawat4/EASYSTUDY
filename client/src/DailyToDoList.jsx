import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './index.css';

function DailyToDoList() {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ title: '', dueDate: '' });
  const [errors, setErrors] = useState({});

  // Redirect if no email
  useEffect(() => {
    if (!userEmail) {
      console.log('No userEmail, redirecting to login');
      navigate('/login');
    } else {
      localStorage.setItem('userEmail', userEmail);
    }
  }, [userEmail, navigate]);

  // Fetch tasks for today
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userEmail) return;
      try {
        const response = await fetch(`/tasks?userEmail=${encodeURIComponent(userEmail)}&today=true`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Task fetch error:', error);
        setErrors({ server: 'Network error: ' + error.message });
      }
    };
    fetchTasks();
  }, [userEmail]);

  // Handle form submission to add a task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrors({ title: 'Task title is required' });
      return;
    }

    try {
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          title: formData.title,
          dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add task: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setTasks([...tasks, data.task]);
      setFormData({ title: '', dueDate: '' });
      setErrors({});
    } catch (error) {
      console.error('Task add error:', error);
      setErrors({ server: 'Network error: ' + error.message });
    }
  };

  // Update task completion status
  const updateTask = async (taskId, completed) => {
    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update task: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setTasks(tasks.map(task => task._id === taskId ? data.task : task));
      console.log(`Task ${taskId} updated to completed: ${completed}`);
    } catch (error) {
      console.error('Task update error:', error);
      setErrors({ server: 'Network error: ' + error.message });
    }
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
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <img src="/download (1).jpg" alt="Profile" className="w-full h-full object-cover rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col mt-10">
        <div className="bg-[#fedcfd] rounded-lg p-6 w-full">
          <h2 className="text-2xl mb-4 text-center">Daily To-Do List</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Task Title"
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

          {/* Tasks List */}
          <div>
            {tasks.length === 0 ? (
              <p className="text-sm text-center">No tasks for today.</p>
            ) : (
              <ul className="space-y-4">
                {tasks.map(task => (
                  <li key={task._id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => updateTask(task._id, e.target.checked)}
                        className="mr-2"
                      />
                      <span className={task.completed ? 'line-through text-gray-500' : ''}>
                        {task.title}
                      </span>
                    </div>
                    {task.habitId && <span className="text-sm text-purple-800">(Habit)</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#fedcfd] p-4 flex justify-around">
        <Link to="/daily-todo" state={{ email: userEmail }} className="text-black text-sm font-semibold">Daily To-Do List</Link>
        <Link to="/habit-tracker" state={{ email: userEmail }} className="text-black text-sm">Habit Tracker</Link>
        <Link to="/monthly-planner" state={{ email: userEmail }} className="text-black text-sm">Monthly Planner</Link>
      </div>
    </div>
  );
}

export default DailyToDoList;
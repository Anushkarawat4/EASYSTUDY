const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { DateTime } = require('luxon');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studyeasy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Habit Schema
const habitSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  streak: [{ date: String, completed: Boolean }],
  createdAt: { type: Date, default: Date.now },
});

const Habit = mongoose.model('Habit', habitSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  dueDate: { type: Date, required: false },
  completed: { type: Boolean, default: false },
  habitId: { type: mongoose.Schema.Types.ObjectId, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model('Task', taskSchema);

// Validation function for user input
const validateInput = (data) => {
  const errors = {};
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|yahoo\.com|ac\.in|edu\.in|org|edu)$/;
  const phoneRegex = /^\d{10}$/;

  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!emailRegex.test(data.email)) errors.email = 'Invalid email format';
  if (!phoneRegex.test(data.phone)) errors.phone = 'Phone number must be 10 digits';
  if (data.password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (data.password !== data.confirmPassword) errors.password = 'Passwords do not match';

  return Object.keys(errors).length ? errors : null;
};

// Register Route
app.post('/register', async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  const errors = validateInput({ name, email, phone, password, confirmPassword });
  if (errors) return res.status(400).json({ errors });

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        errors: {
          [existingUser.email === email ? 'email' : 'phone']: `${existingUser.email === email ? 'Email' : 'Phone'} already exists`,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ errors: { server: 'Server error: ' + error.message } });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|yahoo\.com|ac\.in|edu\.in|org|edu)$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ errors: { email: 'Invalid email format' } });
  }
  if (!password) {
    return res.status(400).json({ errors: { password: 'Password is required' } });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: { email: 'User not found' } });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: { password: 'Invalid password' } });
    }

    res.status(200).json({ message: 'Login successful', email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ errors: { server: 'Server error: ' + error.message } });
  }
});

// Habit Routes
app.post('/habits', async (req, res) => {
  const { userEmail, name, category } = req.body;

  if (!userEmail || !name || !category) {
    return res.status(400).json({ errors: { server: 'All fields are required' } });
  }

  try {
    const habit = new Habit({ userEmail, name, category, streak: [] });
    await habit.save();
    res.status(201).json({ message: 'Habit added successfully', habit });
  } catch (error) {
    console.error('Habit creation error:', error);
    res.status(500).json({ errors: { server: 'Server error: ' + error.message } });
  }
});

app.get('/habits', async (req, res) => {
  const { userEmail } = req.query;

  if (!userEmail) {
    return res.status(400).json({ errors: { server: 'User email is required' } });
  }

  try {
    const habits = await Habit.find({ userEmail });
    res.status(200).json(habits);
  } catch (error) {
    console.error('Habit fetch error:', error);
    res.status(500).json({ errors: { server: 'Server error: ' + error.message } });
  }
});

app.put('/habits/:id', async (req, res) => {
  const { id } = req.params;
  const { date, completed } = req.body;

  if (!date || completed === undefined) {
    return res.status(400).json({ errors: { server: 'Date and completion status are required' } });
  }

  try {
    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ errors: { server: 'Habit not found' } });
    }

    const streakEntry = habit.streak.find(entry => entry.date === date);
    if (streakEntry) {
      streakEntry.completed = completed;
    } else {
      habit.streak.push({ date, completed });
    }

    await habit.save();
    res.status(200).json({ message: 'Streak updated successfully', habit });
  } catch (error) {
    console.error('Streak update error:', error);
    res.status(500).json({ errors: { server: 'Server error: ' + error.message } });
  }
});

// Task Routes
app.post('/tasks', async (req, res) => {
  const { userEmail, title, dueDate, habitId } = req.body;

  if (!userEmail || !title) {
    return res.status(400).json({ errors: { server: 'User email and title are required' } });
  }

  try {
    const task = new Task({ userEmail, title, dueDate: dueDate ? new Date(dueDate) : null, habitId });
    await task.save();
    res.status(201).json({ message: 'Task added successfully', task });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ errors: { server: 'Server error: ' + error.message } });
  }
});

app.get('/tasks', async (req, res) => {
  const { userEmail, dueSoon, month, today } = req.query;

  if (!userEmail) {
    return res.status(400).json({ errors: { server: 'User email is required' } });
  }

  try {
    let query = { userEmail };
    if (dueSoon === 'true') {
      const nowIST = DateTime.now().setZone('Asia/Kolkata');
      const threeDaysFromNow = nowIST.plus({ days: 3 });
      query.dueDate = { $lte: threeDaysFromNow.toJSDate(), $gte: nowIST.toJSDate() };
      console.log('Due soon range:', nowIST.toISO(), 'to', threeDaysFromNow.toISO());
    } else if (month) {
      const [year, monthIndex] = month.split('-').map(Number);
      const startOfMonth = DateTime.fromObject({ year, month: monthIndex, day: 1 }, { zone: 'Asia/Kolkata' });
      const endOfMonth = startOfMonth.endOf('month');
      query.dueDate = { $gte: startOfMonth.toJSDate(), $lte: endOfMonth.toJSDate() };
      console.log('Month range:', startOfMonth.toISO(), 'to', endOfMonth.toISO());
    } else if (today === 'true') {
      const startOfDay = DateTime.now().setZone('Asia/Kolkata').startOf('day');
      const endOfDay = startOfDay.endOf('day');
      query.dueDate = { $gte: startOfDay.toJSDate(), $lte: endOfDay.toJSDate() };
      console.log('Today range:', startOfDay.toISO(), 'to', endOfDay.toISO());
    }
    const tasks = await Task.find(query);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Task fetch error:', error);
    res.status(500).json({ errors: { server: 'Server error: ' + error.message } });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (completed === undefined) {
    return res.status(400).json({ errors: { server: 'Completion status is required' } });
  }

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ errors: { server: 'Task not found' } });
    }

    task.completed = completed;
    await task.save();

    // If task is linked to a habit and is being unchecked, update the habit streak
    if (task.habitId && completed === false) {
      const habit = await Habit.findById(task.habitId);
      if (habit) {
        const taskDueDate = DateTime.fromJSDate(task.dueDate, { zone: 'Asia/Kolkata' });
        const dateStr = taskDueDate.toISODate();
        console.log(`Updating habit ${habit.name} streak for date ${dateStr} to incomplete`);

        const streakEntry = habit.streak.find(entry => entry.date === dateStr);
        if (streakEntry) {
          streakEntry.completed = false;
        } else {
          habit.streak.push({ date: dateStr, completed: false });
        }
        await habit.save();
      }
    }

    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ errors: { server: 'Server error: ' + error.message } });
  }
});

// Sync Habits to Daily Tasks
app.post('/sync-habits-to-tasks', async (req, res) => {
  const { userEmail } = req.body;

  if (!userEmail) {
    console.log('Sync habits: Missing userEmail');
    return res.status(400).json({ errors: { server: 'User email is required' } });
  }

  try {
    console.log('Syncing habits for:', userEmail);
    const habits = await Habit.find({ userEmail });
    console.log('Found habits:', habits.length);

    const nowIST = DateTime.now().setZone('Asia/Kolkata');
    const today = nowIST.toISODate();
    const startOfDay = nowIST.startOf('day');
    const endOfDay = nowIST.endOf('day');
    console.log('Today range:', startOfDay.toISO(), 'to', endOfDay.toISO());

    const newTasks = [];
    for (const habit of habits) {
      const taskData = {
        userEmail,
        title: habit.name,
        dueDate: startOfDay.toJSDate(),
        habitId: habit._id,
        completed: false,
        createdAt: new Date(),
      };

      try {
        const task = await Task.findOneAndUpdate(
          { userEmail, habitId: habit._id, dueDate: startOfDay.toJSDate() },
          { $setOnInsert: taskData },
          { upsert: true, new: true }
        );
        if (task.createdAt.getTime() === taskData.createdAt.getTime()) {
          console.log('Created task for habit:', habit.name);
          newTasks.push(task);
        } else {
          console.log('Task already exists for habit:', habit.name);
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log('Duplicate task skipped for habit:', habit.name);
          continue;
        }
        throw error;
      }
    }

    res.status(200).json({ message: 'Habits synced to tasks', tasks: newTasks });
  } catch (error) {
    console.error('Sync habits error:', error);
    res.status(500).json({ errors: { server: 'Server error: ' + error.message } });
  }
});

// Cleanup Daily Tasks
app.post('/cleanup-daily-tasks', async (req, res) => {
  const { userEmail } = req.body;

  if (!userEmail) {
    console.log('Cleanup tasks: Missing userEmail');
    return res.status(400).json({ errors: { server: 'User email is required' } });
  }

  try {
    console.log('Cleaning up tasks for:', userEmail);
    const nowIST = DateTime.now().setZone('Asia/Kolkata');
    const today = nowIST.startOf('day');
    const endOfDay = nowIST.endOf('day');
    console.log('Today range for cleanup:', today.toISO(), 'to', endOfDay.toISO());

    const tasks = await Task.find({
      userEmail,
      dueDate: { $gte: today.toJSDate(), $lte: endOfDay.toJSDate() },
      completed: false,
      habitId: { $ne: null },
    });
    console.log('Found incomplete tasks:', tasks.length);

    for (const task of tasks) {
      const habit = await Habit.findById(task.habitId);
      if (habit) {
        const todayStr = today.toISODate();
        const streakEntry = habit.streak.find(entry => entry.date === todayStr);
        if (!streakEntry) {
          console.log('Marking habit as missed:', habit.name);
          habit.streak.push({ date: todayStr, completed: false });
          await habit.save();
        }
        console.log('Deleting task:', task.title);
        await Task.findByIdAndDelete(task._id);
      }
    }

    res.status(200).json({ message: 'Daily tasks cleaned up' });
  } catch (error) {
    console.error('Cleanup tasks error:', error);
    res.status(500).json({ errors: { server: 'Server error: ' + error.message } });
  }
});

// Daily Cleanup Cron Job (Midnight IST)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily task cleanup');
  try {
    const users = await User.find({}, 'email');
    console.log('Found users:', users.length);
    for (const user of users) {
      console.log('Cleaning up for:', user.email);
      const response = await fetch('http://localhost:5000/cleanup-daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Cleanup failed for ${user.email}: ${response.status} ${errorText}`);
      } else {
        console.log(`Cleaned up tasks for ${user.email}`);
      }
    }
  } catch (error) {
    console.error('Cron cleanup error:', error);
  }
}, {
  timezone: 'Asia/Kolkata',
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
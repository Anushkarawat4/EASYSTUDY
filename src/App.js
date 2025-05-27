import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/navbar';
import ProfileIcon from './components/profileicon';
import PomodoroSticky from './components/pomodorosticky';
import TodoList from './components/todolist';

import ReminderPage from './pages/RemainderPage';
import SubjectsExamsPage from './pages/SubjectsExamsPage';

import './App.css';

function TodoPageLayout() {
  return (
    <div className="app-container bg-grid">
      {/* Profile Icon top-left */}
      <ProfileIcon />

      <div className="main-content">
        {/* Pomodoro Timer middle-left */}
        <PomodoroSticky />

        {/* To-do list in center */}
        <div className="todo-area">
          <TodoList />
        </div>
      </div>

      <Navbar />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodoPageLayout />} />
        <Route path="/reminders" element={<ReminderPage />} />
        <Route path="/subjects" element={<SubjectsExamsPage />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;

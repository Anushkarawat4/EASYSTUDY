import React from 'react';
import ProfileIcon from '../components/profileicon';
import PomodoroSticky from '../components/pomodorosticky';
import TodoList from '../components/todolist';
import Navbar from '../components/navbar';

function TodoPage() {
  return (
    <div className="app-container bg-grid">
      <div className="top-bar">
        <ProfileIcon />
      </div>
      <div className="main-content">
        <div className="sidebar">
          <PomodoroSticky />
        </div>
        <div className="todo-area">
  <div className="todo-center-wrapper">
    <TodoList />
  </div>
</div>

      </div>
      <Navbar />
    </div>
  );
}

export default TodoPage;

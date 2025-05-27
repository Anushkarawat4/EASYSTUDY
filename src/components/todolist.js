import React, { useState } from 'react';

function TodoList() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Personal', tasks: [] },
    { id: 2, name: 'Work', tasks: [] },
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(1);
  const [newTask, setNewTask] = useState('');
  const [newSubtask, setNewSubtask] = useState({}); // keyed by task ID

  const addCategory = () => {
    if (newCategory.trim()) {
      const newCat = {
        id: Date.now(),
        name: newCategory.trim(),
        tasks: [],
      };
      setCategories([...categories, newCat]);
      setNewCategory('');
      setSelectedCategoryId(newCat.id);
    }
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setCategories(categories.map(cat => {
      if (cat.id === selectedCategoryId) {
        return {
          ...cat,
          tasks: [...cat.tasks, {
            id: Date.now(),
            text: newTask.trim(),
            completed: false,
            subtasks: [],
          }]
        };
      }
      return cat;
    }));
    setNewTask('');
  };

  const toggleTask = (taskId) => {
    setCategories(categories.map(cat => {
      if (cat.id === selectedCategoryId) {
        return {
          ...cat,
          tasks: cat.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return cat;
    }));
  };

  const addSubtask = (taskId) => {
    const sub = newSubtask[taskId];
    if (!sub?.trim()) return;
    setCategories(categories.map(cat => {
      if (cat.id === selectedCategoryId) {
        return {
          ...cat,
          tasks: cat.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [...task.subtasks, { id: Date.now(), text: sub.trim(), completed: false }]
                }
              : task
          )
        };
      }
      return cat;
    }));
    setNewSubtask({ ...newSubtask, [taskId]: '' });
  };

  const toggleSubtask = (taskId, subId) => {
    setCategories(categories.map(cat => {
      if (cat.id === selectedCategoryId) {
        return {
          ...cat,
          tasks: cat.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map(sub =>
                    sub.id === subId ? { ...sub, completed: !sub.completed } : sub
                  )
                }
              : task
          )
        };
      }
      return cat;
    }));
  };

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  return (
    <div className="todo-list-container">
      <h2 className="todo-title">Todo List with Categories & Subtasks</h2>

      {/* Category input */}
      <div className="todo-input-area">
        <input
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          className="todo-input"
        />
        <button onClick={addCategory} className="add-task-btn">Add Category</button>
      </div>

      {/* Category dropdown */}
      <div className="todo-input-area">
        <select
          className="todo-input"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Task input */}
      <div className="todo-input-area">
        <input
          type="text"
          placeholder="Add new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          className="todo-input"
        />
        <button onClick={addTask} className="add-task-btn">Add Task</button>
      </div>

      {/* Tasks + Subtasks */}
      <ul className="todo-list">
        {selectedCategory?.tasks.map(task => (
          <li key={task.id} className={`todo-item ${task.completed ? 'completed' : ''}`}>
            <label>
              <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
              <span>{task.text}</span>
            </label>

            {/* Subtasks */}
            <ul className="subtask-list">
              {task.subtasks.map(sub => (
                <li key={sub.id} className={`subtask-item ${sub.completed ? 'completed' : ''}`}>
                  <label>
                    <input type="checkbox" checked={sub.completed} onChange={() => toggleSubtask(task.id, sub.id)} />
                    <span>{sub.text}</span>
                  </label>
                </li>
              ))}
            </ul>

            <div className="todo-input-area">
              <input
                type="text"
                placeholder="Add subtask"
                value={newSubtask[task.id] || ''}
                onChange={(e) => setNewSubtask({ ...newSubtask, [task.id]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addSubtask(task.id)}
                className="todo-input"
              />
              <button className="add-task-btn" onClick={() => addSubtask(task.id)}>+</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;

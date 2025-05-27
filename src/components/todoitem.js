import React from 'react';

function TodoItem({ title, subtasks }) {
  return (
    <div className="mb-4 p-4 bg-white shadow rounded-xl">
      <h2 className="font-semibold text-lg">{title}</h2>
      <ul className="list-disc ml-5 mt-2 text-sm">
        {subtasks.map((sub, i) => (
          <li key={i}>{sub}</li>
        ))}
      </ul>
    </div>
  );
}

export default TodoItem;

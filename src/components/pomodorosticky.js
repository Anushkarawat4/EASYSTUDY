import React, { useState } from 'react';
import './pomodoro.css';

const PomodoroSticky = () => {
  const [position, setPosition] = useState({ x: 50, y: 150 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState(null);

  const handleMouseDown = (e) => {
    const pos = e.target.getBoundingClientRect();
    setDragging(true);
    setRel({
      x: e.pageX - pos.left,
      y: e.pageY - pos.top,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.pageX - rel.x,
      y: e.pageY - rel.y,
    });
    e.preventDefault();
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div
      className="pomodoro-sticky"
      style={{ left: position.x, top: position.y, position: 'absolute' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <h3>Pomodoro</h3>
      <p>25:00</p>
    </div>
  );
};

export default PomodoroSticky;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import HabitTracker from './HabitTracker';
import DailyToDoList from './DailyToDoList';
import MonthlyPlanner from './MonthlyPlanner';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/habit-tracker"
          element={
            
              <HabitTracker />
            
          }
        />
        <Route
          path="/daily-todo"
          element={
            
              <DailyToDoList />
           
          }
        />
        <Route
          path="/monthly-planner"
          element={
          
              <MonthlyPlanner />
            
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
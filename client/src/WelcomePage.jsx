import './index.css';
import { Link } from 'react-router-dom';

function WelcomePage() {
  return (
    <div className="min-h-screen bg-grid flex flex-col p-6">
      {/* Header with Background */}
      <div className="flex items-center justify-between">
        <div className="w-full flex items-center space-x-4 bg-[#fedcfd] rounded-lg px-4 py-2">
          {/* Placeholder for calendar icon */}
          <div className="w-12 h-12 bg-#e0bffb rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="purple app icon_(credits to owner).jpg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl tracking-wider text-center w-full">STUDY-EASY</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-between mt-10">
        {/* Tagline with Typing Animation, Centered with Wrapping */}
        <div className="typing-container max-w-[80%] text-center">
          <span className="typing-animation text-2xl whitespace-normal">
            PLOT TWIST: STUDYING JUST GOT FUN..LET'S PLAN IT OUT!!!
          </span>
        </div>

        {/* Login/Register Box */}
        <div className="bg-[#fedcfd] rounded-lg p-6 w-64 text-center">
          {/* Placeholder for user icon */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-sm">
              <img src="download (1).jpg" alt="" />
            </span>
          </div>
          <p className="text-lg mb-4">ALREADY A USER?</p>
          <Link to="/login">
            <button className="bg-[#f9c7fa] text-black px-6 py-2 rounded mb-2 w-full">
              LOGIN
            </button>
          </Link>
          <p className="text-lg mb-4">NEW TO STUDY-EASY</p>
          <Link to="/register">
            <button className="bg-[#f9c7fa] text-black px-6 py-2 rounded w-full">
              REGISTER
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
import UserProfile from './components/UserProfile/UserProfile';
import SignUp from './components/Signup/SignUp';
import { UserProvider, UserContext } from '../src/context/UserContext';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <div className="app">
          <Nav />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profiles" element={<UserProfile />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
};

const Nav = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="nav-container" style={{ marginLeft: '20px' }}>
      <nav>
        <ul>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/profiles">Profiles</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
        <br />
      </nav>
    </div>
  );
};

export default App;

import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Buckets from './pages/Buckets/Buckets';
import Profile from './pages/Profile/Profile';
import VerticalTabs from './components/VerticalTabs';

function App() {
  return (
    <div className="App">
      <VerticalTabs />
      <Routes>
        <Route
          path='/'
          element={<Home />}
        >
        </Route>

        <Route
          path='/renter/dashboard/:id'
          element={<Dashboard />}
        >
        </Route>

        <Route
          path='/renter/buckets'
          element={<Buckets />}
        >
        </Route>

        <Route
          path='/renter/profile/:id'
          element={<Profile />}
        >
        </Route>
      </Routes>
    </div>
  );
}

export default App;

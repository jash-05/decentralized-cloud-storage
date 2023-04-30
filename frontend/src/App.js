import './App.css';
import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Buckets from './pages/Buckets/Buckets';
import Profile from './pages/Profile/Profile';
import Navbar from './components/Navbar';
import LeftPanel from './components/LeftPanel';
import Files from './pages/Buckets/Files';
import Login from './pages/Login/Login';
import Register from './pages/Login/Register';

function App() {

  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(0);
  const handleSelectedTab = (tab) => {
    setSelectedTab(tab)
    console.log("Selected tab", tab)
  }


  return (
    <div className="App">
      {location.pathname === '/'
        &&
        <Navbar />
      }
      <Routes>
        <Route
          path='/'
          element={<Home />}
        >
        </Route>
        <Route
          path='/login'
          element={<Login />}
        >
        </Route>
        <Route
          path='/register'
          element={<Register />}
        >
        </Route>
      </Routes>

      {!['/', '/login', '/register'].includes(location.pathname) &&
        <div className="content-wrapper">
          <LeftPanel selectedTab={selectedTab} handleSelectedTab={handleSelectedTab} />
          <div className='stage-wrapper'>
            <Routes>

              <Route
                path='/dashboard/:renterId'
                element={<Dashboard />}
              >
              </Route>

              <Route
                path='/buckets/'
                element={<Buckets />}
              >
              </Route>

              <Route
                path='/buckets/renter/:renterId'
                element={<Buckets />}
              >
              </Route>

              <Route
                path='/buckets/bucket/:bucketId'
                element={<Files />}
              >
              </Route>


              <Route
                path='/profile/:renterId'
                element={<Profile />}
              >
              </Route>
            </Routes>

          </div>
        </div>
      }
      <Toaster />
    </div >
  );
}

export default App;

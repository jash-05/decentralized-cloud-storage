import './App.css';
import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Buckets from './pages/Buckets/Buckets';
import Profile from './pages/Profile/Profile';
import VerticalTabs from './components/VerticalTabs';
import Navbar from './components/Navbar';
import ResponsiveDrawer from './components/ResponsiveDrawer';
import LeftPanel from './components/LeftPanel';
// import { useHistory } from 'react-router-dom';

function App() {

  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(0);
  const handleSelectedTab = (tab) => {
    setSelectedTab(tab)
    console.log("Selected tab", tab)
  }


  return (
    <div className="App">
      {/* <VerticalTabs /> */}
      {/* <ResponsiveDrawer /> */}


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
      </Routes>


      {/* <Stage selectedTab /> */}

      {location.pathname !== '/' &&
        <div className="content-wrapper">
          <LeftPanel selectedTab={selectedTab} handleSelectedTab={handleSelectedTab} />
          <div className='stage-wrapper'>
            <Routes>

              <Route
                path='/dashboard/'
                element={<Dashboard />}
              >
              </Route>

              <Route
                path='/buckets/'
                element={<Buckets />}
              >
              </Route>

              <Route
                path='/profile/'
                element={<Profile />}
              >
              </Route>
            </Routes>

          </div>
        </div>
      }
    </div >
  );
}

export default App;

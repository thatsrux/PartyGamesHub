import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import ErrorBoundary from './components/ErrorBoundary';

// Placeholder Components for routes
import Home from './pages/Home';
import HostLobby from './pages/HostLobby';
import ClientJoin from './pages/ClientJoin';
import Profile from './pages/Profile';


function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<HostLobby />} />
          <Route path="/join" element={<ClientJoin />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

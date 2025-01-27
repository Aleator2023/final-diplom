import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AddHotelPage from './pages/AddHotelPage';
import AllHotelsPage from './pages/AllHotelsPage'; 
import RoomSearchPage from './pages/RoomSearchPage'; 
import UsersPage from './pages/UsersPage'; 
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/add-hotel" element={<AddHotelPage />} />
        <Route path="/admin/all-hotels" element={<AllHotelsPage />} />
        <Route path="/admin/room-search" element={<RoomSearchPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
      </Routes>
    </Router>
  );
}

export default App;
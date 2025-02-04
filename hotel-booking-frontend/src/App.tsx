import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AddHotelPage from './pages/AddHotelPage';
import EditHotelPage from './pages/EditHotelPage';
import AllHotelsPage from './pages/AllHotelsPage';
import RoomSearchPage from './pages/RoomSearchPage';
import User from './pages/User';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminLayout from './components/AdminLayout';

import HotelRoomsPage from './pages/HotelRoomsPage';
import EditHotelRoomPage from './pages/EditHotelRoomPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<LoginRegister />} />
        
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="hotels/:hotelId/rooms" element={<HotelRoomsPage />} /> 
          <Route path="hotels/:hotelId/add-room" element={<EditHotelRoomPage />} /> 
          <Route path="hotels/:hotelId/edit-room/:roomId" element={<EditHotelRoomPage />} /> 
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<User />} />
          <Route path="add-hotel" element={<AddHotelPage />} />
          <Route path="hotels/:id" element={<EditHotelPage />} />

          
          <Route path="all-hotels" element={<AllHotelsPage />} />
          <Route path="room-search" element={<RoomSearchPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
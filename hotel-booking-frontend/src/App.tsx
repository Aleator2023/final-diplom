import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AddHotelPage from './pages/AddHotelPage';
import EditHotelPage from './pages/EditHotelPage';
import AllHotelsPage from './pages/AllHotelsPage';
import User from './pages/User';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import LayoutComponent from './components/Layout';
import HotelRoomsPage from './pages/HotelRoomsPage';
import EditHotelRoomPage from './pages/EditHotelRoomPage';
import ClientAllHotelsPage from './pages/ClientAllHotelsPage';
import ClientHotelPage from './pages/ClientHotelPage.tsx';
import ClientBookings from './pages/ClientBookings';
import ManagerBookings from './pages/ManagerBookings';
import ChatClientSupport from './pages/ChatClientSupport';
import ChatManagerClients from './pages/ChatManagerClients';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegister />} />

        <Route path="/admin" element={<ProtectedRoute><LayoutComponent /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="hotels/:hotelId/rooms" element={<HotelRoomsPage />} />
          <Route path="hotels/:hotelId/rooms/:roomId" element={<HotelRoomsPage />} />
          <Route path="hotels/:hotelId/add-room" element={<EditHotelRoomPage />} />
          
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<User />} />
          <Route path="add-hotel" element={<AddHotelPage />} />
          <Route path="hotels/:hotelId" element={<EditHotelPage />} />
          <Route path="all-hotels" element={<AllHotelsPage />} />
        </Route>

        <Route path="/client" element={<ProtectedRoute><LayoutComponent /></ProtectedRoute>}>
          <Route path="all-hotels" element={<ClientAllHotelsPage />} />
          <Route path="hotels/:hotelId/" element={<ClientHotelPage />} />
          <Route path="my-bookings" element={<ClientBookings />} />
          <Route path="chat-support" element={<ChatClientSupport />} />
        </Route>

        <Route path="/manager" element={<ProtectedRoute><LayoutComponent /></ProtectedRoute>}>
          <Route path="all-hotels" element={<AllHotelsPage />} />
          <Route path="bookings" element={<ManagerBookings />} />
          <Route path="chat" element={<ChatManagerClients />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
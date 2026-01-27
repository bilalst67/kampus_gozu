import { Routes, Route } from 'react-router-dom';
import LoadPage from './pages/LoadPage';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import VerifyPage from './pages/VerifyPage';
import HeadPage from './pages/HeadPage';
import UsPage from './pages/UsPage';
import UsPageSet from './pages/UsPageSet';
import NewProblem from './pages/NewProblem';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoadPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/verify" element={<VerifyPage />} />

      {/* Protected User Routes */}
      <Route path="/anasayfa" element={<HeadPage />} />
      <Route path="/anasayfa/profil" element={<UsPage />} />
      <Route path="/anasayfa/profil/ayarlar" element={<UsPageSet />} />
      <Route path="/anasayfa/profil/yenisorun" element={<NewProblem />} />
      
      {/* Admin Route */}
      <Route path="/anasayfa/profil/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
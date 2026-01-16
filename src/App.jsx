import { Routes, Route, Link } from 'react-router-dom';
import UsPage from './pages/UsPage';
import LoadPage from './pages/LoadPage';
import Login from './pages/Login';
import About from './pages/About';
import SignIn from './pages/SignIn';
import NewProblem from './pages/NewProblem';
import HeadPage from './pages/HeadPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <div className="App">
        <Routes>
            <Route path='/' element={<LoadPage />}/>
            <Route path='/login' element={<Login />}/>
            <Route path='/anasayfa' element={<HeadPage />}/>
            <Route path="/anasayfa/profil" element={<UsPage />} />
            <Route path='/anasayfa/profil/yenisorun' element={<NewProblem />}/>
            <Route path='/anasayfa/profil/admin' element={<AdminPage/>}/>
            <Route path="/about" element={<About />} />
            <Route path='/signin'element={<SignIn />}/>
        </Routes>
    </div>
  );
}

export default App;
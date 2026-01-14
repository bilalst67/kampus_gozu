import { Route,Routes } from 'react-router-dom';
import LoadPage from './pages/LoadPage'
import HeadPage from './pages/HeadPage';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import About from './pages/About'
import './App.css'

function App() {
    return(
        <div>
        <Routes>
            <Route path='/' element={<LoadPage/>}/>
            <Route path='/homePage' element={<HeadPage/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/signin' element={<SignIn/>}/>
            <Route path='/about' element={<About/>}/>
        </Routes>
        </div>
    )
}

export default App;
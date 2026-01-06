import { Route,Link,Routes } from 'react-router-dom';
import HomePage from './pages/homepages/HomePage';
import UsHomePage from './pages/homepages/UsHomePage';
import Login from './pages/Login';
import Record from './pages/Record';
import './App.css'

function App() {
    return(
        <div>
        <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path='/homePage' element={<UsHomePage/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/record' element={<Record/>}/>
        </Routes>
        </div>
    )
}

export default App;
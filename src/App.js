import Auth from "./components/auth";
import Dashboard from "./components/dashboard";
import { useUserContext } from "./context/userContext";
import Success from './pages/Success';
import Canceled from './pages/Canceled';
import SignUp from './pages/new_signup';
import LogIn from './pages/new_login';

import Account from './pages/Account';
import Home from './pages/Home'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
function App() {
    
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="Auth" element={<Auth />} />
      <Route path="Dashboard" element={<Dashboard />} />
      <Route path="Account" element={<Account />}></Route>
      <Route path="success.html" element={<Success />}></Route>
      <Route path="canceled.html" element={<Canceled />}></Route>
      <Route path="SignUp" element={<SignUp />}></Route>
      <Route path="LogIn" element={<LogIn />}></Route>
      </Routes>
    </BrowserRouter>
    </div>
    
  );
}

export default App;

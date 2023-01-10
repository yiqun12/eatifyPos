import Auth from "./components/auth";
import Dashboard from "./components/dashboard";
import { useUserContext } from "./context/userContext";
import Success from './components_/Success';
import Canceled from './components_/Canceled';
import SignIn from './components_/new_signin';
import SignUp from './components_/new_signup';
import LogIn from './components_/new_login';

import Account from './components_/Account';
import Home from './components_/Home'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet
} from "react-router-dom";
function App() {
  const { user, loading, error } = useUserContext();

  return (
    <div className="App">
      {error && <p className="error">{error}</p>}
      {loading ? <h2>Loading...</h2> : <> {user ? <Dashboard /> : <Auth />} </>}
    
      <BrowserRouter>
      <Routes>
      <Route path="Home" element={<Home />} />
      <Route path="Account" element={<Account />}></Route>
      <Route path="success.html" element={<Success />}></Route>
      <Route path="canceled.html" element={<Canceled />}></Route>
      <Route path="SignIn" element={<SignIn />}></Route>
      <Route path="SignUp" element={<SignUp />}></Route>
      <Route path="LogIn" element={<LogIn />}></Route>
      </Routes>
    </BrowserRouter>
    </div>
    
  );
}

export default App;

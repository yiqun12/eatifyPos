import React, { useState } from "react";
import Axios from "axios";


function App() {
  const [registeremail, setRegisteremail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginemail, setLoginemail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [data, setData] = useState(null);

  const register = () => {
    Axios({
      method: "POST",
      data: {
        email: registeremail,
        password: registerPassword,
        username:username,
        phoneNumber:phoneNumber,
      },
      url: "http://localhost:8080/register",
    }).then((res) => console.log(res))//handle success
    .catch((error) => {
        console.log(error.response.data); // "The username or password is incorrect"
      });
 };

  const login = () => {
    Axios({
      method: "POST",
      data: {
        email: loginemail,
        password: loginPassword,
      },
      withCredentials: true,
      url: "http://localhost:8080/login",
    }).then((res) => console.log(res))
    .catch((error) => {
        console.log(error.response.data); // "The username or password is incorrect"
      });
 };

  
  const handleLogout  = () => {
    Axios({
      method: "get",
      withCredentials: true,
      url: "http://localhost:8080/logout",
    }).then((res) => console.log(res))
    .catch((error) => {
        console.log(error.response.data); // "The username or password is incorrect"
      });
 };



  return (
    <div className="App">
      <div>
        <h1>Register</h1>
        <input
  type="text"
  placeholder="username"
  onChange={(e) => setUsername(e.target.value)}
/>
<input
  type="text"
  placeholder="phone number"
  onChange={(e) => setPhoneNumber(e.target.value)}
/>
        <input
          placeholder="email"
          onChange={(e) => setRegisteremail(e.target.value)}
        />
        <input
          placeholder="password"
          onChange={(e) => setRegisterPassword(e.target.value)}
        />
        <button onClick={register}>Submit</button>
      </div>

      <div>
        <h1>Login</h1>
        <input
          placeholder="email"
          onChange={(e) => setLoginemail(e.target.value)}
        />
        <input
          placeholder="password"
          onChange={(e) => setLoginPassword(e.target.value)}
        />
        <button onClick={login}>Submit</button>
      </div>

      <div>
        <h1>Logout</h1>
        <button onClick={handleLogout}>logout</button>
      </div>

    </div>


  );
}

export default App;

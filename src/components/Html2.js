import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/index';
import { useUserContext } from "../context/userContext";

function App() {
  const [isGuestPresent, setIsGuestPresent] = useState(false);
  const { id } = useParams();

  const checkGuestFunction = httpsCallable(functions, 'checkGuest');
  const { signInWithGuestLink,logoutUser } = useUserContext();

  useEffect(() => {
    checkGuestFunction({ id })
      .then(result => {
        setIsGuestPresent(result.data.exists);
        console.log(result.data.exists);
        if (result.data.exists){
            signInWithGuestLink()
        }
      })
      .catch(error => {
        console.error('Error checking guest: ', error);
      });
  }, [id]);

  return (
    <div className="App">
      {isGuestPresent && 'Hello. Please Enter your table number Here:'}
    </div>
  );
}

export default App;


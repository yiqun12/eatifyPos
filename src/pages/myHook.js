import React, { useContext, useEffect, useState } from 'react';

import PropTypes from 'prop-types';

const MyContext = React.createContext();

const useMyHookEffect = (initId) => {
  const [id, setId] = useState(initId);
  const saveId = (id) => {
    window.sessionStorage.setItem('id', id);
    setId(id);
  };
  
  useEffect(() => {
    //Now you can get the id from the sessionStorage
    const myId = window.sessionStorage.getItem('id');
    setId(myId);
  }, []);

  return { id, saveId };
};

// Provider component that wraps app and makes themeMode object
export function MyHookProvider({ children, id }) {
  const myEffect = useMyHookEffect(id);
  return (
    <MyContext.Provider value={myEffect}>
        {children}
    </MyContext.Provider>
  );
}

MyHookProvider.defaultProps = {
  children: null,
  id: null,
};

MyHookProvider.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};

export const useMyHook = () => useContext(MyContext);
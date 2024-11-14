import './App.css'
import Navbar from './components/Navbar'
import ProjectList from './components/ProjectList'
import Dashboard from './components/Dashboard'
import AuthComponent  from './components/AuthScreen'
import { useState, useEffect } from 'react'


function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  return (
    <>
      {token ? (
        <>
          <Navbar setToken={setToken} />
          {/* <Dashboard /> */}
          <ProjectList token={token} />
        </>
      ) : (
        <AuthComponent setToken={setToken}  />
      )}
    </>
  );
}


export default App

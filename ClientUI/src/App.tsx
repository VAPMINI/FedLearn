import Dashboard from './components/Dashboard';
import AuthComponent from './components/AuthScreen';
import ProjectList from './components/ProjectList';
import Navbar from './components/Navbar';
import { useState, useEffect } from 'react';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  return (
    <>
      {token ? (
        <>
          <Navbar setToken={setToken} />
          {currentProject ? (
            <Dashboard token={token} currentProject={currentProject} setCurrentProject={setCurrentProject} />
          ) : (
            <ProjectList token={token} setCurrentProject={setCurrentProject} />
          )}
        </>
      ) : (
        <AuthComponent setToken={setToken} />
      )}
    </>
  );
}

export default App;
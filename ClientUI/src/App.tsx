import './App.css'
import Navbar from './components/Navbar'
import ProjectList from './components/ProjectList'
import Dashboard from './components/Dashboard'
import AuthComponent  from './components/AuthScreen'



function App() {

  return (
    <>
    {/* <AuthComponent /> */}
<Navbar />
<Dashboard />
<ProjectList />
    </>
  )
}

export default App

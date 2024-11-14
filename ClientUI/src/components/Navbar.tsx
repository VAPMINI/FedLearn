import React from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar: React.FC = ( {setToken} ) => {


    const signOut = ()=>{
        localStorage.setItem('token','') 
        setToken("")
    }

    return (
        <nav className="flex justify-between items-center p-4 bg-base-300 text-base-content">
            <div className="text-2xl font-bold">FedLearn</div>
            <div className="flex space-x-2">
                <button className="btn btn-primary">
                    <FaUserCircle /> Account
                </button>
                <button className="btn btn-secondary" onClick={signOut}>
                    <FaSignOutAlt /> Sign Out
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

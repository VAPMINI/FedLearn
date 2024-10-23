import React, { useState } from 'react';
import { FaUser, FaHistory, FaCog, FaBell, FaLock, FaUserCog, FaChartLine, FaUsers, FaClipboardList } from 'react-icons/fa';

interface Contributor {
  username: string;
  profileLink: string;
}

export default function Dashboard() {
  // Sample data for the project
  const [projectName] = useState('My Awesome Project');
  const [collaboratorsCount] = useState(5);
  const [modelAccuracy] = useState('85%');
  const [description] = useState('This is a brief description of the project.');
  const [history] = useState<Contributor[]>([
    { username: 'Alice', profileLink: '#' },
    { username: 'Bob', profileLink: '#' },
    { username: 'Charlie', profileLink: '#' },
  ]);
  const [currentContributors] = useState<Contributor[]>([
    { username: 'Alice', profileLink: '#' },
    { username: 'Bob', profileLink: '#' },
  ]);

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="navbar bg-base-100 rounded-box shadow-lg mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold px-4">{projectName}</h1>
        </div>
        <div className="flex-none">
          <button className="btn btn-ghost btn-circle">
            <div className="indicator">
              <FaBell className="h-5 w-5" />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Project Overview */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Project Overview</h2>
            <div className="stats stats-vertical shadow">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <FaUsers className="inline-block w-8 h-8 stroke-current" />
                </div>
                <div className="stat-title">Collaborators</div>
                <div className="stat-value">{collaboratorsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <FaChartLine className="inline-block w-8 h-8 stroke-current" />
                </div>
                <div className="stat-title">Model Accuracy</div>
                <div className="stat-value">{modelAccuracy}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Project Description</h2>
            <p>{description}</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Contribute Now</button>
            </div>
          </div>
        </div>

        {/* Current Contributors */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Current Contributors</h2>
            <ul className="menu bg-base-200 rounded-box">
              {currentContributors.map((contributor, index) => (
                <li key={index}>
                  <a href={contributor.profileLink} className="flex items-center">
                    <FaUser className="mr-2" />
                    {contributor.username}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* History */}
        <div className="card bg-base-100 shadow-xl md:col-span-2">
          <div className="card-body">
            <h2 className="card-title">
              <FaHistory className="mr-2" />
              History
            </h2>
            <ul className="menu bg-base-200 rounded-box">
              {history.map((contributor, index) => (
                <li key={index}>
                  <a href={contributor.profileLink} className="flex items-center">
                    <FaUser className="mr-2" />
                    {contributor.username}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Settings */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              <FaCog className="mr-2" />
              Settings
            </h2>
            <ul className="menu bg-base-200 rounded-box">
              <li>
                <a>
                  <FaBell className="mr-2" />
                  Manage Notifications
                </a>
              </li>
              <li>
                <a>
                  <FaLock className="mr-2" />
                  Change Password
                </a>
              </li>
              <li>
                <a>
                  <FaUserCog className="mr-2" />
                  Account Settings
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
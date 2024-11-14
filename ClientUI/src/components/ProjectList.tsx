import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers, FaChartLine, FaPlus, FaRegSadTear } from 'react-icons/fa';
import CONFIG from '../config/config';

interface Project {
  name: string;
  description: string;
  collaborators: number;
  accuracy: number; // Assuming accuracy is stored as a number (percentage)
}

interface ProjectListProps {
  token: string;
}

const ProjectCard: React.FC<Project> = ({ name, description, collaborators, accuracy }) => {
  return (
    <div className="card w-full sm:w-96 bg-base-100 shadow-xl m-4">
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <p>{description}</p>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <FaUsers className="mr-2 text-primary" />
            <span>{collaborators}</span>
          </div>
          <div className="flex items-center">
            <FaChartLine className="mr-2 text-secondary" />
            <span>{accuracy}%</span>
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary">View Project</button>
        </div>
      </div>
    </div>
  );
};

const ProjectList: React.FC<ProjectListProps> = ({ token }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the projects from the backend
    axios
      .get(`${CONFIG.BACKEND_URI}/project`, {
        headers: {
          Authorization: `Bearer ${token}`, // Sending the token as Bearer token
        },
      })
      .then((response) => {
        // Set projects data from the response
        if (Array.isArray(response.data)) {
          setProjects(response.data);
        } else {
          setProjects([]); // Ensure projects is always an array
        }
        setLoading(false);
      })
      .catch((error) => {
        setError('Error fetching projects');
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Your Projects</h2>
          <button className="btn btn-primary">
            <FaPlus className="mr-2" />
            New Project
          </button>
        </div>
        <div className="flex justify-center items-center flex-col mt-10">
          <FaRegSadTear className="text-6xl text-gray-500 mb-4" />
          <h3 className="text-2xl text-gray-600">You have no projects yet!</h3>
          <p className="text-gray-500 mt-2">Start by creating a new project.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Your Projects</h2>
        <button className="btn btn-primary">
          <FaPlus className="mr-2" />
          New Project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            name={project.name}
            description={project.description}
            collaborators={project.collaborators}
            accuracy={project.accuracy} // Ensure accuracy is a number
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;

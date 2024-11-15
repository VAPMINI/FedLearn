import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers, FaChartLine, FaPlus, FaRegSadTear } from 'react-icons/fa';
import CONFIG from '../config/config';

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
}

interface Project {
  uuid: string;
  name: string;
  description: string;
  owner: User;
  collaborators: User[];
  accuracy: number;
}

interface ProjectListProps {
  token: string;
  setCurrentProject: (projectUuid: string) => void;
}

interface ProjectCardProps {
  name: string;
  description: string;
  ownerName: string;
  collaboratorsCount: number;
  accuracy: number;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  ownerName,
  collaboratorsCount,
  accuracy,
  onClick,
}) => {
  return (
    <div className="card w-full sm:w-96 bg-base-100 shadow-xl m-4 cursor-pointer" onClick={onClick}>
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <p>{description}</p>
        <p className="text-sm text-gray-500">Owner: {ownerName}</p>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <FaUsers className="mr-2 text-primary" />
            <span>{collaboratorsCount}</span>
          </div>
          <div className="flex items-center">
            <FaChartLine className="mr-2 text-primary" />
            <span>{accuracy}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectList: React.FC<ProjectListProps> = ({ token, setCurrentProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    isPrivate: false,
    activation_function: '',
    dropout_rate: '',
    combining_method: '',
    input_shape: '',
    num_layers: '',
    units_per_layer: '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${CONFIG.BACKEND_URI}/project`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data.projects || []);
      } catch (err) {
        setError('Error fetching projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.description) {
      setError('Please fill in both name and description.');
      return;
    }

    try {
      await axios.post(`${CONFIG.BACKEND_URI}/project`, newProject, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the project list after successful creation
      const response = await axios.get(`${CONFIG.BACKEND_URI}/project`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data.projects || []);
      setIsModalOpen(false);
      setNewProject({
        name: '',
        description: '',
        isPrivate: false,
        activation_function: '',
        dropout_rate: '',
        combining_method: '',
        input_shape: '',
        num_layers: '',
        units_per_layer: '',
      });
      setError(null);
    } catch (err) {
      setError('Error creating project');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type, checked } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Your Projects</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FaPlus className="mr-2" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex justify-center items-center flex-col mt-10">
          <FaRegSadTear className="text-6xl text-gray-500 mb-4" />
          <h3 className="text-2xl text-gray-600">You have no projects yet!</h3>
          <p className="text-gray-500 mt-2">Start by creating a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.uuid}
              name={project.name}
              description={project.description}
              ownerName={project.owner.username}
              collaboratorsCount={project.collaborators.length}
              accuracy={project.accuracy}
              onClick={() => setCurrentProject(project.uuid)}
            />
          ))}
        </div>
      )}

      {/* Modal for creating a new project */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-2xl font-semibold mb-4">Create New Project</h3>
            <div className="mb-4">
              <label className="block mb-2">Project Name</label>
              <input
                type="text"
                name="name"
                value={newProject.name}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Project Name"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Description</label>
              <textarea
                name="description"
                value={newProject.description}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Project Description"
              />
            </div>
            {/* Additional project fields can be added here */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="isPrivate"
                checked={newProject.isPrivate}
                onChange={handleChange}
                className="mr-2"
              />
              <label>Private Project</label>
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="flex justify-end">
              <button
                className="btn btn-secondary mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateProject}>
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
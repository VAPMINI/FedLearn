// Contrib.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../config/config'; // Adjust the import path as necessary

interface ContribProps {
  token: string;
  currentProject: {
    name: string;
  };
}

const Contrib: React.FC<ContribProps> = ({ token, currentProject }) => {
  const [file, setFile] = useState<File | null>(null);
  const [epochs, setEpochs] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [projectName, setProjectName] = useState('');
  const [collaboratorsCount, setCollaboratorsCount] = useState(0);
  const [modelAccuracy, setModelAccuracy] = useState('');
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState<Contributor[]>([]);
  const [currentContributors, setCurrentContributors] = useState<Contributor[]>([]);
  const [isAddContributorModalOpen, setIsAddContributorModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contributor[]>([]);
  const [newContributor, setNewContributor] = useState('');
  const [editProjectDetails, setEditProjectDetails] = useState({
    name: '',
    description: '',
    activation_function: '',
    dropout_rate: '',
    combining_method: '',
    input_shape: '',
    num_layers: '',
    units_per_layer: ''
  });


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${CONFIG.BACKEND_URI}/project`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const projects = response.data.projects || [];
        const projectData = projects.find(project => project.uuid === currentProject);

        if (projectData) {
          setProjectName(projectData.name || 'No Project Name');
          setCollaboratorsCount((projectData.collaborators && projectData.collaborators.length) || 0);
          setModelAccuracy(projectData.accuracy || 'N/A');
          setDescription(projectData.description || 'No Description Available');
          setHistory((projectData.contributions || []).map(contribution => ({
            username: contribution.user.username || 'Unknown User',
            profileLink: `/users/${contribution.user._id || '#'}`
          })));
          setCurrentContributors([
            {
              username: projectData.owner.username || 'Unknown User',
              profileLink: `/users/${projectData.owner._id || '#'}`,
              isOwner: true
            },
            ...(projectData.collaborators || []).map(collaborator => ({
              username: collaborator.username || 'Unknown User',
              profileLink: `/users/${collaborator._id || '#'}`
            }))
          ]);
          setEditProjectDetails({
            name: projectData.name,
            description: projectData.description,
            activation_function: projectData.activation_function,
            dropout_rate: projectData.dropout_rate,
            combining_method: projectData.combining_method,
            input_shape: projectData.input_shape,
            num_layers: projectData.num_layers,
            units_per_layer: projectData.units_per_layer
          });
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjects();
  }, [currentProject, token]);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleEpochsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setEpochs(value);
    } else {
      setEpochs(1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Submitting...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);
    formData.append('url', `${CONFIG.BACKEND_URI}/project`);
    formData.append('projectName', projectName );
    formData.append('epochs', epochs.toString());

    try {
      console.log("SENDING REQUEST");
      const response = await axios.post('http://localhost:4000/train', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setStatusMessage('Contribution successful!');
      console.log('Response:', response.data);
      setFile(null);
      setEpochs(1);
    } catch (error: any) {
      console.error('Error during contribution:', error);
      setStatusMessage('An error occurred during contribution.');
      alert('Error during contribution. Please check the console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-4">Contribute to Project</h2>
      <form onSubmit={handleSubmit}>
        {/* File Input */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="file">
            Select File
          </label>
          <input
            type="file"
            id="file"
            accept=".zip,.json"
            onChange={handleFileChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Epochs Input */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="epochs">
            Number of Epochs
          </label>
          <input
            type="number"
            id="epochs"
            min="1"
            value={epochs}
            onChange={handleEpochsChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {/* Status Message */}
      {statusMessage && (
        <div className="mt-4">
          <p className="text-center text-gray-700">{statusMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Contrib;
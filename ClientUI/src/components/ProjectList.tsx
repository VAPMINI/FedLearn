import React from 'react';
import { FaUsers, FaChartLine, FaPlus } from 'react-icons/fa';

interface Project {
  title: string;
  description: string;
  collaborators: number;
  accuracy: string;
}

const projects: Project[] = [
  {
    title: 'MNIST Handwritten',
    description: 'Train a DL Model to recognize handwritten characters.',
    collaborators: 5,
    accuracy: '85%',
  },
  {
    title: 'Project Beta',
    description: 'This is the second project.',
    collaborators: 3,
    accuracy: '90%',
  },
  {
    title: 'Project Gamma',
    description: 'This is the third project.',
    collaborators: 2,
    accuracy: '80%',
  },
];

const ProjectCard: React.FC<Project> = ({ title, description, collaborators, accuracy }) => {
  return (
    <div className="card w-full sm:w-96 bg-base-100 shadow-xl m-4">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <FaUsers className="mr-2 text-primary" />
            <span>{collaborators}</span>
          </div>
          <div className="flex items-center">
            <FaChartLine className="mr-2 text-secondary" />
            <span>{accuracy}</span>
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary">View Project</button>
        </div>
      </div>
    </div>
  );
};

export default function ProjectList() {
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
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </div>
  );
}
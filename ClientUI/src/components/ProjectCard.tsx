import React from 'react';
import { FaUsers, FaChartLine } from 'react-icons/fa';

interface ProjectCardProps {
    title: string;
    description: string;
    collaborators: number;
    accuracy: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, collaborators, accuracy }) => {
    return (
        <div className="card w-64 bg-base-100 shadow-md p-4 m-2">
            <div className="card-body">
                <h3 className="card-title flex items-center">
                    <FaChartLine className="mr-2 text-primary" />
                    {title}
                </h3>
                <p>{description}</p>
                <div className="flex items-center mt-2">
                    <FaUsers className="mr-2 text-secondary" />
                    <span>Collaborators: {collaborators}</span>
                </div>
                <div className="flex items-center mt-2">
                    <FaChartLine className="mr-2 text-secondary" />
                    <span>Model Accuracy: {accuracy}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;

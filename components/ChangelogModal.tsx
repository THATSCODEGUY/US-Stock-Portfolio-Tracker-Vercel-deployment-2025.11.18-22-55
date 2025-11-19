import React from 'react';
import { XMarkIcon, SparklesIcon } from './icons';
import { changelog } from '../constants';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="changelog-title">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 id="changelog-title" className="text-xl font-bold text-white flex items-center">
                        <SparklesIcon className="h-6 w-6 mr-2 text-green-accent" />
                        What's New
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors" aria-label="Close">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <ul className="space-y-6">
                        {changelog.map((item, index) => (
                            <li key={item.version} className={`relative pl-8 ${index < changelog.length - 1 ? 'pb-6 border-l border-gray-600' : ''}`}>
                                 <div className="absolute -left-[9px] top-1 w-4 h-4 bg-green-accent rounded-full border-4 border-gray-800"></div>
                                 <p className="text-sm text-gray-400 mb-1">{item.date}</p>
                                 <h3 className="font-bold text-white">{item.title}</h3>
                                 <p className="text-gray-300 text-sm">{item.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
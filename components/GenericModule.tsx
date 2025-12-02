import React from 'react';
import { AlertCircle } from 'lucide-react';

interface GenericModuleProps {
  title: string;
  description: string;
}

export const GenericModule: React.FC<GenericModuleProps> = ({ title, description }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>
      
      <div className="bg-white rounded-lg border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Under Construction</h3>
        <p className="max-w-md text-slate-500 mt-2">
          The <strong>{title}</strong> module is currently being built. We are designing the architecture to support complex India-specific workflows.
        </p>
        <div className="mt-6">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Notify me when ready
          </button>
        </div>
      </div>
    </div>
  );
};

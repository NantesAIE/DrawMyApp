import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">Chargement...</h3>
            <p className="text-sm text-gray-600">Veuillez patienter</p>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ThumbnailResultProps {
  isLoading: boolean;
  generatedImages: string[];
  videoTitle: string;
}

const ThumbnailResult: React.FC<ThumbnailResultProps> = ({ isLoading, generatedImages, videoTitle }) => {
  const getFileName = (index: number) => {
    const baseName = videoTitle.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'thumbnail';
    return generatedImages.length > 1 ? `${baseName}_${index + 1}.png` : `${baseName}.png`;
  }

  return (
    <div className="w-full h-full bg-gray-800 rounded-lg flex justify-center items-center relative overflow-hidden p-2">
      {isLoading && <LoadingSpinner />}
      
      {!isLoading && generatedImages.length === 0 && (
        <div className="text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 font-semibold">Your thumbnails will appear here</p>
        </div>
      )}

      {!isLoading && generatedImages.length > 0 && (
        <div className={`w-full h-full overflow-y-auto grid gap-4 ${generatedImages.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {generatedImages.map((image, index) => (
            <div key={index} className="relative aspect-video group rounded-lg overflow-hidden shadow-lg">
              <img 
                src={`data:image/png;base64,${image}`} 
                alt={`Generated YouTube thumbnail variation ${index + 1}`} 
                className="w-full h-full object-cover animate-fade-in"
              />
              <a
                href={`data:image/png;base64,${image}`}
                download={getFileName(index)}
                className="absolute bottom-2 right-2 bg-indigo-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center space-x-2 opacity-0 group-hover:opacity-100"
                aria-label={`Download thumbnail ${index + 1}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Download</span>
              </a>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
        /* Custom scrollbar for the results grid */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #4a5568; /* bg-gray-600 */
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #718096; /* bg-gray-500 */
        }
      `}</style>
    </div>
  );
};

export default ThumbnailResult;
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ThumbnailResult from './components/ThumbnailResult';
import { generateThumbnail } from './services/geminiService';

interface HeadshotData {
  base64: string;
  mimeType: string;
}

const App: React.FC = () => {
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [headshots, setHeadshots] = useState<HeadshotData[]>([]);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [thumbnailStyle, setThumbnailStyle] = useState<string>('Vibrant');
  const [numThumbnails, setNumThumbnails] = useState<number>(1);
  const [generatedThumbnails, setGeneratedThumbnails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((files: FileList) => {
    const fileList = Array.from(files);
    const newHeadshotsPromises = fileList.map(file => {
        return new Promise<HeadshotData>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const [meta, base64] = result.split(',');
                const mimeTypeMatch = meta.match(/:(.*?);/);
                if (mimeTypeMatch && mimeTypeMatch[1]) {
                    resolve({ base64, mimeType: mimeTypeMatch[1] });
                } else {
                    reject(new Error("Could not parse mime type for file: " + file.name));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    Promise.all(newHeadshotsPromises)
        .then(newHeadshots => {
            setHeadshots(prev => [...prev, ...newHeadshots]);
        })
        .catch(err => {
            console.error("Error reading files:", err);
            setError("There was an error processing the uploaded images.");
        });
  }, []);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setHeadshots(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleClearAllImages = useCallback(() => {
    setHeadshots([]);
  }, []);

  const handleGenerateClick = useCallback(async () => {
    if (!videoTitle.trim()) {
      setError('Please enter a video title.');
      return;
    }
    if (headshots.length === 0) {
      setError('Please upload at least one headshot image.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setGeneratedThumbnails([]);

    try {
      const basePrompt = `Create a highly engaging, click-worthy YouTube thumbnail with a ${aspectRatio} aspect ratio. The video title is: "${videoTitle}". The desired style is "${thumbnailStyle}". This thumbnail should be vibrant, high-contrast, and eye-catching. Incorporate the provided headshots of the YouTuber, making them the focal point with expressive looks. Arrange the headshots creatively if there are multiple. The background should be dynamic and relevant to the video's topic. Add the video title as large, bold, and easily readable text on the image. The overall style should look professional and designed to maximize click-through rates, adhering to the "${thumbnailStyle}" aesthetic.`;
      
      const generationPromises = Array.from({ length: numThumbnails }).map((_, i) => {
        const variedPrompt = numThumbnails > 1 
          ? `${basePrompt} This is variation ${i + 1} of ${numThumbnails}. Please try a different layout, color scheme, or composition to provide a unique alternative.`
          : basePrompt;
        return generateThumbnail(variedPrompt, headshots);
      });
      
      const results = await Promise.all(generationPromises);
      setGeneratedThumbnails(results);

    } catch (e) {
      console.error(e);
      setError('Failed to generate thumbnail(s). Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, [videoTitle, headshots, aspectRatio, thumbnailStyle, numThumbnails]);

  const aspectRatioOptions = [
    { value: '16:9', label: 'Widescreen' },
    { value: '4:3', label: 'Standard' },
    { value: '1:1', label: 'Square' },
  ];
  
  const styleOptions = [
    { value: 'Vibrant', label: 'Vibrant' },
    { value: 'Minimalist', label: 'Minimalist' },
    { value: 'Cinematic', label: 'Cinematic' },
    { value: 'Cartoonish', label: 'Cartoonish' },
  ];
  
  const numOptions = [1, 2, 3];


  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full max-w-6xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg flex flex-col space-y-6">
          <div>
            <label htmlFor="video-title" className="block text-sm font-medium text-indigo-300 mb-2">
              1. Enter Your Video Title
            </label>
            <input
              type="text"
              id="video-title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="e.g., My Trip to the Andes Mountains!"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-indigo-300">
                2. Upload Your Headshot(s)
              </label>
              {headshots.length > 0 && (
                <button
                  onClick={handleClearAllImages}
                  className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
            </div>
            <ImageUploader 
              images={headshots} 
              onImageUpload={handleImageUpload} 
              onRemoveImage={handleRemoveImage}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-300 mb-2">
              3. Select Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-3">
              {aspectRatioOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setAspectRatio(option.value)}
                  className={`py-3 px-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    aspectRatio === option.value
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.value} <span className="hidden sm:inline">({option.label})</span>
                </button>
              ))}
            </div>
          </div>
           <div>
            <label className="block text-sm font-medium text-indigo-300 mb-2">
              4. Select a Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {styleOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setThumbnailStyle(option.value)}
                  className={`py-3 px-2 rounded-lg text-sm font-semibold transition-colors duration-200 truncate ${
                    thumbnailStyle === option.value
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-300 mb-2">
              5. Number of Thumbnails
            </label>
            <div className="grid grid-cols-3 gap-3">
              {numOptions.map(num => (
                <button
                  key={num}
                  onClick={() => setNumThumbnails(num)}
                  className={`py-3 px-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    numThumbnails === num
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {num} Image{num > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4">
            <button
              onClick={handleGenerateClick}
              disabled={isLoading || !videoTitle || headshots.length === 0}
              className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-300 ease-in-out transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                '✨ Generate Thumbnail(s)'
              )}
            </button>
             {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-lg flex flex-col justify-start items-center">
          <h2 className="text-lg font-semibold text-indigo-300 mb-4 self-start">6. Your AI-Generated Thumbnails</h2>
          <ThumbnailResult 
            isLoading={isLoading} 
            generatedImages={generatedThumbnails}
            videoTitle={videoTitle}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
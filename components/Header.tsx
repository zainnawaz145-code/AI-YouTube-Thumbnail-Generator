import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-6xl text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
        AI YouTube Thumbnail Generator
      </h1>
      <p className="mt-2 text-lg text-gray-300">
        Create click-worthy thumbnails in seconds. Just provide a title and your headshot.
      </p>
    </header>
  );
};

export default Header;

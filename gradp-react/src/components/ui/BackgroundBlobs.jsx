import React from 'react';

const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Blob 1 - Top Left */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/20 dark:bg-blue-600/10 blur-[100px] animate-blob" />
      
      {/* Blob 2 - Bottom Right */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-lime-500/20 dark:bg-lime-600/10 blur-[120px] animate-blob [animation-delay:2s]" />
      
      {/* Blob 3 - Center (optional) */}
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/5 blur-[80px] animate-blob [animation-delay:4s]" />
    </div>
  );
};

export default BackgroundBlobs;

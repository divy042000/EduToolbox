import React from 'react';

export default function AboutPage() {
  return (
    <div className=" relative flex flex-col items-center justify-center min-h-screen py-2 ">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-4">About Me</h1>
        <p className="text-xl mb-8">Welcome to our About Page. Here you can learn more about us, our mission, and what we do.</p>
        <div className="flex justify-center space-x-4">
          
          <button className="rounded-md font-mono bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Contact Us
          </button>
        </div>
      </main>
    </div>
  );
}

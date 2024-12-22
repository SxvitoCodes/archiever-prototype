"use client"
import { useState } from 'react';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  return (
    <nav className="p-4 bg-white dark:bg-gray-800">
        <div className='max-w-screen-2xl mx-auto flex justify-between items-center'>
            {/* Logo */}
            <span className="text-4xl lg:text-5xl font-semibold text-black dark:text-white"><span className='text-accent'>A</span>chiever</span>

            {/* Dark Mode Switch */}
            <button 
                onClick={toggleDarkMode} 
                className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full text-lg">
                {darkMode ? '🌙' : '☀️'}
            </button>
        </div>
    </nav>
  );
};

export default Navbar;

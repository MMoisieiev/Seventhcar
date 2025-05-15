"use client";

import React, { useState, useEffect } from 'react';
import { LucideInfo, MessageSquare, Mail, Phone } from 'lucide-react';

const InformBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isXL, setIsXL] = useState(false);

  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsXL(window.innerWidth >= 1280);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={`fixed ${!isXL? 'bottom-0 right-4' :'top-1/2 right-0'} -translate-y-1/2 flex flex-col shadow-lg items-center space-y-2 z-50`}>
      {!isXL && (
        <button
          onClick={toggleOpen}
          className="bg-gradient-to-l to-[#1cb4ec] from-[#1c78ec] cursor-pointer p-4 shadow-lg rounded-md"
          aria-label="Toggle Info"
        >
          <LucideInfo/>
        </button>
      )}

      {(isOpen || isXL) && (
        <div className="flex flex-col items-center rounded-s-lg overflow-hidden">
          <button className="bg-white p-4 text-[#1c7fec] shadow-lg hover:bg-gradient-to-l to-[#1cb4ec] from-[#1c78ec] hover:text-white" aria-label="Message">
            <MessageSquare/>
          </button>
          <button className="bg-white p-4 text-[#1c7fec] shadow-lg hover:bg-gradient-to-l to-[#1cb4ec] from-[#1c78ec] hover:text-white border-t border-gray-100" aria-label="Mail">
            <Mail/>
          </button>
          <button className="bg-white p-4 text-[#1c7fec] shadow-lg hover:bg-gradient-to-l to-[#1cb4ec] from-[#1c78ec] hover:text-white border-t border-gray-100" aria-label="Phone">
            <Phone/>
          </button>
          <button className="bg-white p-4 text-[#1c7fec] shadow-lg hover:bg-gradient-to-l to-[#1cb4ec] from-[#1c78ec] hover:text-white border-t border-gray-100" aria-label="Phone">
            <Phone/>
          </button>
          <button className="bg-white p-4 text-[#1c7fec] shadow-lg hover:bg-gradient-to-l to-[#1cb4ec] from-[#1c78ec] hover:text-white border-t border-gray-100" aria-label="Phone">
            <Phone/>
          </button>
        </div>
      )}
    </div>
  );
};

export default InformBox;

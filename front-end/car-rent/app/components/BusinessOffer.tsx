import React from 'react';
import Image from 'next/image';
import { ChevronRight, IndentDecrease } from 'lucide-react';

const BusinessOffer = () => {
  return (
    <div className="w-full max-w-6xl mx-auto relative">
      {/* Circular gradient background */}
      <div className="bg-gradient-to-l to-[#1cb4ec] from-[#1c78ec] h-[232px] w-[232px] absolute z-[-10] rounded-full top-[27%] md:top-10 -left-[35%] md:left-[40%]" />
      <div className="bg-gradient-to-l to-[#1cb4ec] from-[#1c78ec] h-[130px] w-[130px] absolute z-[0] rounded-full -right-[15%] md:right-[25%] bottom-12 md:-bottom-12" />
      <div className="bg-gradient-to-l to-[#1cb4ec] from-[#1c78ec] h-[87px] w-[87px] absolute z-[-10] rounded-full top-28 md:top-16 -right-[4%] md:right-0" />

      {/* Main container */}
      <div className="mt-6 flex flex-col lg:flex-row w-full pl-10 md:pl-12 pr-6 z-10 relative">
        {/* Left Side */}
        <div className="w-[400px] z-10">
          {/* Heading */}
          <div>
            <p className="text-[#1c7fec] font-bold text-[13px]">Business Offer</p>
            <h2 className="text-[30px] font-bold leading-tight">
              We ensure top quality <br />
              <span>premium business vehicles</span>
            </h2>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="hidden md:flex flex-1 relative z-50 mt-2">
          <div className="relative">
            <Image
              src="/Assets/bmw.png"
              alt="Business Car"
              width={800}
              height={400}
              className="w-auto h-[300px] rounded-xl relative z-30"
            />
            <div className="absolute bottom-16 right-10 z-40">
              <button className="bg-gradient-to-l to-[#1cb4ec] from-[#1c78ec] text-white px-10 md:py-5 rounded-md hover:to-[#1cea88] hover:from-[#17a932] transition-colors font-bold cursor-pointer">
                Business Offer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width black background block */}
      <div className="bg-[#17191c] text-white mx-auto rounded-2xl hidden relative md:block z-0">
        <div className="relative pl-8 mt-[-160px] pt-8 pb-12 z-10">
          <div className="px-4 w-[400px] flex flex-col items-center">
            {/* Text */}
            <div>
              <p className="text-[13px]">
                It is time to reduce costs of your business fleet, increase productivity and protect your investment in your establishment.
              </p>
            </div>
            <div className="absolute left-0 -bottom-5 translate-y-1/2 flex gap-6 z-10 w-1/3 pl-4 items-center justify-center">
              <Feature icon={<IndentDecrease />} title="Flexibility" />
              <Feature icon={<IndentDecrease />} title="Efficiency" />
              <Feature icon={<IndentDecrease />} title="Reliability" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#17191c] relative text-white mx-4 mt-4 rounded-2xl md:hidden flex flex-col items-center p-4 z-10">
        <p className="text-[13px]">
          It is time to reduce costs of your business fleet, increase productivity and protect your investment in your establishment.
        </p>
        <Image
          src="/Assets/bmw.png"
          alt="Business Car"
          width={800}
          height={400}
          className="w-auto h-[100px] rounded-xl mb-10 relative z-30"
        />
        <div className="flex gap-6 z-10 items-center justify-center absolute -bottom-[60px]">
          <Feature icon={<IndentDecrease />} title="Flexibility" />
          <Feature icon={<IndentDecrease />} title="Efficiency" />
          <Feature icon={<IndentDecrease />} title="Reliability" />
        </div>
      </div>

      <button className="hover:text-[#1c7fec] text-[12px] font-bold flex md:hidden items-center gap-1 justify-center mt-20 w-full z-10">
        View business offer <ChevronRight size={16} className="text-[#1c7fec]" />
      </button>
    </div>
  );
};

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center z-10">
      <div className="bg-white rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-blue-500 text-4xl">
        {icon}
      </div>
      <p className="text-black mt-2 font-bold md:font-medium text-[13px] md:text-base">{title}</p>
    </div>
  );
}

export default BusinessOffer;
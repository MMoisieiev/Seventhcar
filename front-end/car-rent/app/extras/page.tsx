"use client";

import { ChevronRight, Minus, Plus } from "lucide-react";

const Booking = () => {
  return (
    <div className="max-w-7xl mx-auto py-10">
      <h3 className="text-[30px] md:text-[36px] font-bold text-center mb-2 mt-14">
        Extras
      </h3>
      <div className="px-3 md:px-10 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <BookingItem />
        <BookingItem />
        <BookingItem />
        <BookingItem />
        <BookingItem />
        <BookingItem />
      </div>
    </div>
  );
};

export default Booking;

const BookingItem = () => {
  return (
    <div className="max-w-sm py-10 px-6 rounded-2xl bg-gray-100 shadow-md relative">
      <div className="absolute -top-4 -left-4 bg-white  rounded-full p-3">
        <div className=" w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-[#1c7fec]">
          <Plus className="w-6 h-6 text-[#1c7fec] font-bold" />
        </div>
      </div>

      <p className="text-xs font-bold text-[#1c7fec] mb-1">(0-9 kg)</p>

      <h2 className="md:text-lg text-base font-bold mb-2">Baby Seat</h2>

      <p className="text-xs mb-4 leading-relaxed">
        Ensure that your babies can travel safely and worry-free. The law
        mandates the usage of a baby seat, so avoid paying the fine. Suitable
        for babies from 0 kg to 9 kg.
      </p>

      <div className="flex items-center justify-between">
        {/* Price */}
        <div className="text-lg font-bold">
          3.45 <span className="text-sm font-normal">EUR / day</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="text-lg font-bold px-2">
            <Minus />
          </button>
          <span className="font-semibold">1</span>
          <button className="text-lg font-bold px-2">
            <Plus />
          </button>
        </div>

        <button className="bg-gradient-to-r from-[#fff] to-[#fff] hover:from-[#1cb4ec] hover:to-[#1c78ec] hover:text-white cursor-pointer text-sm font-extrabold px-4 py-2 rounded-lg group">
          <span className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4 text-[#1c7fec] group-hover:text-white" />
            Select
          </span>
        </button>
      </div>
    </div>
  );
};

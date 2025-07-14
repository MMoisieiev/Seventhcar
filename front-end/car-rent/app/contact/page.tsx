"use client";

import {
  ChevronRight,
  Mail,
  Phone,
  Plane,
  MessageSquareText,
  UserPlus,
} from "lucide-react";
import React from "react";
import Footer from "../components/Footer";

const Contact = () => {
  return (
    <>
      <div className="px-4 md:px-10 py-10 mt-16 h-screen">
        <div className="w-full max-w-5xl mx-auto">
  <div className="p-6 bg-white text-black font-montserrat rounded-2xl">
    <h2 className="text-2xl font-bold mb-6">Basic information</h2>
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative">
        <label className="block text-sm font-semibold mb-1">
          First name
        </label>
        <input
          type="text"
          className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none"
          placeholder="Enter first name"
        />
        <UserPlus className="absolute bg-white p-1 left-[-10px] top-8 text-blue-500 rounded-full" />
      </div>

      <div className="relative">
        <label className="block text-sm font-semibold mb-1">
          Last name
        </label>
        <input
          type="text"
          className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none"
          placeholder="Enter last name"
        />
        <UserPlus className="absolute bg-white p-1 left-[-10px] top-8 text-blue-500 rounded-full" />
      </div>

      {/* Email, Phone, Flight Number in one row */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Email */}
        <div className="relative">
          <label className="block text-sm font-semibold mb-1">
            E-mail
          </label>
          <input
            type="email"
            className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none"
            placeholder="Enter e-mail"
          />
          <Mail className="absolute bg-white p-1 left-[-10px] top-8 text-blue-500 rounded-full" />
        </div>

        {/* Phone */}
        <div className="relative">
          <label className="block text-sm font-semibold mb-1">
            Phone
          </label>
          <input
            type="text"
            className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none"
            placeholder="Enter phone number"
          />
          <Phone className="absolute bg-white p-1 left-[-10px] top-8 text-blue-500 rounded-full" />
        </div>

        {/* Flight Number */}
        <div className="relative">
          <label className="block text-sm font-semibold mb-1">
            Flight number
          </label>
          <input
            type="text"
            className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none"
            placeholder="Enter flight number"
          />
          <Plane className="absolute bg-white p-1 left-[-10px] top-8 text-blue-500 rounded-full" />
        </div>
      </div>

      <div className="relative col-span-1 md:col-span-2">
        <label className="block text-sm font-semibold mb-1">
          Additional notes
        </label>
        <textarea
          className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none min-h-[100px]"
          placeholder="Write any additional notes..."
        />
        <MessageSquareText className="absolute bg-white p-1 left-[-10px] top-16 text-blue-500 rounded-full" />
      </div>
    </form>
  </div>
</div>


        <div className="p-6 bg-white rounded-2xl space-y-4 mt-20">
          <h2 className="text-2xl font-bold text-gray-800">Payment options</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Pay on arrival */}
            <div className="relative bg-gray-50 rounded-xl p-6 hover:shadow-lg transition space-y-2 hover:border hover:border-blue-400 cursor-pointer">
              <h3 className="font-extrabold text-lg text-gray-900">
                Pay on arrival
              </h3>
              <p className="text-sm text-gray-700">
                Pay for the rental upon pick up of the vehicle with cards
                (credit, debit) or cash.
              </p>
              <ChevronRight className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white p-1 rounded-full text-blue-400" />
            </div>

            {/* 10% deposit payment */}
            <div className="relative bg-gray-50 rounded-xl p-6 hover:shadow-lg transition space-y-2 hover:border hover:border-blue-400 cursor-pointer">
              <h3 className="font-extrabold text-lg text-gray-900">
                10% deposit payment
              </h3>
              <p className="text-sm text-gray-700">
                The rest of 90% will be paid once you receive the car but
                without the possibility of cancellation or/and refund.
              </p>
              <ChevronRight className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white p-1 rounded-full text-blue-400" />
            </div>

            {/* 100% full amount payment */}
            <div className="relative bg-gray-50 rounded-xl p-6 hover:shadow-lg transition space-y-2 hover:border hover:border-blue-400 cursor-pointer">
              <h3 className="font-extrabold text-lg text-gray-900">
                100% full amount payment
              </h3>
              <p className="text-sm text-gray-700">
                Take advantage of the advance payment discount and keep the
                possibility of free cancellation and modification of the
                reservation up to 48 hours before the time of pick up.
              </p>
              <ChevronRight className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white p-1 rounded-full text-blue-400" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;

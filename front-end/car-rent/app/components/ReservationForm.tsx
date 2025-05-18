/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, Edit } from "lucide-react"
import Image from "next/image"
import locationIcon from "@/public/Assets/ico_location.svg"
import calendarIcon from "@/public/Assets/ico_date.svg"
import editIcon from "@/public/Assets/ico_edit.svg"

const ReservationForm = () => {
  const [island, setIsland] = useState("")
  const [pickupDate, setPickupDate] = useState("10/05/2025")
  const [pickupTime, setPickupTime] = useState("08:00")
  const [returnDate, setReturnDate] = useState("16/05/2025")
  const [returnTime, setReturnTime] = useState("08:00")
  const [driverAge, setDriverAge] = useState("")
  const images = ["/Assets/Mo-vew.jpg", "/Assets/black-car.webp", "/Assets/lsland-vew.webp"]
  const [bgIndex, setBgIndex] = useState(0)

  const handleBackgroundClick = () => {
    setBgIndex((prev) => (prev + 1) % images.length)
  }

  const handleFormClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  const handleSubmit = () => {
    if (!island || !pickupDate || !pickupTime || !returnDate || !returnTime || !driverAge) {
      alert("Please fill in all fields.")
      return
    }
    console.log({ island, pickupDate, pickupTime, returnDate, returnTime, driverAge })
  }

  return (
    <div
      className="w-full bg-cover bg-center flex flex-col items-center justify-center transition-all duration-500 px-4 md:px-0 py-24 md:py-28"
      style={{ backgroundImage: `url(${images[bgIndex]})` }}
      onClick={handleBackgroundClick}
    >
      <div className="max-w-4xl mx-auto text-center">
      <h3 className="md:text-[50px] text-[28px] text-white font-bold md:mt-20 mb-24 md:mb-0">Drive Your Dream on Mahé & Praslin</h3>
      </div>
      <div
        className="max-w-7xl w-full mx-auto bg-white py-4 md:py-8 md:px-10 px-6 rounded-t-xl rounded-br-xl md:rounded-br-none backdrop-blur-md bg-opacity-90 flex flex-col"
        onClick={handleFormClick}
      >
        {/* Island Selection */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-1">Island</label>
          <div className="relative w-full md:w-[450px]">
            <select
              value={island}
              onChange={(e) => setIsland(e.target.value)}
              className="w-full h-[65px] p-3 px-6 border border-[#1c7fec] rounded-md focus:outline-none appearance-none bg-[#f8f8f8]"
            >
              <option value="" disabled>
                Select location...
              </option>
              <option value="Island 1">Island 1</option>
              <option value="Island 2">Island 2</option>
              <option value="Island 3">Island 3</option>
            </select>
            <div className="absolute inset-y-0 -left-4 flex items-center pointer-events-none">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <Image src={locationIcon} alt="location icon" />
              </div>
            </div>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-[#1c7fec]" />
            </div>
          </div>
        </div>

        {/* Main Form Row */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:mb-6">
          {/* Pickup Time */}
          <div className="w-full">
            <label className="block text-sm font-bold mb-1">Pickup time!</label>
            <div className="grid grid-cols-2 gap-1">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 pl-6 h-[65px] rounded-md focus:outline-none bg-[#f8f8f8]"
                  value={pickupDate}
                  readOnly
                />
                <div className="absolute inset-y-0 -left-4 flex items-center pointer-events-none">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
              <Image src={calendarIcon} alt="calendar icon" />
              </div>
            </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 h-[65px] rounded-md focus:outline-none bg-[#f8f8f8]"
                  value={pickupTime}
                  readOnly
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Return Time */}
          <div className="w-full">
            <label className="block text-sm font-bold mb-1">Return time</label>
            <div className="grid grid-cols-2 gap-1">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 pl-10 h-[65px] rounded-md focus:outline-none bg-[#f8f8f8]"
                  value={returnDate}
                  readOnly
                />
                <div className="absolute inset-y-0 -left-4 flex items-center pointer-events-none">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
              <Image src={calendarIcon} alt="calendar icon" />
              </div>
            </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 h-[65px] rounded-md focus:outline-none bg-[#f8f8f8]"
                  value={returnTime}
                  readOnly
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Driver's Age */}
          <div className="w-full">
            <label className="block text-sm font-bold mb-1">Driver&apos;s Age</label>
            <div className="relative">
              <select
                value={driverAge}
                onChange={(e) => setDriverAge(e.target.value)}
                className="w-full appearance-none h-[65px] p-3 px-6 rounded-md focus:outline-none bg-[#f8f8f8]"
              >
                <option value="" disabled>
                  Select driver&apos;s age
                </option>
                <option value="18-25">18-20</option>
                <option value="26-35">21-70</option>
                <option value="36-45">71-99</option>
              </select>
              <div className="absolute inset-y-0 -left-4 flex items-center pointer-events-none">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
              <Image src={calendarIcon} alt="calendar icon" />
              </div>
            </div>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-[#1c7fec]" />
              </div>
            </div>
          </div>

        {/* START Button */}
        <div>
          <button
            onClick={handleSubmit}
            className="w-full px-16 h-[65px] bg-gradient-to-r hover:from-[#17a932] hover:to-[#1cea88] from-[#1cea88] to-[#17a932] text-white font-bold rounded-lg transition"
          >
            START
          </button>
        </div>
        <div className="bg-white rounded-b-2xl flex items-center gap-2 cursor-pointer md:hidden text-[13px]">
            <Image src={editIcon} alt="edit icon" />
            <span>Edit reservation</span>
          </div>
        </div>

      </div>
        {/* Bottom Navigation */}
        <div className="max-w-7xl mx-auto w-full text-[13px]">
        <div className="flex justify-between items-center w-full">
          <div className="flex">
            <div className="bg-white px-4 py-2 rounded-b-2xl cursor-pointer">Car rental</div>
            <div className="bg-gradient-to-r from-[#1cb4ec] to-[#1c7fec] rounded-b-2xl text-white px-4 py-2 cursor-pointer">Transfers</div>
            <div className="bg-gradient-to-r from-[#1cb4ec] to-[#1c7fec] rounded-b-2xl text-white px-4 py-2 cursor-pointer">Tours</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-b-2xl md:flex items-center gap-2 cursor-pointer hidden">
            <Image src={editIcon} alt="edit icon" />
            <span>Edit reservation</span>
          </div>
        </div>
        </div>
    </div>
  )
}

export default ReservationForm

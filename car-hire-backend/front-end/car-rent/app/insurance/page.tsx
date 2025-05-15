"use client";

import React, { useState } from "react";
import { Check, Info, X } from "lucide-react";
import Image from "next/image";
import infoIcon from "@/public/Assets/ico_tooltip.svg";

// Define the structure for insurance plan details
interface InsurancePlanDetails {
  title?: string;
  price?: string;
  unit?: string;
  daily_price?: string;
  tag?: string;
}

// Define the interface for insurance items
interface IInsuranceItem {
  title?: string;
  basic?: InsurancePlanDetails | boolean;
  medium?: InsurancePlanDetails | boolean;
  full?: InsurancePlanDetails | boolean;
}

// Define valid plan keys
type PlanKey = "basic" | "medium" | "full";

const insuranceData: IInsuranceItem[] = [
  {
    title: "Step 2. - Choosing insurance",
    basic: { title: "Basic Protect" },
    medium: { title: "Medium Protect", tag: "Most popular option" },
    full: { title: "Full Protect" },
  },
  {
    title: "Responsibility (Excess)",
    basic: { price: "950,00", unit: "EUR", daily_price: "0,00" },
    medium: { price: "475,00", unit: "EUR", daily_price: "20,00" },
    full: { price: "0,00", unit: "EUR", daily_price: "30,00" },
  },
  { title: "TPL", basic: true, medium: true, full: true },
  { title: "Additional", basic: true, medium: true, full: true },
  { title: "Unlimited Mileage", basic: true, medium: true, full: true },
  { title: "CDW", basic: true, medium: true, full: true },
  { title: "TP", basic: false, medium: true, full: true },
  { title: "Road Assistance 24/7", basic: false, medium: false, full: true },
  { title: "WUG", basic: false, medium: false, full: true },
  { title: "PAI", basic: false, medium: false, full: true },
];

const Insurance = () => {
  const [hoveredCol, setHoveredCol] = useState<PlanKey | null>(null);
  const [activeTab, setActiveTab] = useState<PlanKey>("basic");

  const getHoverClass = (col: PlanKey): string =>
    hoveredCol === col ? "bg-white cursor-pointer" : "";

  const plans: PlanKey[] = ["basic", "medium", "full"];

  return (
    <div className="max-w-5xl mx-auto py-10 mt-12">
      <h3 className="text-[30px] md:text-[36px] font-bold text-center">
        Insurance
      </h3>
      <div className="p-6 bg-white text-black font-montserrat">
        {/* Top Title */}
        <h2 className="block md:hidden text-center text-2xl font-bold mb-6">
          {insuranceData[0].title}
        </h2>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
          {/* Mobile Tabs */}
          <div className="flex md:hidden px-2 justify-around mb-0">
            {plans.map((plan) => (
              <button
                key={plan}
                onClick={() => setActiveTab(plan)}
                className={`w-56 px-4 py-2 font-extrabold border-t-2 border-l-2 border-r-2 border-b-0 border-blue-400 rounded-t-lg transition flex items-center justify-center gap-2 ${
                  activeTab === plan
                    ? "bg-white text-blue-500"
                    : "bg-gradient-to-br from-[#59ace3] to-[#0066ff] text-white"
                }`}
              >
                {activeTab === plan && (
                  <Check className="w-5 h-5 bg-gradient-to-br from-[#59ace3] to-[#0066ff] text-white rounded-full p-1" />
                )}
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </button>
            ))}
          </div>

          {/* Mobile Table */}
          <div className="block md:hidden">
            <div className="border-b-2 border-l-2 border-r-2 border-t-0 border-blue-400 rounded-b-lg hover:bg-blue-50 transition p-4 mx-2">
              {insuranceData.slice(1).map((item) => {
                const currentData = item[activeTab];

                return (
                  <div
                    className="flex w-full justify-between items-center mb-4"
                    key={item.title}
                  >
                    <h3 className="w-1/2 flex gap-2">
                      <Info className="bg-black opacity-20 text-white rounded-full" />
                      {item.title}
                    </h3>

                    <div className="w-1/2 flex justify-end">
                      {typeof currentData === "object" &&
                      "price" in currentData ? (
                        <span className="font-semibold">
                          {currentData.price} {currentData.unit}
                        </span>
                      ) : currentData === true ? (
                        <Check className="bg-blue-600 p-1 text-white rounded-full" />
                      ) : (
                        <X className="bg-gray-50 text-gray-500 p-1 rounded-full" />
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end items-end mt-10 gap-1 leading-none">
                <span className="text-4xl font-bold">
                  {
                    (insuranceData[1][activeTab] as InsurancePlanDetails)
                      ?.daily_price
                  }
                </span>
                <span className="text-sm pb-[2px]">EUR / day</span>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <table className="w-full text-center border-collapse hidden md:block">
            <thead>
              <tr>
                <th className="p-3">{insuranceData[0].title}</th>
                {plans.map((planKey) => (
                  <th
                    key={planKey}
                    className={`p-3 cursor-pointer transition duration-200 w-60 ${getHoverClass(
                      planKey
                    )}`}
                    onMouseEnter={() => setHoveredCol(planKey)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    {(insuranceData[0][planKey] as InsurancePlanDetails)?.title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {insuranceData.slice(1).map((item, index) => {
                const rowClass = index % 2 === 0 ? "bg-gray-100" : "";

                return (
                  <tr key={index} className={rowClass}>
                    <td className="p-3 flex items-center gap-3">
                      <Image src={infoIcon} alt="info icon" />
                      {item.title}
                    </td>

                    {plans.map((planKey) => (
                      <td
                        key={planKey}
                        className={`p-3 transition duration-200 text-lg font-bold ${getHoverClass(
                          planKey
                        )}`}
                        onMouseEnter={() => setHoveredCol(planKey)}
                        onMouseLeave={() => setHoveredCol(null)}
                      >
                        {typeof item[planKey] === "object" &&
                        "price" in item[planKey] ? (
                          `${(item[planKey] as InsurancePlanDetails).price} ${
                            (item[planKey] as InsurancePlanDetails).unit
                          }`
                        ) : item[planKey] === true ? (
                          <div className="flex justify-center">
                            <Check className="bg-gradient-to-br from-[#59ace3] to-[#0066ff] p-1 rounded-full text-white" />
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <X className="bg-gray-50 text-gray-500 rounded-full p-1" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}

              <tr>
                <td></td>
                {plans.map((planKey) => (
                  <td key={planKey} className="font-bold text-2xl">
                    {
                      (insuranceData[1][planKey] as InsurancePlanDetails)
                        ?.daily_price
                    }
                  </td>
                ))}
              </tr>

              <tr>
                <td></td>
                {plans.map((planKey) => (
                  <td
                    key={planKey}
                    className={`p-3 transition duration-200 ${getHoverClass(
                      planKey
                    )}`}
                    onMouseEnter={() => setHoveredCol(planKey)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <button className="px-4 py-2 bg-gradient-to-br from-[#f8f8f8] to-[#f8f8f8] hover:from-[#59ace3] hover:to-[#0066ff] hover:text-white rounded-lg hover:brightness-110 w-full">
                      Select
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Insurance;

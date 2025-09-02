"use client";

import {
  ChevronRight,
  Mail,
  Phone,
  Plane,
  MessageSquareText,
  UserPlus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import ReviewSummary, {
  BookingData,
  AvailableExtra,
  ReservationExtra,
} from "../components/ReviewSummary";

type PaymentOption = "arrival" | "deposit" | "full" | "";

const Contact = () => {
  const [openReview, setOpenReview] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption>("");

  // 1) Fetch extras list once (id, name, price)
  const [availableExtras, setAvailableExtras] = useState<AvailableExtra[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extras`);
        const raw = await r.json();
        setAvailableExtras(
          (Array.isArray(raw) ? raw : []).map((e: any) => ({
            id: Number(e.id),
            name: e.name ?? `Extra ${e.id}`,
            price: Number(e.price || 0),
          }))
        );
      } catch {
        setAvailableExtras([]);
      }
    })();
  }, []);

  // 2) Build initial data from localStorage (dates from step 1, car from step 2, extras from step 3/4)
  const [data, setData] = useState<BookingData>({
    // trip (mapped)
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    pickup_location: "",
    dropoff_location: "",

    // vehicle
    plate_number: "",
    car_model: "",

    // customer
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    flight_number: "",
    notes: "",

    // payment
    payment_option: "",

    // money
    estimated_total: 0,

    // extras (converted below)
    extras: [],
  });

  useEffect(() => {
    // pull reservation (dates/locations/insurance/extras) from step 1..4
    const resRaw = localStorage.getItem("pendingReservation");
    // pull chosen car from step 2
    const carRaw = localStorage.getItem("selectedCar");

    let reservation: any = {};
    let selectedCar: any = {};
    try { reservation = JSON.parse(resRaw || "{}"); } catch {}
    try { selectedCar = JSON.parse(carRaw || "{}"); } catch {}

    // Map reservation.extras to ReservationExtra[]
    // From Insurance: extras may be [id], from Extras: [{id, qty}, ...]
    const normalizeExtras = (): ReservationExtra[] => {
      const items = reservation?.extras || [];
      const list: ReservationExtra[] = [];

      const asArray = Array.isArray(items) ? items : [];
      for (const it of asArray) {
        const id = typeof it === "number" ? it : Number(it?.id);
        const qty = typeof it === "number" ? 1 : Number(it?.qty || 1);
        if (!id) continue;
        const found = availableExtras.find((a) => a.id === id);
        list.push({
          extra_id: id,
          price_at_booking: Number(found?.price || 0),
          days: 0, // derived in modal
          qty,
        });
      }
      return list;
    };

    // build initial object (dates carried over)
    setData((d) => ({
      ...d,
      start_date: reservation.pickupDate || "",
      start_time: reservation.pickupTime || "",
      end_date: reservation.returnDate || "",
      end_time: reservation.returnTime || "",
      pickup_location: reservation.island || "",
      dropoff_location: reservation.dropOff || "",

      plate_number: selectedCar.plate_number || "",
      car_model: selectedCar.model || "",

      extras: normalizeExtras(),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableExtras.length]); // run after extras fetched so prices can map

  // binder for customer inputs
  const bind = (key: keyof BookingData) => ({
    value: String(data[key] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [key]: (e.target as HTMLInputElement).value })),
  });

  const paymentOptions = [
    {
      id: "arrival" as const,
      title: "Pay on arrival",
      description:
        "Pay for the rental upon pick up of the vehicle with cards (credit, debit) or cash.",
    },
    {
      id: "deposit" as const,
      title: "10% deposit payment",
      description:
        "The rest of 90% will be paid once you receive the car but without the possibility of cancellation or/and refund.",
    },
    {
      id: "full" as const,
      title: "100% full amount payment",
      description:
        "Take advantage of the advance payment discount and keep the possibility of free cancellation and modification of the reservation up to 48 hours before the time of pick up.",
    },
  ];

  return (
    <>
      <div className="px-4 md:px-10 py-10 mt-16">
        <div className="w-full max-w-5xl mx-auto">
          <div className="p-6 bg-white text-black font-montserrat rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Basic information</h2>

            {/* No date fields here — dates carried from ReservationForm */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold mb-1">First name</label>
                <input
                  type="text"
                  className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none"
                  placeholder="Enter first name"
                  {...bind("firstName")}
                />
                <UserPlus className="absolute bg-white p-1 left-[-10px] top-8 text-blue-500 rounded-full" />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold mb-1">Last name</label>
                <input
                  type="text"
                  className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none"
                  placeholder="Enter last name"
                  {...bind("lastName")}
                />
                <UserPlus className="absolute bg-white p-1 left-[-10px] top-8 text-blue-500 rounded-full" />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none"
                    placeholder="Enter e-mail"
                    {...bind("email")}
                  />
                  <Mail className="absolute bg-white p-1 left-[-10px] top-8 text-blue-500 rounded-full" />
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none"
                    placeholder="Enter phone number"
                    {...bind("phone")}
                  />
                  <Phone className="absolute bg-white p-1 left-[-10px] top-8 text-blue-500 rounded-full" />
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold mb-1">Flight number</label>
                  <input
                    type="text"
                    className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none"
                    placeholder="Enter flight number"
                    {...bind("flight_number")}
                  />
                  <Plane className="absolute bg-white p-1 left-[-10px] top-8 text-blue-500 rounded-full" />
                </div>
              </div>

              <div className="relative col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Additional notes</label>
                <textarea
                  className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 outline-none min-h-[100px]"
                  placeholder="Write any additional notes..."
                  {...bind("notes")}
                />
                <MessageSquareText className="absolute bg-white p-1 left-[-10px] top-16 text-blue-500 rounded-full" />
              </div>
            </form>
          </div>
        </div>

        {/* Payment Options */}
        <div className="p-6 bg-white rounded-2xl space-y-6 mt-20">
          <h2 className="text-2xl font-bold text-gray-800">Payment options</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {paymentOptions.map((opt) => {
              const isActive = selectedPayment === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    setSelectedPayment(opt.id);
                    setData((d) => ({ ...d, payment_option: opt.id }));
                  }}
                  className={`relative rounded-xl p-6 cursor-pointer transition space-y-2 border
                    ${isActive ? "bg-blue-500 text-white border-blue-600 shadow-lg"
                               : "bg-gray-50 text-gray-900 hover:shadow-lg hover:border-blue-400"}`}
                >
                  <h3 className={`font-extrabold text-lg ${isActive ? "text-white" : "text-gray-900"}`}>
                    {opt.title}
                  </h3>
                  <p className={`text-sm ${isActive ? "text-gray-100" : "text-gray-700"}`}>
                    {opt.description}
                  </p>
                  <ChevronRight className={`absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 p-1 rounded-full 
                    ${isActive ? "bg-white text-blue-500" : "bg-white text-blue-400"}`} />
                </div>
              );
            })}
          </div>

          {/* Proceed Button */}
          <div className="flex justify-center mt-8">
            <button
              disabled={!selectedPayment}
              onClick={() => setOpenReview(true)}
              className={`px-6 py-3 rounded-xl font-bold transition
                ${selectedPayment ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            >
              Proceed to Confirmation
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewSummary
        open={openReview}
        onClose={() => setOpenReview(false)}
        mode="create"
        lockCar={true}
        initialData={data}                 // ← dates, car, extras are prefilled from storage
        availableExtras={availableExtras}
        onConfirm={(confirmed) => {
          // Persist the final confirmation if you need, or go to payment
          setData(confirmed);
          setOpenReview(false);
        }}
      />

      <Footer />
    </>
  );
};

export default Contact;

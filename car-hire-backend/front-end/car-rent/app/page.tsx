import Image from "next/image";
import AboutAndCom from "./components/AboutAndCom";
import BusinessOffer from "./components/BusinessOffer";
import ContactUs from "./components/ContactUs";
import Exta from "./components/Exta";
import InformBox from "./components/InformBox";
import ReservationForm from "./components/ReservationForm";
import SpecialOffers from "./components/SpecialOffer";
import { SupportCenter } from "./components/Suppot";
import carImg from "@/public/Assets/hero-cars.png";

export default function Home() {
  return (
    <div>
      <InformBox />
      <ReservationForm />
      <Image
        src={carImg}
        alt="cars image"
        className="mx-auto -mt-32 hidden md:block"
      />
      <Exta />
      <SpecialOffers />
      <AboutAndCom />
      <SupportCenter />
      <BusinessOffer />
      <ContactUs />
    </div>
  );
}

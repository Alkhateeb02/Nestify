/* 
 * الصفحة الرئيسية للمنصة، تحتوي على أقسام تعريفية وترويجية.
 */
import { UserTypeSection } from "./sections/UserTypeSection";
import HowItWorks from "./sections/HowItWorks";
import { HeroSection } from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";

export default function Home() {
  return (
    <>
      <Navbar/>
      <HeroSection/>
      <FeaturesSection />
      <HowItWorks />
      <UserTypeSection />
      <Footer/>
    </>
  );
}



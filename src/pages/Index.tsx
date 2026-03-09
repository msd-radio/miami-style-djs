import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ShowsSection from "@/components/ShowsSection";
import Footer from "@/components/Footer";
import LivePlayer from "@/components/LivePlayer";
import FloatingMemberButton from "@/components/FloatingMemberButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ShowsSection />
      <Footer />
      <LivePlayer />
      <FloatingMemberButton />
    </div>
  );
};

export default Index;

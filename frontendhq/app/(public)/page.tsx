import { Footer } from "@/components/marketing/Footer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { LeaderboardSection } from "@/components/marketing/LeaderboardSection";
import { Navbar } from "@/components/marketing/Navbar";
import { NFTGallery } from "@/components/marketing/NFTGallery";
import { PlayerDashboard } from "@/components/marketing/PlayerDashboard";

export default function PublicHomePage() {
  return (
    <div
      style={{
        background: "#050A05",
        minHeight: "100vh",
        color: "#E8F5E8",
        fontFamily: "Outfit, sans-serif",
      }}
    >
      <Navbar />
      <main>
        <HeroSection />
        <PlayerDashboard />
        <LeaderboardSection />
        <NFTGallery />
      </main>
      <Footer />
    </div>
  );
}

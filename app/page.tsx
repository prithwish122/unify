import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import WhyChooseUs from "@/components/why-choose-us"

export default function Home() {
  return (
    <main className="min-h-screen">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />
      <Navbar />
      <HeroSection />
      <WhyChooseUs />
    </main>
  )
}

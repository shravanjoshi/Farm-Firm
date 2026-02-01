import { Link } from "react-router-dom";
//import heroImage from "@/assets/hero-farm.jpg";
import { AuthContext } from "./AuthContext";
import { useContext } from "react";
const HeroSection = () => {
  const { isLoggedIn, user } = useContext(AuthContext);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image + Overlay */}
      <div className="absolute inset-0">
        <img
          src={ "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFybSUyMGxhbmRzY2FwZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"}
          alt="Agricultural landscape"
          className="w-full h-full object-cover brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-emerald-800/60 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 mb-8 border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-white tracking-wide">
              Empowering Indian Agriculture
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6 drop-shadow-lg">
            Connect Directly with{" "}
            <span className="text-emerald-400">Farmers</span> &{" "}
            <span className="text-emerald-400">Firms</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
            Eliminate middlemen, secure fair prices, and build lasting partnerships.  
            India's modern platform for transparent agricultural trade.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
          {!isLoggedIn && 
              <Link
              to="/signup"
              className="group relative inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-emerald-950"
            >
              <span>Get Started</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
}

         
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 mt-16 pt-12 border-t border-white/20">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">5000+</p>
              <p className="mt-2 text-sm text-white/70">Registered Farmers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">500+</p>
              <p className="mt-2 text-sm text-white/70">Partner Firms</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">₹50Cr+</p>
              <p className="mt-2 text-sm text-white/70">Trade Value</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
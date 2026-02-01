import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import HowItWorksSection from './HowItWorksSection';
import CTASection from './CTASection';
import Footer from './Footer';
const Index = () => {
  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        <FeatureSection />
        <HowItWorksSection />
        <CTASection />
      </main>
    </div>
  );
};

export default Index;

import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 md:py-24 bg-gray-50">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Background Image + Overlay */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1500382054791-78f6d1a9e4c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Fresh agricultural produce"
              className="w-full h-full object-cover brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-emerald-800/65" />
          </div>

          {/* Main Content */}
          <div className="relative py-16 px-6 sm:py-20 sm:px-12 md:py-24 md:px-16 lg:py-28 lg:px-20 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-6 drop-shadow-lg">
              Ready to Transform Your{" "}
              <span className="text-emerald-300">Agricultural Trade?</span>
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
              Join thousands of farmers and firms already benefiting from direct
              trade, fair prices, and fully transparent transactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-600 px-8 py-4 text-base sm:text-lg font-semibold text-white shadow-lg shadow-emerald-950/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-950/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-emerald-950"
              >
                Get Started Free
                <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
              </Link>

              <Link
                to="/crops"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-8 py-4 text-base sm:text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-emerald-950"
              >
                Browse Crops
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
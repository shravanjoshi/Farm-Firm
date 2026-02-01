import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-emerald-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-100 text-2xl">🌾</span>
              </div>
              <span className="font-bold text-xl tracking-tight">
                KrishiConnect
              </span>
            </Link>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              Connecting farmers directly with firms for fair trade and transparent pricing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-5 text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-emerald-100/80 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/crops"
                  className="text-emerald-100/80 hover:text-white transition-colors duration-200"
                >
                  Browse Crops
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-emerald-100/80 hover:text-white transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="font-semibold text-lg mb-5 text-white">Get Started</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/signup?role=farmer"
                  className="text-emerald-100/80 hover:text-white transition-colors duration-200"
                >
                  Register as Farmer
                </Link>
              </li>
              <li>
                <Link
                  to="/signup?role=firm"
                  className="text-emerald-100/80 hover:text-white transition-colors duration-200"
                >
                  Register as Firm
                </Link>
              </li>
              <li>
                <Link
                  to="/login-page"
                  className="text-emerald-100/80 hover:text-white transition-colors duration-200"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-5 text-white">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <span className="text-lg">✉️</span>
                <span className="text-emerald-100/90">support@krishiconnect.com</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lg">📞</span>
                <span className="text-emerald-100/90">+91 1800-123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lg">📍</span>
                <span className="text-emerald-100/90">Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-emerald-700 mt-10 pt-8 text-center text-sm text-emerald-100/60">
          <p>© {new Date().getFullYear()} KrishiConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
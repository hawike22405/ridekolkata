import { Bike, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-kolkata-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-kolkata-yellow p-2 rounded-lg">
                <Bike className="w-6 h-6 text-kolkata-black" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tighter">
                RIDE<span className="text-kolkata-yellow">KOLKATA</span>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Explore the City of Joy on two wheels. Eco-friendly, affordable, and fun cycle rentals for everyone.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-6 text-kolkata-yellow">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/rent" className="text-gray-400 hover:text-white transition-colors">Rent a Cycle</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing Plans</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-6 text-kolkata-yellow">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-kolkata-yellow" />
                <span>Park Street, Kolkata, WB 700016</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-kolkata-yellow" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-kolkata-yellow" />
                <span>hello@ridekolkata.in</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-6 text-kolkata-yellow">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-kolkata-yellow hover:text-kolkata-black transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-kolkata-yellow hover:text-kolkata-black transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-kolkata-yellow hover:text-kolkata-black transition-all">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-8">
              <h5 className="font-display text-sm font-bold mb-4 uppercase tracking-widest text-gray-500">Subscribe</h5>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-white/5 border border-white/10 px-4 py-2 rounded-l-lg focus:outline-none focus:border-kolkata-yellow w-full"
                />
                <button className="bg-kolkata-yellow text-kolkata-black px-4 py-2 rounded-r-lg font-bold">Go</button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>© 2026 RideKolkata. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

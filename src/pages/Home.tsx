import { motion } from "motion/react";
import { ArrowRight, Bike, MapPin, Shield, Zap, Star, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function Home() {
  const features = [
    { icon: <Zap className="w-6 h-6" />, title: "Instant Unlock", desc: "Scan QR and start riding in seconds." },
    { icon: <Shield className="w-6 h-6" />, title: "Safe & Secure", desc: "Fully insured rides with 24/7 support." },
    { icon: <TrendingUp className="w-6 h-6" />, title: "Affordable", desc: "Plans starting from just ₹15/hour." },
    { icon: <MapPin className="w-6 h-6" />, title: "Wide Network", desc: "50+ pickup points across Kolkata." },
  ];

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <div className="inline-flex items-center gap-2 bg-kolkata-yellow/10 text-kolkata-accent px-4 py-2 rounded-full font-bold text-sm mb-6 border border-kolkata-yellow/20">
              <Star className="w-4 h-4 fill-current" />
              <span>FLAT 30% OFF YOUR FIRST RIDE</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] mb-8 tracking-tighter">
              RIDE <span className="text-kolkata-yellow">KOLKATA</span> <br />
              LIKE NEVER <br />
              BEFORE.
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              Explore the City of Joy on two wheels. Eco-friendly, affordable, and traffic-free cycle rentals for everyone.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/rent" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                Ride Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/about" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4">
                Explore Kolkata
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-kolkata-yellow/20 rounded-full blur-3xl animate-pulse" />
            <img
              src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop"
              alt="Cycle in Kolkata"
              className="relative rounded-3xl shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-8 -left-8 glass-card p-6 rounded-2xl flex items-center gap-4 animate-bounce">
              <div className="bg-kolkata-yellow p-3 rounded-xl">
                <Users className="w-6 h-6 text-kolkata-black" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Active Riders</p>
                <p className="text-2xl font-black">12,450+</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl hover:bg-kolkata-yellow transition-colors group"
            >
              <div className="bg-kolkata-yellow p-4 rounded-2xl w-fit mb-6 group-hover:bg-kolkata-black group-hover:text-kolkata-yellow transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-gray-500 group-hover:text-kolkata-black/70 transition-colors">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Kolkata Vibe Section */}
      <section className="bg-kolkata-black py-24 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-9xl font-black opacity-20 rotate-12">TRAMS</div>
          <div className="absolute bottom-10 right-10 text-9xl font-black opacity-20 -rotate-12">TAXIS</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black opacity-5">KOLKATA</div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6">EXPLORE THE <span className="text-kolkata-yellow">CITY OF JOY</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">From the historic Howrah Bridge to the bustling Park Street, see Kolkata from a new perspective.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Victoria Memorial", img: "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=1974&auto=format&fit=crop" },
              { title: "Howrah Bridge", img: "https://images.unsplash.com/photo-1590050752117-23a9d7fc2440?q=80&w=2070&auto=format&fit=crop" },
              { title: "Princep Ghat", img: "https://images.unsplash.com/photo-1623150502742-6a849aa94be4?q=80&w=2070&auto=format&fit=crop" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="relative group rounded-3xl overflow-hidden h-96"
              >
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-kolkata-yellow rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-display font-black mb-8 leading-none">READY TO START <br /> YOUR JOURNEY?</h2>
            <p className="text-xl mb-12 max-w-xl mx-auto font-medium">Join thousands of riders exploring Kolkata every day. Download the app or book online now.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/rent" className="bg-kolkata-black text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl">
                Unlock Your Cycle
              </Link>
              <Link to="/pricing" className="bg-white text-kolkata-black px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl border border-kolkata-black/10">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, MapPin, Shield, Zap, Star, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Hero3D } from "../components/3d/Hero3D";
import { InteractiveBackground } from "../components/3d/InteractiveBackground";
import { useRef } from "react";

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: "Instant Unlock", desc: "Scan QR and start riding in seconds." },
    { icon: <Shield className="w-6 h-6" />, title: "Safe & Secure", desc: "Fully insured rides with 24/7 support." },
    { icon: <TrendingUp className="w-6 h-6" />, title: "Affordable", desc: "Plans starting from just ₹15/hour." },
    { icon: <MapPin className="w-6 h-6" />, title: "Wide Network", desc: "50+ pickup points across Kolkata." },
  ];

  return (
    <div ref={containerRef} className="flex flex-col gap-24 pb-24 relative overflow-hidden bg-transparent">
      <InteractiveBackground />
      
      {/* Hero Section */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-[90vh] flex items-center pt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="z-10"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-xl text-kolkata-black px-5 py-2.5 rounded-full font-bold text-sm mb-6 border border-white/50 shadow-xl cursor-pointer"
            >
              <Star className="w-4 h-4 text-kolkata-accent" fill="currentColor" />
              <span>FLAT 30% OFF YOUR FIRST RIDE</span>
            </motion.div>
            
            <h1 className="text-7xl md:text-[7rem] font-display font-black leading-[0.85] mb-8 tracking-tighter uppercase drop-shadow-lg">
              RIDE <span className="text-transparent bg-clip-text bg-gradient-to-r from-kolkata-yellow to-orange-400">KOLKATA</span> <br />
              <span className="stroke-text">LIKE NEVER</span> <br />
              BEFORE.
            </h1>
            
            <p className="text-xl text-kolkata-black/80 font-medium mb-10 max-w-lg leading-relaxed backdrop-blur-sm bg-white/20 p-4 rounded-2xl border border-white/30">
              Explore the City of Joy on two wheels. Eco-friendly, affordable, and traffic-free cycle rentals for everyone.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/rent" className="btn-primary group flex items-center gap-2 text-lg px-8 py-4 relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Ride Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
              <Link to="/about" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4 glass-card hover:bg-white transition-colors">
                Explore Kolkata
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[600px] w-full"
          >
            <div className="absolute inset-0 z-0">
              <Hero3D />
            </div>
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute bottom-10 -left-8 glass-card p-6 rounded-3xl flex items-center gap-5 z-10 border-2 border-white/40"
            >
              <div className="bg-kolkata-yellow p-4 rounded-2xl shadow-inner">
                <Users className="w-7 h-7 text-kolkata-black" />
              </div>
              <div>
                <p className="text-sm text-kolkata-black/60 font-bold uppercase tracking-widest">Active Riders</p>
                <p className="text-3xl font-black">12,450+</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="liquid-glass p-8 rounded-[2rem] hover:border-kolkata-yellow/50 transition-all group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-kolkata-yellow to-orange-400 p-4 rounded-2xl w-fit mb-6 shadow-lg group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
              <p className="text-kolkata-black/70 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Kolkata Vibe Section */}
      <section className="py-32 overflow-hidden relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-kolkata-black/95 backdrop-blur-xl rounded-[4rem] mx-4 sm:mx-8 -z-10" 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-display font-black mb-6 text-white uppercase tracking-tight">
              Explore the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-kolkata-yellow to-orange-500">City of Joy</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">From the historic Howrah Bridge to the bustling Park Street, see Kolkata from a new perspective.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Victoria Memorial", img: "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=1974&auto=format&fit=crop" },
              { title: "Howrah Bridge", img: "Howarah bridge.jpg" },
              { title: "Princep Ghat", img: "princep ghat.jpg" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -15, rotateZ: i % 2 === 0 ? 2 : -2 }}
                className="relative group rounded-[2.5rem] overflow-hidden h-[400px] shadow-2xl border-4 border-white/10"
              >
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-8">
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 + 0.3 }}
                    className="text-3xl font-bold text-white tracking-wide"
                  >
                    {item.title}
                  </motion.h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-kolkata-yellow to-orange-400 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl mix-blend-overlay" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-black/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl mix-blend-overlay" />
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-[5rem] font-display font-black mb-8 leading-none tracking-tighter text-kolkata-black">
              READY TO START <br /> YOUR JOURNEY?
            </h2>
            <p className="text-2xl mb-12 max-w-2xl mx-auto font-medium text-kolkata-black/80">
              Join thousands of riders exploring Kolkata every day. Download the app or book online now.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/rent" className="bg-kolkata-black text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl flex items-center gap-3">
                  Unlock Your Cycle <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/pricing" className="bg-white/90 backdrop-blur-md text-kolkata-black px-10 py-5 rounded-full font-bold text-xl shadow-2xl border-2 border-white flex items-center gap-3">
                  View Pricing
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

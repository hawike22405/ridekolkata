import { motion } from "motion/react";
import { Bike, Users, MapPin, Star, TrendingUp, Zap, Shield, Heart } from "lucide-react";

export function About() {
  const stats = [
    { icon: <Users className="w-6 h-6" />, label: "Happy Riders", value: "50,000+" },
    { icon: <Bike className="w-6 h-6" />, label: "Cycles", value: "2,500+" },
    { icon: <MapPin className="w-6 h-6" />, label: "Stations", value: "100+" },
    { icon: <Star className="w-6 h-6" />, label: "Rating", value: "4.9/5" },
  ];

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-kolkata-yellow/10 text-kolkata-accent px-4 py-2 rounded-full font-bold text-sm mb-8 border border-kolkata-yellow/20"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>MADE WITH LOVE IN KOLKATA</span>
          </motion.div>
          <h1 className="text-6xl md:text-9xl font-display font-black mb-8 tracking-tighter leading-none">
            OUR <span className="text-kolkata-yellow">STORY</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            RideKolkata was born out of a simple idea: to make the City of Joy more accessible, sustainable, and fun. We believe that the best way to see Kolkata is on two wheels.
          </p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black opacity-[0.02] pointer-events-none select-none">STORY</div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-10 rounded-[2.5rem] text-center hover:bg-kolkata-yellow transition-colors group"
            >
              <div className="bg-kolkata-yellow p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:bg-kolkata-black group-hover:text-kolkata-yellow transition-colors">
                {stat.icon}
              </div>
              <p className="text-4xl font-black mb-2">{stat.value}</p>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs group-hover:text-kolkata-black/70">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-black mb-8 leading-tight">OUR MISSION: <br /> <span className="text-kolkata-yellow">GREENER KOLKATA</span></h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="bg-kolkata-yellow p-4 rounded-2xl h-fit">
                <TrendingUp className="w-6 h-6 text-kolkata-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Sustainable Transport</h3>
                <p className="text-gray-500 leading-relaxed">Reducing carbon footprint by providing an eco-friendly alternative to motor vehicles in the city.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="bg-kolkata-yellow p-4 rounded-2xl h-fit">
                <Zap className="w-6 h-6 text-kolkata-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Health & Fitness</h3>
                <p className="text-gray-500 leading-relaxed">Promoting an active lifestyle by making cycling a daily habit for Kolkatans.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="bg-kolkata-yellow p-4 rounded-2xl h-fit">
                <Shield className="w-6 h-6 text-kolkata-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Community First</h3>
                <p className="text-gray-500 leading-relaxed">Building a community of riders who care about the city and its heritage.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-kolkata-yellow/20 rounded-full blur-3xl animate-pulse" />
          <img
            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop"
            alt="Cycling Community"
            className="relative rounded-[3rem] shadow-2xl border-4 border-white transform -rotate-2 hover:rotate-0 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </section>

      {/* Team */}
      <section className="bg-kolkata-black py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6">THE <span className="text-kolkata-yellow">TEAM</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Meet the passionate individuals behind RideKolkata.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: "Arjun Das", role: "Founder & CEO", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" },
              { name: "Priya Sen", role: "Head of Operations", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop" },
              { name: "Rahul Bose", role: "Tech Lead", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" },
            ].map((member, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="text-center"
              >
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-kolkata-yellow rounded-[2.5rem] rotate-6 group-hover:rotate-0 transition-transform" />
                  <img src={member.img} alt={member.name} className="relative w-full h-80 object-cover rounded-[2.5rem] border-4 border-kolkata-black shadow-2xl" referrerPolicy="no-referrer" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                <p className="text-kolkata-yellow font-bold uppercase tracking-widest text-xs">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

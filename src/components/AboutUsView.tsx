import { motion } from 'motion/react';
import { Bike, Users, MapPin, Star, TrendingUp, Zap, Shield, Heart, ArrowRight } from 'lucide-react';
import { TEAM_MEMBERS, ABOUT_STATS, ABOUT_MISSION_PILLARS } from '../data/mockData';
import ThreeCanvas from './ThreeCanvas';
import { useState } from 'react';

interface AboutUsViewProps {
  onStartRiding?: () => void;
  onExploreRoutes?: () => void;
}

export default function AboutUsView({ onStartRiding, onExploreRoutes }: AboutUsViewProps) {
  const [show3dModal, setShow3dModal] = useState(false);

  return (
    <div className="w-full flex flex-col gap-16 md:gap-24 pb-24 pt-6" id="about-us-view">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden">
        {/* Subtle Cyber Grid Accent (zero text collision) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none opacity-40"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-10 bg-[linear-gradient(to_right,#00ff66_1px,transparent_1px),linear-gradient(to_bottom,#00ff66_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary-container/20 text-on-surface px-4 py-2 rounded-full font-bold text-xs sm:text-sm mb-6 border border-primary/30 shadow-xs"
          >
            <Heart className="w-4 h-4 fill-primary text-primary" />
            <span className="font-label-caps uppercase tracking-wider font-extrabold">
              MADE WITH LOVE IN KOLKATA
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-9xl font-display font-black mb-6 tracking-tighter leading-none text-on-surface uppercase"
          >
            OUR <span className="text-primary underline decoration-primary/40 decoration-wavy">STORY</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-secondary max-w-3xl mx-auto leading-relaxed font-medium"
          >
            RideKolkata was born out of a simple idea: to make the City of Joy more accessible,
            sustainable, and fun. We believe that the best way to see Kolkata is on two wheels —
            from morning chai at College Street to moonlit sprints across the Hooghly riverfront.
          </motion.p>

          {/* Dual Heritage Panoramic Hero Strip with Actual GitHub Images */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto text-left"
          >
            <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border-2 border-surface-container-high shadow-lg group">
              <img
                src="/howrah-bridge.jpg"
                alt="Howrah Bridge Kolkata"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute top-2.5 left-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#ffcc00] font-bold border border-white/10">
                ACTUAL REPO ASSET
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="text-[10px] font-mono font-bold uppercase text-[#ffcc00] tracking-wider block">
                  HERITAGE CIRCUIT 01
                </span>
                <span className="text-sm font-black text-white">Howrah Cantilever Span</span>
              </div>
            </div>

            <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border-2 border-surface-container-high shadow-lg group">
              <img
                src="/prinsep-ghat.jpg"
                alt="Prinsep Ghat Kolkata"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute top-2.5 left-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#00ff66] font-bold border border-white/10">
                ACTUAL REPO ASSET
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="text-[10px] font-mono font-bold uppercase text-[#00ff66] tracking-wider block">
                  HERITAGE CIRCUIT 02
                </span>
                <span className="text-sm font-black text-white">Prinsep Ghat Riverfront Promontory</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Stats Bar */}
      <section className="max-w-7xl mx-auto px-margin-sm lg:px-margin w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {ABOUT_STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] text-center bg-surface-container-lowest/90 backdrop-blur-xl border border-surface-container-high hover:border-primary-container shadow-md hover:shadow-xl transition-all group"
            >
              <div className="bg-primary-container/20 group-hover:bg-primary text-on-surface p-3.5 rounded-2xl w-fit mx-auto mb-4 transition-colors">
                {stat.icon === 'group' && <Users className="w-6 h-6 text-primary group-hover:text-black" />}
                {stat.icon === 'pedal_bike' && <Bike className="w-6 h-6 text-primary group-hover:text-black" />}
                {stat.icon === 'location_on' && <MapPin className="w-6 h-6 text-primary group-hover:text-black" />}
                {stat.icon === 'star' && <Star className="w-6 h-6 text-primary group-hover:text-black fill-primary" />}
              </div>
              <p className="text-3xl sm:text-4xl font-black text-on-surface mb-1 font-display">
                {stat.value}
              </p>
              <p className="text-secondary font-bold uppercase tracking-widest text-xs">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission Section with Interactive Steed Preview */}
      <section className="max-w-7xl mx-auto px-margin-sm lg:px-margin grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-7 space-y-8"
        >
          <div>
            <span className="px-space-md py-1 rounded-full bg-primary-container/20 text-primary font-label-caps text-label-caps uppercase font-bold tracking-widest inline-block mb-3">
              ECO-CONSCIOUS REVOLUTION
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black leading-tight text-on-surface uppercase">
              OUR MISSION: <br />
              <span className="text-primary">GREENER KOLKATA</span>
            </h2>
            <p className="text-secondary mt-3 text-base sm:text-lg leading-relaxed">
              We empower millions of urban commuters, students, and night owls to bypass congestion,
              breathe cleaner air, and rediscover Kolkata's architectural splendor through emission-free cycling.
            </p>
          </div>

          <div className="space-y-6">
            {ABOUT_MISSION_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low/70 border border-surface-container-high/60 hover:bg-surface-container-low transition-colors"
              >
                <div className="bg-primary text-black p-3 rounded-2xl h-fit shrink-0 shadow-sm">
                  {pillar.icon === 'trending_up' && <TrendingUp className="w-5 h-5 text-black" />}
                  {pillar.icon === 'bolt' && <Zap className="w-5 h-5 text-black" />}
                  {pillar.icon === 'shield' && <Shield className="w-5 h-5 text-black" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-on-surface mb-1">{pillar.title}</h3>
                  <p className="text-secondary text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side: Heritage & Smart Steed Showcase with Actual GitHub Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-5 relative"
        >
          <div className="rounded-[2.5rem] overflow-hidden border-2 border-surface-container-high shadow-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-6 relative group">
            <div className="relative h-80 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src="/howrah-bridge.jpg"
                alt="Howrah Bridge - Kolkata Heritage Route"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[11px] text-white font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
                <span>HOWRAH BRIDGE • REPO ASSET</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Kolkata Heritage Fleet Hub
                </span>
                <button
                  onClick={() => setShow3dModal(true)}
                  className="px-3 py-1.5 rounded-full bg-primary text-black font-black hover:scale-105 transition-transform cursor-pointer flex items-center gap-1"
                >
                  <span>3D Steed View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-headline-sm text-headline-sm font-black text-on-surface">
                  HOWRAH TO VICTORIA HERITAGE CORRIDOR
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[11px] font-bold">
                  Active Circuit
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Ridden across Kolkata's iconic cantilever bridge and along the Hooghly riverfront, powered by RideKolkata steeds and tracked via local GPS telemetry.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* The Team Section (With images from GitHub repo) */}
      <section className="py-16 md:py-24 bg-surface-container-low/80 border-y border-surface-container-high/60 relative">
        <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin">
          <div className="text-center mb-16 space-y-3">
            <span className="px-space-md py-1 rounded-full bg-primary-container/20 text-primary font-label-caps text-label-caps uppercase font-bold tracking-widest inline-block">
              FOUNDING COLLECTIVE
            </span>
            <h2 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-on-surface uppercase">
              THE <span className="text-primary">TEAM</span>
            </h2>
            <p className="text-base sm:text-xl text-secondary max-w-2xl mx-auto font-medium">
              Meet the passionate engineers, operators, and dreamers building the future of micro-mobility for Kolkata.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {TEAM_MEMBERS.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="rounded-3xl bg-surface-container-lowest/90 backdrop-blur-xl border border-surface-container-high/70 p-6 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container with Stylized Yellow Accent Framing */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300"></div>
                    <div className="relative w-full h-72 rounded-2xl overflow-hidden border-2 border-surface-container-high bg-slate-900 shadow-md">
                      <img
                        src={member.img}
                        alt={member.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to stylized avatar seed if image fails
                          const target = e.currentTarget;
                          target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            member.name
                          )}`;
                        }}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-on-surface mb-1">{member.name}</h3>
                  <p className="text-primary font-black uppercase tracking-widest text-xs mb-3">
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="text-xs text-secondary leading-relaxed">{member.bio}</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-surface-container-high/60 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Kolkata HQ
                  </span>
                  <span className="text-[11px] font-bold text-primary group-hover:underline flex items-center gap-1">
                    RideKolkata Team
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Kolkata Heritage Story Showcase Section */}
      <section className="max-w-7xl mx-auto px-margin-sm lg:px-margin w-full">
        <div className="rounded-3xl bg-gradient-to-r from-surface-container-high via-surface-container-low to-surface-container-high p-8 sm:p-12 border border-surface-container-high/80 relative overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider block mb-2">
                HERITAGE MEETS MODERN ENGINEERING
              </span>
              <h3 className="text-3xl sm:text-4xl font-display font-black text-on-surface uppercase mb-4 leading-tight">
                Redefining the Soul of Kolkata Cycling
              </h3>
              <p className="text-secondary text-sm sm:text-base leading-relaxed mb-6 font-medium">
                From Victoria Memorial's marble grandeur to the ancient terracotta streets of North Kolkata,
                our steeds are tailored specifically to Kolkata’s unique topography and vibrant street culture.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {onStartRiding && (
                  <button
                    onClick={onStartRiding}
                    className="px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Reserve a Steed Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {onExploreRoutes && (
                  <button
                    onClick={onExploreRoutes}
                    className="px-6 py-3 rounded-full bg-surface-container-lowest border border-surface-container-high text-on-surface font-headline-sm text-headline-sm font-bold hover:bg-surface-container transition-all cursor-pointer"
                  >
                    Explore Heritage Routes
                  </button>
                )}
              </div>
            </div>

            {/* Heritage Photos Gallery */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-surface-container-high shadow-md h-44 sm:h-52 relative group">
                <img
                  src="/howrah-bridge.jpg"
                  alt="Howrah Bridge Kolkata"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-3 text-white text-xs font-bold">
                  Howrah Bridge Span
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-surface-container-high shadow-md h-44 sm:h-52 relative group">
                <img
                  src="/prinsep-ghat.jpg"
                  alt="Prinsep Ghat Riverfront"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-3 text-white text-xs font-bold">
                  Prinsep Ghat Promontory
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Steed modal if clicked */}
      {show3dModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl h-[75vh] rounded-3xl bg-surface-container-lowest border border-surface-container-high relative overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low">
              <div>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                  3D KINETIC DIGITAL TWIN
                </span>
                <h3 className="text-base font-black text-on-surface">Series-01 Steed Interactive View</h3>
              </div>
              <button
                onClick={() => setShow3dModal(false)}
                className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container-highest cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex-1 relative bg-gradient-to-b from-[#0a0b0e] to-[#121316]">
              <ThreeCanvas interactiveMode={true} accentColor="#ffcc00" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

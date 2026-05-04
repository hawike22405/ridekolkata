import { motion } from "motion/react";
import { Check, Star, TrendingUp, Zap, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export function Pricing() {
  const plans = [
    {
      name: "Daily Explorer",
      price: "15",
      unit: "/hr",
      desc: "Perfect for quick trips and sightseeing.",
      features: ["Standard Cycles", "Basic Insurance", "24/7 Support", "No Deposit"],
      color: "bg-white",
      btn: "btn-secondary",
    },
    {
      name: "Weekly Commuter",
      price: "499",
      unit: "/week",
      desc: "Ideal for daily commuters and office goers.",
      features: ["All Cycle Types", "Premium Insurance", "Priority Support", "Unlimited Rides", "Free Maintenance"],
      color: "bg-kolkata-yellow",
      btn: "btn-secondary",
      popular: true,
    },
    {
      name: "Monthly Pro",
      price: "1499",
      unit: "/month",
      desc: "Best value for long-term riders and fitness enthusiasts.",
      features: ["All Cycle Types", "Full Insurance", "Dedicated Support", "Unlimited Rides", "Free Home Delivery", "Exclusive Events"],
      color: "bg-kolkata-black",
      btn: "btn-primary",
      text: "text-white",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-7xl font-display font-black mb-6 tracking-tighter">
          CHOOSE YOUR <span className="text-kolkata-yellow">PLAN</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Flexible pricing for every need. No hidden charges, no surprises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className={cn(
              "relative p-10 rounded-[3rem] shadow-2xl flex flex-col h-full overflow-hidden",
              plan.color,
              plan.text || "text-kolkata-black"
            )}
          >
            {plan.popular && (
              <div className="absolute top-6 right-6 bg-kolkata-black text-kolkata-yellow px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Most Popular
              </div>
            )}
            
            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={cn("text-sm", plan.text ? "text-gray-400" : "text-gray-500")}>{plan.desc}</p>
            </div>

            <div className="mb-10">
              <p className="text-6xl font-black">₹{plan.price}<span className="text-xl font-normal opacity-50">{plan.unit}</span></p>
            </div>

            <ul className="space-y-4 mb-12 flex-grow">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-3">
                  <div className={cn("p-1 rounded-full", plan.text ? "bg-kolkata-yellow text-kolkata-black" : "bg-kolkata-black text-kolkata-yellow")}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-medium">{f}</span>
                </li>
              ))}
            </ul>

            <Link to="/rent" className={cn("w-full py-5 text-center rounded-full font-bold text-lg transition-transform hover:scale-105", plan.btn)}>
              Get Started
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-kolkata-black rounded-[3rem] p-12 md:p-24 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-kolkata-yellow/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div>
          <h2 className="text-4xl md:text-6xl font-display font-black mb-8 leading-tight">SPECIAL OFFERS <br /> FOR <span className="text-kolkata-yellow">STUDENTS</span></h2>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">Are you a student in Kolkata? Get an additional 20% discount on all monthly plans. Just upload your ID card during signup.</p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
              <Users className="w-6 h-6 text-kolkata-yellow" />
              <span className="font-bold">10,000+ Students</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
              <Star className="w-6 h-6 text-kolkata-yellow" />
              <span className="font-bold">Top Rated</span>
            </div>
          </div>
        </div>

        <div className="glass-card bg-white/5 p-10 rounded-[2.5rem] border-white/10">
          <h3 className="text-2xl font-bold mb-6 text-kolkata-yellow">Refer & Earn</h3>
          <p className="text-gray-400 mb-8">Invite your friends to RideKolkata and get ₹100 in your wallet for every successful referral. Your friend gets ₹50 off too!</p>
          <div className="bg-white/10 p-4 rounded-2xl flex justify-between items-center border border-white/10 mb-8">
            <span className="font-mono text-kolkata-yellow font-bold">RIDEKOLKATA100</span>
            <button className="text-sm font-bold uppercase tracking-widest hover:text-kolkata-yellow transition-colors">Copy Code</button>
          </div>
          <button className="btn-primary w-full py-4">Share Now</button>
        </div>
      </div>
    </div>
  );
}

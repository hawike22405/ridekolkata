import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Wallet, History, Map, Zap, Star, TrendingUp, Shield, ArrowRight, Settings, LogOut, Plus, Navigation, CloudRain, Sun, Wind, Bike } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [weather, setWeather] = useState({ temp: 32, condition: "Sunny", icon: <Sun className="w-6 h-6 text-kolkata-yellow" /> });

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully. See you on the road!");
    navigate("/");
  };

  // Derive initials from real user name
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const rideHistory = [
    { id: 1, date: "2026-03-20", from: "Park Street", to: "Victoria Memorial", cost: 45, duration: "45 mins", type: "Standard" },
    { id: 2, date: "2026-03-18", from: "Howrah Bridge", to: "Princep Ghat", cost: 60, duration: "1.2 hrs", type: "MTB" },
    { id: 3, date: "2026-03-15", from: "Salt Lake", to: "Eco Park", cost: 120, duration: "2.5 hrs", type: "Electric" },
  ];

  const chartData = [
    { name: "Mon", rides: 2 },
    { name: "Tue", rides: 5 },
    { name: "Wed", rides: 3 },
    { name: "Thu", rides: 8 },
    { name: "Fri", rides: 6 },
    { name: "Sat", rides: 12 },
    { name: "Sun", rides: 10 },
  ];

  const getAiRecommendation = async () => {
    setLoadingAi(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Suggest a 30-minute cycling route in Kolkata starting from Park Street. Include 3 interesting landmarks and why they are worth visiting. Keep it concise and energetic.",
      });
      setAiRecommendation(response.text || "No recommendation available.");
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to get AI recommendation.");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    getAiRecommendation();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-8">
          <div className="glass-card p-8 rounded-[2.5rem] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-kolkata-yellow" />
            <div className="relative z-10">
              <div className="w-24 h-24 bg-kolkata-yellow rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-xl">
                <span className="text-3xl font-black text-kolkata-black">{initials}</span>
              </div>
              <h2 className="text-2xl font-display font-black mb-2">{user?.name || "Rider"}</h2>
              <p className="text-gray-500 mb-6 font-medium">Pro Rider Since 2024</p>
              <div className="flex justify-center gap-4">
                <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">Level</p>
                  <p className="font-black text-kolkata-accent">12</p>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">Points</p>
                  <p className="font-black text-kolkata-accent">2,450</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="glass-card p-4 rounded-[2.5rem] flex flex-col gap-2">
            {[
              { id: "overview", name: "Overview", icon: <TrendingUp className="w-5 h-5" /> },
              { id: "wallet", name: "My Wallet", icon: <Wallet className="w-5 h-5" /> },
              { id: "history", name: "Ride History", icon: <History className="w-5 h-5" /> },
              { id: "routes", name: "AI Routes", icon: <Navigation className="w-5 h-5" /> },
              { id: "settings", name: "Settings", icon: <Settings className="w-5 h-5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all",
                  activeTab === tab.id ? "bg-kolkata-yellow text-kolkata-black shadow-lg" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
            <button className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-4" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="w-full lg:w-3/4 flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-8 rounded-[2rem] bg-kolkata-yellow">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-kolkata-black p-3 rounded-xl text-kolkata-yellow">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <button className="bg-kolkata-black/10 p-2 rounded-lg hover:bg-kolkata-black/20 transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-kolkata-black/60 font-bold uppercase tracking-widest text-xs mb-1">Wallet Balance</p>
                    <p className="text-4xl font-black text-kolkata-black">₹1,245.50</p>
                  </div>

                  <div className="glass-card p-8 rounded-[2rem]">
                    <div className="bg-gray-100 p-3 rounded-xl w-fit mb-6">
                      <Bike className="w-6 h-6 text-kolkata-black" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Total Rides</p>
                    <p className="text-4xl font-black">42</p>
                  </div>

                  <div className="glass-card p-8 rounded-[2rem]">
                    <div className="bg-gray-100 p-3 rounded-xl w-fit mb-6">
                      <Star className="w-6 h-6 text-kolkata-black" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Ride Rating</p>
                    <p className="text-4xl font-black">4.9</p>
                  </div>
                </div>

                {/* Chart and AI Recommendation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-card p-8 rounded-[2.5rem]">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-kolkata-yellow" />
                      Weekly Activity
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: "bold" }} />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                            itemStyle={{ fontWeight: "bold", color: "#1A1A1A" }}
                          />
                          <Area type="monotone" dataKey="rides" stroke="#FFD700" strokeWidth={4} fillOpacity={1} fill="url(#colorRides)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-card p-8 rounded-[2.5rem] bg-kolkata-black text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-kolkata-yellow/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-kolkata-yellow">
                        <Zap className="w-5 h-5" />
                        AI Recommendation
                      </h3>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
                        {weather.icon}
                        <span>{weather.temp}°C {weather.condition}</span>
                      </div>
                    </div>

                    {loadingAi ? (
                      <div className="flex flex-col items-center justify-center h-48 gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kolkata-yellow"></div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Generating Route...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-between">
                        <div className="text-gray-400 leading-relaxed mb-8 italic">
                          "{aiRecommendation}"
                        </div>
                        <button 
                          onClick={getAiRecommendation}
                          className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
                        >
                          Refresh Route <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Rides */}
                <div className="glass-card p-8 rounded-[2.5rem]">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold">Recent Rides</h3>
                    <button onClick={() => setActiveTab("history")} className="text-kolkata-yellow font-bold text-sm hover:underline">View All</button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {rideHistory.map((ride) => (
                      <div key={ride.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="bg-kolkata-yellow p-3 rounded-xl group-hover:bg-kolkata-black group-hover:text-kolkata-yellow transition-colors">
                            <Bike className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold">{ride.from} → {ride.to}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{ride.date} • {ride.duration}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-lg">₹{ride.cost}</p>
                          <p className="text-xs text-kolkata-accent font-bold uppercase tracking-widest">{ride.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "wallet" && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-12 rounded-[3rem] text-center"
              >
                <div className="bg-kolkata-yellow/10 p-8 rounded-full w-fit mx-auto mb-8">
                  <Wallet className="w-16 h-16 text-kolkata-yellow" />
                </div>
                <h2 className="text-4xl font-display font-black mb-4">MY <span className="text-kolkata-yellow">WALLET</span></h2>
                <p className="text-gray-500 mb-12 max-w-md mx-auto">Manage your balance, add funds, and view transaction history.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                  <div className="bg-kolkata-black text-white p-10 rounded-[2.5rem] text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-kolkata-yellow/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Current Balance</p>
                    <p className="text-5xl font-black mb-8 text-kolkata-yellow">₹1,245.50</p>
                    <button className="btn-primary w-full py-4">Add Funds</button>
                  </div>
                  
                  <div className="bg-gray-50 p-10 rounded-[2.5rem] text-left border border-gray-100">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Saved Methods</p>
                    <div className="flex flex-col gap-4 mb-8">
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600 font-bold text-xs">UPI</div>
                        <span className="font-bold text-sm">sanju@okaxis</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600 font-bold text-xs">VISA</div>
                        <span className="font-bold text-sm">**** 4582</span>
                      </div>
                    </div>
                    <button className="text-kolkata-yellow font-bold text-sm hover:underline">+ Add New Method</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Other tabs can be implemented similarly */}
            {["history", "routes", "settings"].includes(activeTab) && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-24 rounded-[3rem] text-center border-dashed border-2 border-gray-200 bg-transparent"
              >
                <div className="bg-gray-100 p-8 rounded-full w-fit mx-auto mb-8">
                  <Settings className="w-16 h-16 text-gray-300" />
                </div>
                <h2 className="text-3xl font-display font-black mb-4 uppercase tracking-tighter">{activeTab}</h2>
                <p className="text-gray-500">This section is coming soon in the next update!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, MapPin, Bike, Zap, Star, Shield, ArrowRight, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

// Fix for default marker icon in Leaflet
const DefaultIcon = L.divIcon({
  html: `<div class="bg-kolkata-yellow p-2 rounded-full border-2 border-kolkata-black shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg></div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Cycle {
  id: number;
  name: string;
  type: string;
  price: number;
  available: boolean;
  location: [number, number];
  description: string;
  rating: number;
}

export function Rent() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/cycles")
      .then((res) => res.json())
      .then((data) => {
        // Add some mock ratings
        const enrichedData = data.map((c: any) => ({ ...c, rating: 4.5 + Math.random() * 0.5 }));
        setCycles(enrichedData);
        setLoading(false);
      });
  }, []);

  const filteredCycles = cycles.filter((c) => {
    const matchesFilter = filter === "All" || c.type === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const { user } = useAuth();

  const handleBook = async (cycle: Cycle) => {
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cycleId: cycle.id, userId: user?.id || "guest" }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Booking confirmed! ID: ${data.bookingId}`);
      setSelectedCycle(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Filters and List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-display font-black mb-4">RENT A <span className="text-kolkata-yellow">CYCLE</span></h1>
            <p className="text-gray-500">Find the perfect ride for your Kolkata adventure.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cycles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-kolkata-yellow transition-colors"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {["All", "Standard", "MTB", "Electric", "Classic"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all",
                    filter === f ? "bg-kolkata-yellow text-kolkata-black" : "bg-white text-gray-500 border border-gray-200 hover:border-kolkata-yellow"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-kolkata-yellow scrollbar-track-transparent">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kolkata-yellow"></div>
              </div>
            ) : filteredCycles.length > 0 ? (
              filteredCycles.map((cycle) => (
                <motion.div
                  key={cycle.id}
                  layoutId={`cycle-${cycle.id}`}
                  onClick={() => setSelectedCycle(cycle)}
                  className={cn(
                    "glass-card p-6 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] border-2",
                    selectedCycle?.id === cycle.id ? "border-kolkata-yellow" : "border-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-kolkata-accent mb-1 block">{cycle.type}</span>
                      <h3 className="text-xl font-bold">{cycle.name}</h3>
                    </div>
                    <div className="bg-kolkata-yellow/10 text-kolkata-black px-3 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-sm font-bold">{cycle.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                    <MapPin className="w-4 h-4" />
                    <span>Park Street Station</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-black">₹{cycle.price}<span className="text-sm text-gray-400 font-normal">/hr</span></p>
                    <button className="btn-primary py-2 px-6 text-sm">Select</button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">No cycles found matching your criteria.</div>
            )}
          </div>
        </div>

        {/* Right: Map and Details */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          <div className="h-[500px] rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative z-0">
            <MapContainer center={[22.5726, 88.3639]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredCycles.map((cycle) => (
                <Marker 
                  key={cycle.id} 
                  position={cycle.location}
                  eventHandlers={{
                    click: () => setSelectedCycle(cycle),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-bold">{cycle.name}</h4>
                      <p className="text-sm">₹{cycle.price}/hr</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <MapUpdater center={selectedCycle?.location || [22.5726, 88.3639]} />
            </MapContainer>
          </div>

          <AnimatePresence mode="wait">
            {selectedCycle ? (
              <motion.div
                key={selectedCycle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass-card p-10 rounded-[3rem] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-kolkata-yellow/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <button 
                  onClick={() => setSelectedCycle(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <span className="bg-kolkata-black text-kolkata-yellow px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                      {selectedCycle.type}
                    </span>
                    <h2 className="text-4xl font-display font-black mb-4">{selectedCycle.name}</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">{selectedCycle.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <Zap className="w-5 h-5 text-kolkata-yellow mb-2" />
                        <p className="text-xs font-bold text-gray-400 uppercase">Battery</p>
                        <p className="font-bold">98%</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <Shield className="w-5 h-5 text-kolkata-yellow mb-2" />
                        <p className="text-xs font-bold text-gray-400 uppercase">Insurance</p>
                        <p className="font-bold">Included</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center bg-kolkata-black text-white p-10 rounded-[2.5rem] text-center">
                    <p className="text-gray-400 mb-2 uppercase tracking-widest text-sm font-bold">Total Price</p>
                    <p className="text-6xl font-black mb-8">₹{selectedCycle.price}<span className="text-xl text-gray-500 font-normal">/hr</span></p>
                    <button 
                      onClick={() => handleBook(selectedCycle)}
                      className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3"
                    >
                      Book Now <ArrowRight className="w-6 h-6" />
                    </button>
                    <p className="mt-6 text-sm text-gray-500">No hidden charges. Pay via UPI or Cards.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-12 rounded-[3rem] text-center flex flex-col items-center justify-center gap-6 border-dashed border-2 border-gray-200 bg-transparent">
                <div className="bg-gray-100 p-6 rounded-full">
                  <Bike className="w-12 h-12 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Select a Cycle</h3>
                  <p className="text-gray-500">Choose a cycle from the list or map to see details and book.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
}

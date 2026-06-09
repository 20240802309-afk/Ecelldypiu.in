
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FunkyMarquee from '../components/FunkyMarquee';
import {
  Calendar,
  Users,
  Star,
  Trophy,
  ArrowRight,
  Rocket,
  Loader2
} from 'lucide-react';

const Events = () => {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 500);
        }
      }
    };
    handleHashScroll();
  }, [location]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/event?action=get-events');
        const data = await response.json();
        if (response.ok) {
          setEvents(data);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-yellow selection:text-black font-sans overflow-x-hidden">

      {/* Hero Section */}
      <section className="min-h-[60vh] md:min-h-screen flex flex-col justify-center pt-32 md:pt-32 pb-12 relative border-b-4 border-white">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <h1 className="text-7xl md:text-[15vw] leading-[0.8] font-black tracking-tighter text-transparent stroke-text hover:text-brand-yellow transition-colors duration-500 cursor-default">
              OUR<br /><span className="text-white">EVENTS</span>
            </h1>

            <div className="flex flex-wrap gap-4 mt-12">
              {["COMPETITIONS", "WORKSHOPS", "NETWORKING"].map((tag, i) => (
                <span key={i} className="px-6 py-3 border-2 border-white rounded-full font-bold text-xl hover:bg-white hover:text-black transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <FunkyMarquee text="UPCOMING" direction="left" speed={20} className="bg-brand-yellow text-black border-b-4 border-black" />

      {/* Upcoming Events */}
      <section id="upcoming-events" className="py-12 md:py-20 px-4 bg-zinc-900 border-b-4 border-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-6xl font-black mb-12 tracking-tighter uppercase">
            WHAT'S <span className="text-brand-yellow">NEXT?</span>
          </h2>

          {/* Innovate For Impact Card - Moved to Past Highlights */}
          <div className="flex flex-col items-center justify-center py-12 border-4 border-dashed border-zinc-800 rounded-[2rem] text-center">
            <div className="bg-zinc-900 p-6 rounded-full mb-6">
              <Rocket className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-3xl font-black uppercase text-gray-500 mb-2">More Events Coming Soon</h3>
            <p className="text-gray-400 max-w-md">We are cooking up something big! Stay tuned for the next wave of innovation.</p>
          </div>
        </div>
      </section>

      <FunkyMarquee text="SUCCESS" direction="right" speed={15} className="bg-white text-black border-y-4 border-black rotate-1 scale-105 z-20" />

      {/* Successful Events */}
      <section className="py-16 md:py-32 px-4 bg-black">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-20 text-center tracking-tighter uppercase text-white">
            PAST <span className="text-brand-yellow">HIGHLIGHTS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {loading ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-20">
                <Loader2 className="w-12 h-12 text-brand-yellow animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20">
                <p className="text-xl text-gray-500">No events found.</p>
              </div>
            ) : (
              events.map((event, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10 }}
                  className="group bg-zinc-900 border-4 border-zinc-700 hover:border-brand-yellow rounded-[2rem] overflow-hidden transition-all duration-300 h-full flex flex-col"
                >
                  <div className="h-64 bg-white p-2 border-b-4 border-black relative overflow-hidden">
                    <img src={event.image || event.thumbnail} alt={event.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-3xl font-black uppercase mb-4">{event.title}</h3>
                    <div className="flex justify-between items-center border-t-2 border-zinc-700 pt-4 mt-auto">
                      <span className="font-mono text-brand-yellow">{event.date}</span>
                      <Link to={`/events/${event.slug || event.id}`}>
                        <div className="w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-black group-hover:border-black transition-all">
                          <ArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <style>{`
        .stroke-text {
          -webkit-text-stroke: 2px white;
        }
      `}</style>
    </div>
  );
};

export default Events;
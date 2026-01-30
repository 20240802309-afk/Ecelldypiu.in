
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import FunkyMarquee from '../components/FunkyMarquee';
import {
  Calendar,
  Users,
  Star,
  Trophy,
  ArrowRight
} from 'lucide-react';

const Events = () => {
  const location = useLocation();

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

  const successfulEvents = [
    {
      id: 4,
      title: "FinBiz'25 Powered by Surya Electronics",
      date: '8th and 9th November 2025',
      time: '36 Hour Marathon',
      location: 'DYPIU Campus',
      description: 'An unprecedented entrepreneurship & trading conclave by E-Cell DYPIU. 36-hour marathon of extensive learning and competition.',
      category: 'Conclave',
      participants: '500+',
      image: '/FINBIZ_SURYA.png',
      featured: true,
    },
    {
      id: 1,
      title: 'Inceptio\'25',
      date: '19th and 20th August 2025',
      time: 'Full Day Event',
      location: 'DYPIU Campus',
      description: 'Our flagship entrepreneurship event featuring startup pitches, workshops, and networking sessions.',
      category: 'Competition',
      participants: '200+',
      image: '/INCEPTIO.png',
      featured: true,
    },
    {
      id: 2,
      title: 'Elevate\'25',
      date: '21st August 2025',
      time: 'Full Day Event',
      location: 'DYPIU Campus',
      description: 'Startup acceleration and mentorship program designed to elevate student ventures to the next level.',
      category: 'Workshop',
      participants: '150+',
      image: '/ELEVATE.jpeg',
      featured: true,
    },
    {
      id: 3,
      title: "SIH'25",
      date: '23rd and 24th September 2025',
      time: '48 Hour Hackathon',
      location: 'DYPIU Campus',
      description: 'Smart India Hackathon internal competition where students solve real-world problems through innovative solutions.',
      category: 'Hackathon',
      participants: '300+',
      image: '/SIH.png',
      featured: true,
    },
  ];

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

          {/* Innovate For Impact Card */}
          <div className="grid grid-cols-1 gap-8">
            <motion.div
              whileHover={{ y: -10 }}
              className="group relative bg-zinc-900 border-4 border-brand-yellow rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_30px_rgba(255,178,44,0.2)] hover:shadow-[0_0_50px_rgba(255,178,44,0.4)] transition-all"
            >
              <div className="md:w-2/5 h-64 md:h-auto bg-black relative overflow-hidden border-b-4 md:border-b-0 md:border-r-4 border-white">
                <img src="/hack-for-impact.png" alt="Innovate For Impact" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-red-600 text-white font-black px-4 py-1 uppercase tracking-wider transform -rotate-2">
                  Registration Open
                </div>
              </div>

              <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Star className="w-32 h-32 text-brand-yellow" />
                </div>

                <div className="mb-6">
                  <span className="text-brand-yellow font-mono tracking-widest uppercase text-sm border border-brand-yellow/30 px-3 py-1 rounded-full">Zonal Qualifier</span>
                  <h3 className="text-4xl md:text-5xl font-black uppercase text-white leading-none mt-4 mb-2">
                    Innovate For <span className="text-brand-yellow">Impact</span>
                  </h3>
                  <p className="text-xl text-gray-400 font-bold">E-Summit 2026 Zonals</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-brand-yellow w-6 h-6" />
                    <div>
                      <p className="text-xs text-gray-500 font-mono uppercase">Date</p>
                      <p className="font-bold">01 Feb 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="text-brand-yellow w-6 h-6" />
                    <div>
                      <p className="text-xs text-gray-500 font-mono uppercase">Prize</p>
                      <p className="font-bold">₹10,000</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/events/hack-for-impact"
                  className="inline-flex items-center justify-between bg-white text-black font-black uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-brand-yellow hover:scale-105 transition-all group-hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                >
                  Event Details
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </motion.div>
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
            {successfulEvents.map((event, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="group bg-zinc-900 border-4 border-zinc-700 hover:border-brand-yellow rounded-[2rem] overflow-hidden transition-all duration-300 h-full flex flex-col"
              >
                <div className="h-64 bg-white p-8 border-b-4 border-black relative overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-3xl font-black uppercase mb-4">{event.title}</h3>
                  <div className="flex justify-between items-center border-t-2 border-zinc-700 pt-4 mt-auto">
                    <span className="font-mono text-brand-yellow">{event.date}</span>
                    <Link to={`/events/${event.title.toLowerCase().replace("'", "").replace("25", "")}`}>
                      <div className="w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-black group-hover:border-black transition-all">
                        <ArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
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
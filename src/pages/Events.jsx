
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
      title: 'SIH',
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

          {/* FinBiz'25 Event Card - Brutalist */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-black border-4 border-brand-yellow rounded-[2rem] p-8 md:p-12 shadow-[12px_12px_0px_white] hover:shadow-[8px_8px_0px_white] hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="inline-block bg-brand-yellow text-black font-black px-4 py-1 mb-4 text-sm uppercase">Featured Event</div>
                  <h3 className="text-2xl md:text-5xl font-black mb-6 uppercase leading-tight">
                    FinBiz'25 <span className="stroke-text text-transparent">SURYA</span>
                  </h3>
                  <p className="text-xl text-gray-400 font-bold mb-8">
                    An unprecedented entrepreneurship & trading conclave by E-Cell DYPIU. 36-hour marathon of extensive learning and competition.
                  </p>

                  <div className="flex gap-6 mb-8 text-lg font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-brand-yellow" /> 8-9 NOV
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="text-brand-yellow" /> 36 HOURS
                    </div>
                  </div>

                  <Link to="/events/finbiz" className="inline-block bg-white text-black text-xl font-black px-8 py-4 border-4 border-transparent hover:border-black hover:bg-brand-yellow transition-colors">
                    VIEW DETAILS
                  </Link>
                </div>
                <div className="hidden md:block w-48 h-48 bg-zinc-800 border-4 border-white rotate-3 flex items-center justify-center">
                  <Star className="w-24 h-24 text-white" />
                </div>
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
                className="group bg-zinc-900 border-4 border-zinc-700 hover:border-brand-yellow rounded-[2rem] overflow-hidden transition-all duration-300"
              >
                <div className="h-64 bg-white p-8 border-b-4 border-black relative overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-8">
                  <h3 className="text-3xl font-black uppercase mb-4">{event.title}</h3>
                  <div className="flex justify-between items-center border-t-2 border-zinc-700 pt-4 mt-4">
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
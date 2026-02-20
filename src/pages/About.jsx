

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import FunkyMarquee from '../components/FunkyMarquee';
import {
  Target,
  Eye,
  Users,
  Award,
  Lightbulb,
  TrendingUp,
  Globe,
  Star
} from 'lucide-react';

const About = () => {
  // Ensure page starts from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We foster creative thinking and encourage innovative solutions to real-world problems.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and building strong entrepreneurial communities.',
    },
    {
      icon: TrendingUp,
      title: 'Growth',
      description: 'We are committed to continuous learning and personal development of our members.',
    },
    {
      icon: Globe,
      title: 'Impact',
      description: 'We strive to create positive change in society through entrepreneurial ventures.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-yellow selection:text-black overflow-x-hidden font-sans">
      {/* Hero Section */}
      <section className="min-h-[60vh] md:min-h-screen flex flex-col justify-center pt-32 md:pt-32 pb-12 relative border-b-2 border-white/10">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <h1 className="text-7xl md:text-[12vw] leading-[0.8] font-black tracking-tighter text-transparent stroke-text hover:text-brand-yellow transition-colors duration-500 cursor-default">
              ABOUT<br /><span className="text-white">US</span>
            </h1>
            <div className="flex flex-col md:flex-row justify-between items-end mt-12 gap-8">
              <p className="text-xl md:text-3xl font-bold max-w-2xl leading-relaxed">
                EMPOWERING <span className="text-brand-yellow underline decoration-wavy underline-offset-4 md:underline-offset-8">STUDENTS</span> TO BECOME SUCCESSFUL ENTREPRENEURS.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <FunkyMarquee text="INNOVATION" speed={15} className="bg-brand-yellow text-black border-y-4 border-black -rotate-1 scale-105 z-20" />

      {/* Overview Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="border-4 border-white rounded-[2rem] p-8 md:p-12 relative overflow-hidden bg-zinc-900"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow rounded-full blur-[100px] opacity-20 pointer-events-none" />

            <h2 className="text-3xl md:text-6xl font-black mb-8 tracking-tighter uppercase">
              DYPIU <span className="text-brand-yellow">E-CELL</span>
            </h2>

            <div className="prose prose-xl prose-invert max-w-none">
              <p className="text-gray-300 font-bold leading-relaxed mb-12">
                A dynamic, student-led platform dedicated to cultivating entrepreneurship and innovation. Our mission is to inspire and support students to explore their entrepreneurial ambitions, develop their ideas, and build sustainable ventures.
              </p>

              <h4 className="text-3xl font-black text-white mb-6 uppercase border-b-4 border-brand-yellow inline-block pb-2">What We Do</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {[
                  { title: "Startup Pitches & Competitions", desc: "We organize pitch events where students showcase their startup ideas to investors and industry leaders." },
                  { title: "Workshops & Mentorship", desc: "We conduct hands-on workshops and connect students with experienced mentors to help refine their business models and strategies." },
                  { title: "Networking Opportunities", desc: "We create spaces for students to meet industry professionals, investors, and fellow entrepreneurs." },
                  { title: "Incubation & Acceleration", desc: "Through strategic partnerships with incubators and accelerators, we support startups in scaling and growth." }
                ].map((item, index) => (
                  <div key={index} className="bg-black border-2 border-zinc-700 p-6 rounded-xl hover:border-brand-yellow transition-all hover:shadow-[8px_8px_0px_white]">
                    <h5 className="font-black text-brand-yellow mb-2 text-xl uppercase">// {item.title}</h5>
                    <p className="text-gray-400 font-bold">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-black relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { title: "MISSION", icon: Target, desc: "To cultivate an entrepreneurial mindset among students by providing them with the necessary resources, mentorship, and platform to transform their innovative ideas into successful ventures that create value for society." },
              { title: "VISION", icon: Eye, desc: "To be recognized as the leading entrepreneurship cell that produces successful entrepreneurs who contribute to economic growth and social development, making DYPIU a hub of innovation and entrepreneurship." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-zinc-900 border-4 border-white p-10 rounded-[3rem] hover:rotate-2 transition-transform duration-300 group"
              >
                <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center mb-6 border-4 border-black group-hover:scale-110 transition-transform">
                  <item.icon className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-5xl font-black text-white mb-6 uppercase tracking-tighter">{item.title}</h3>
                <p className="text-xl text-gray-400 font-bold leading-relaxed border-l-4 border-brand-yellow pl-6">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FunkyMarquee text="VALUES" direction="right" speed={20} className="bg-white text-black border-y-4 border-black rotate-1 scale-105 z-20" />

      {/* Values Section */}
      <section className="py-32 px-4 bg-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-black border-2 border-zinc-800 p-8 rounded-2xl hover:bg-brand-yellow hover:text-black transition-colors group"
              >
                <value.icon className="w-12 h-12 text-brand-yellow group-hover:text-black mb-6" />
                <h3 className="text-2xl font-black uppercase mb-4">{value.title}</h3>
                <p className="text-gray-500 font-bold group-hover:text-black/80">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-16 md:py-24 bg-zinc-900 border-t-4 border-white relative overflow-hidden text-center">
        <div className="container mx-auto relative z-10 px-4">
          <h2 className="text-6xl md:text-9xl font-black text-white mb-12 tracking-tighter leading-none">
            JOIN THE<br /><span className="text-brand-yellow">REVOLUTION</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/apply">
              <button className="w-full sm:w-auto text-xl md:text-2xl font-black bg-brand-yellow text-black px-10 py-5 rounded-full border-4 border-black hover:bg-white hover:scale-105 transition-all shadow-[6px_6px_0px_white]">
                JOIN E-CELL
              </button>
            </Link>
            <Link to="/events">
              <button className="w-full sm:w-auto text-xl md:text-2xl font-black bg-transparent text-white px-10 py-5 rounded-full border-4 border-white hover:bg-white hover:text-black hover:scale-105 transition-all shadow-[6px_6px_0px_#FFB22C]">
                VIEW EVENTS
              </button>
            </Link>
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

export default About;
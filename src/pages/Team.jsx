import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, Award, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Marquee Component
const Marquee = ({ text, direction = 'left', speed = 20, className = "" }) => {
  return (
    <div className={`relative flex overflow-hidden py-4 ${className}`}>
      <div
        className={`flex whitespace-nowrap ${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-6xl md:text-8xl font-black mx-8 uppercase tracking-tighter">
            {text} <span className="text-brand-yellow">•</span>
          </span>
        ))}
      </div>
      <div
        className={`flex whitespace-nowrap ${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'} absolute top-4 left-0`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-6xl md:text-8xl font-black mx-8 uppercase tracking-tighter">
            {text} <span className="text-brand-yellow">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const coreTeam = [
  { name: 'YASH MARU', position: 'PRESIDENT', image: '/team/YASH MARU.jpeg', icon: Users },
  { name: 'PREET SONAR', position: 'VICE PRESIDENT', image: '/team/PREET SONAR.jpeg', icon: Users },
  { name: 'BHAVIKA DESHMUKH', position: 'DESIGN LEAD', image: '/team/BHAVIKA DESHMUKH.png', icon: Users },

  { name: 'D DISHA SHREE', position: 'GENERAL SECRETARY', image: '/team/DISHA SHREE.png', icon: Users },
  { name: 'HIMESH WANI', position: 'OPERATION LEAD', image: '/team/HIMESH WANI (2).png', icon: Users },
  { name: 'YASH PAWAR', position: 'PR LEAD', image: '/team/YASH PAWAR.jpeg', icon: Users },
  { name: 'PRANAV BATHEJA', position: 'MARKETING LEAD', image: '/team/PRANAV BHATEJA.jpeg', icon: Users },
  { name: 'RAM MITTAL', position: 'CORPORATE LEAD', image: '/team/RAM MITTAL.png', icon: Users },
  { name: 'RIGVED AHERRAO', position: 'TECHNICAL LEAD', image: '/team/RIGVED AHEARRAO.png', icon: Users },
  { name: 'YASH TRIPATHI', position: 'WEB DEVELOPMENT LEAD', image: '/team/YASH TRIPATHI.png', icon: Users },
  { name: 'SHARWARI KHANDAIT', position: 'SOCIAL MEDIA LEAD', image: '/team/SHARWARI KHANDAIT.jpeg', icon: Users },
  { name: 'SHANTANU PATIL', position: 'TREASURY LEAD', image: '/team/SHANTANU PATIL.png', icon: Users },
];

const mentor = {
  name: 'Dr. Sandhya Ingale',
  position: 'Experienced Mentor',
  department: 'Faculty Advisor',
  bio: 'Distinguished academic and industry expert guiding the next generation of leaders.',
  image: '/SANDHYA INGLE.jpeg',
  achievements: [
    'Academic Leadership', 'Innovation Expert', 'Visionary', 'Student Mentor'
  ]
};

const Team = () => {
  const containerRef = useRef(null);
  // Optional: Add scroll based transforms if needed, currently kept simple for performance

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-yellow selection:text-black overflow-x-hidden" ref={containerRef}>

      {/* 1. HERO SECTION: Massive Typography */}
      <section className="min-h-[60vh] md:min-h-screen flex flex-col justify-center pt-32 md:pt-32 pb-12 relative border-b-2 border-white/10">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <h1 className="text-7xl md:text-[12vw] leading-[0.8] font-black tracking-tighter text-transparent stroke-text hover:text-brand-yellow transition-colors duration-500 cursor-default">
              THE<br /><span className="text-white">SQUAD</span>
            </h1>

            <div className="flex flex-col md:flex-row justify-between items-end mt-8 md:mt-12 gap-8">
              <p className="text-xl md:text-4xl font-bold max-w-2xl leading-tight">
                WE ARE THE <span className="text-brand-yellow underline decoration-wavy underline-offset-8">ARCHITECTS</span> OF INNOVATION AT DYPIU.
              </p>

              {/* Removed decorative star and arrow icons */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. MARQUEE SEPARATOR */}
      <section className="bg-brand-yellow text-black border-y-4 border-black -rotate-1 scale-105 z-20 relative">
        <Marquee text="LEADERS" speed={15} />
      </section>

      {/* 3. MENTOR SECTION: Brutalist Layout */}
      <section className="py-12 md:py-32 px-4 relative">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-stretch border-4 border-white">
            {/* Image Side */}
            <div className="md:w-1/2 relative min-h-[500px] border-b-4 md:border-b-0 md:border-r-4 border-white overflow-hidden group">

              <img
                src={mentor.image}
                alt={mentor.name}
                className="w-full h-full object-cover transition-all duration-500 scale-100 group-hover:scale-110"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <span className="inline-block bg-brand-yellow text-black px-8 py-4 text-2xl md:text-4xl font-black font-mono uppercase rounded-2xl border-4 border-black shadow-[8px_8px_0px_#000]">
                  THE MENTOR
                </span>
              </div>
            </div>

            {/* Content Side */}
            <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-zinc-900">
              <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9]">
                DR.<br />SANDHYA<br /><span className="text-stroke-yellow text-transparent">INGALE</span>
              </h2>
              <p className="text-xl md:text-2xl font-bold text-gray-400 mb-8 border-l-4 border-brand-yellow pl-6">
                {mentor.bio}
              </p>

              <div className="grid grid-cols-1 gap-4">
                {mentor.achievements.map((tag, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-4 h-4 bg-white rotate-45 group-hover:bg-brand-yellow transition-colors" />
                    <span className="text-xl font-mono uppercase tracking-widest group-hover:translate-x-4 transition-transform duration-300">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE TEAM: Funky Grid */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="flex justify-center mb-12 md:mb-20"
          >
            <h2 className="bg-brand-yellow text-black px-8 md:px-12 py-4 md:py-6 text-4xl md:text-7xl font-black tracking-tighter leading-none hover:tracking-normal transition-all duration-700 uppercase rounded-2xl border-4 border-black shadow-[8px_8px_0px_#000] md:shadow-[12px_12px_0px_#000]">
              CORE MEMBERS
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreTeam.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -20, rotate: index % 2 === 0 ? 2 : -2 }}
                className="group relative"
              >
                {/* Card Container */}
                <div className="bg-zinc-900 border-4 border-white rounded-[2rem] overflow-hidden relative">
                  {/* Image */}
                  <div className="aspect-[4/5] relative overflow-hidden transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <Users className="w-20 h-20 text-brand-yellow" />
                      </div>
                    )}
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-6 z-20 bg-black/80 backdrop-blur-md border-t-4 border-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl md:text-3xl font-black uppercase italic mb-1">
                      {member.name}
                    </h3>
                    <p className="text-brand-yellow font-mono font-bold tracking-widest text-sm">
                      // {member.position}
                    </p>
                  </div>

                  {/* Hover Effect: Yellow Flash */}

                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA: Massive Button */}
      <section className="py-10 md:py-16 bg-white text-black text-center relative overflow-hidden">
        <Marquee text="JOIN US " direction="right" speed={15} className="absolute top-4 opacity-20" />
        <Marquee text="BECOME A LEADER " direction="left" speed={25} className="absolute bottom-4 opacity-20" />

        <div className="container mx-auto relative z-10">
          <h2 className="text-5xl md:text-8xl font-black mb-8 md:mb-12 tracking-tighter">
            READY TO <span className="outline-text">LEAD?</span>
          </h2>
          <Link to="/apply">
            <button className="text-xl md:text-4xl font-black bg-brand-yellow px-10 md:px-16 py-6 md:py-8 rounded-full border-4 border-black hover:bg-black hover:text-white hover:scale-110 transition-all duration-300 shadow-[6px_6px_0px_0px_#000] md:shadow-[10px_10px_0px_0px_#000]">
              APPLY NOW!
            </button>
          </Link>
        </div>
      </section>

      {/* Custom Styles for Stroke Text */}
      <style>{`
        .stroke-text {
          -webkit-text-stroke: 2px white;
        }
        .text-stroke-yellow {
          -webkit-text-stroke: 2px #FFB22C;
        }
        .outline-text {
          -webkit-text-stroke: 2px black;
          color: transparent;
        }
      `}</style>

    </div>
  );
};

export default Team;

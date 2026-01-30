import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  Zap,
  Target,
  Rocket,
  Globe,
  Code,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import JoinInfoPopover from '../components/JoinInfoPopover';

const Marquee = ({ text, direction = 'left', speed = 25 }) => {
  return (
    <div className="relative flex overflow-hidden bg-brand-yellow border-y-2 border-black py-4 sm:py-6 group">
      <div
        className={`flex whitespace-nowrap ${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} className="text-4xl sm:text-6xl md:text-8xl font-black text-black mx-8 uppercase tracking-tighter">
            {text} •
          </span>
        ))}
      </div>
      <div
        className={`flex whitespace-nowrap ${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} className="text-4xl sm:text-6xl md:text-8xl font-black text-black mx-8 uppercase tracking-tighter">
            {text} •
          </span>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  const features = [
    {
      icon: Zap,
      title: 'Startup Pitches',
      description: 'Showcase your ideas to top-tier investors and industry leaders.',
    },
    {
      icon: Target,
      title: 'Mentorship',
      description: 'Get guidance from experienced entrepreneurs to refine your strategy.',
    },
    {
      icon: Globe,
      title: 'Networking',
      description: 'Connect with a global community of innovators and disruptors.',
    },
    {
      icon: Rocket,
      title: 'Incubation',
      description: 'Access resources and workspaces to scale your venture.',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-white text-black overflow-hidden">

      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-screen flex flex-col justify-center items-center bg-black px-4 pt-56 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        {/* Background Image: Grayscale & Dim */}
        <div className="absolute inset-0 w-full h-full z-0 bg-black">
          <img src="/hero-bg.png" alt="Hero Background" className="w-full h-full object-cover grayscale opacity-50" />
          {/* Gradient Overlay for extra dimming/readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            {/* Removed EST. 2018 text */}
            <h1 className="text-[11vw] md:text-[12vw] leading-[0.85] font-black text-white tracking-tighter mb-8 break-words text-center">
              IGNITING
              <br />
              <span className="text-brand-yellow">INNOVATION</span>
            </h1>

            <p className="text-xl md:text-3xl text-gray-400 max-w-3xl mx-auto font-medium mb-12 tracking-tight">
              We build the <span className="text-white border-b-2 border-brand-yellow">future</span> by empowering the next generation of distinctively capable leaders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full sm:w-auto">
              <Link
                to="/about"
                className="group relative bg-brand-yellow text-black px-8 py-4 sm:px-10 sm:py-5 rounded-full font-bold text-lg hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center w-full sm:w-auto border-2 border-white shadow-glow-yellow"
              >
                Discover Mission
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/events"
                className="group px-8 py-4 sm:px-10 sm:py-5 rounded-full border border-white text-white font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 w-full sm:w-auto text-center shadow-glow-white"
              >
                Explore Events
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <motion.div
            style={{ rotate }}
            className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] border-[1px] border-white/20 rounded-full"
          />
          <motion.div
            style={{ rotate: useTransform(scrollYProgress, [0, 1], [0, -45]) }}
            className="absolute top-[40%] -left-[10%] w-[30vw] h-[30vw] border-[1px] border-brand-yellow/50 rounded-full"
          />
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-0 bg-brand-yellow">
        <Marquee text="INNOVATE" direction="left" />
      </section>

      {/* Why Us Section - BENTO GRID STYLE */}
      <section ref={targetRef} className="py-16 md:py-32 bg-black px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 md:mb-6 leading-none">
                WHY <span className="text-stroke-white">CHOOSE US?</span>
              </h2>
            </div>
            <p className="text-lg md:text-xl max-w-md font-medium text-gray-400 mb-2">
              We provide the ecosystem, you bring the ambition. Together we build something legendary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                style={{ scale }}
                className="group relative bg-zinc-900 border-2 border-zinc-800 p-8 rounded-[2rem] hover:bg-brand-yellow hover:text-black transition-colors duration-300 flex flex-col justify-start gap-6 h-full"
              >
                <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center border-2 border-black group-hover:border-black transition-colors">
                  <feature.icon className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-4 tracking-tight text-white group-hover:text-black">{feature.title}</h3>
                  <p className="text-lg opacity-80 font-medium text-gray-300 group-hover:text-black group-hover:opacity-100">{feature.description}</p>
                </div>
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="-rotate-45 w-8 h-8 text-black" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Large Statement Section */}
      <section className="py-20 md:py-40 bg-black text-white px-4 border-t border-white/10">
        <div className="container mx-auto text-center">
          <div className="mb-12">
            <h2 className="inline-block bg-brand-yellow text-black font-black text-3xl md:text-5xl px-8 py-3 transform -rotate-2 border-4 border-white shadow-[8px_8px_0px_white] hover:rotate-0 hover:shadow-none transition-all duration-300 cursor-default">
              THE VISION
            </h2>
          </div>
          <h2 className="text-4xl md:text-7xl font-bold font-sans max-w-5xl mx-auto leading-tight">
            "We don't just predict the future. We <span className="text-brand-yellow underline decoration-wavy underline-offset-8">incubate</span> it."
          </h2>
        </div>
      </section>

      {/* CTA Section */}
      {/* CTA Section */}
      <section className="relative py-12 md:py-20 bg-brand-yellow px-4 border-y-2 border-black overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-9xl font-black text-black tracking-tighter mb-8 md:mb-12 transform group-hover:scale-105 transition-transform duration-500">
            READY TO LAUNCH?
          </h2>
          <JoinInfoPopover>
            <button
              className="bg-black text-white text-xl md:text-2xl font-bold py-6 px-12 rounded-full hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 shadow-glow-white"
            >
              Join The Experience
            </button>
          </JoinInfoPopover>
        </div>
      </section>

    </div>
  );
};

export default Home;
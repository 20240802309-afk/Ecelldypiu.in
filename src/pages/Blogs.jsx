
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Lightbulb,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FunkyMarquee from '../components/FunkyMarquee';

const Blogs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
    {
      id: 1,
      title: 'E-Cell DYPIU Blog: Where Ideas Meet Impact',
      excerpt: 'Discover how E-Cell DYPIU is transforming entrepreneurial dreams into reality through innovative programs, events, and community building.',
      author: 'E-Cell DYPIU',
      date: 'September 20, 2025',
      readTime: '5 min read',
      category: 'Entrepreneurship',
      tags: ['E-Cell', 'Innovation', 'Impact'],
      link: '/blogs/where-ideas-meet-impact'
    },
    {
      id: 2,
      title: 'E-Cell DYPIU at COEP Pune E-Cell Meetup',
      excerpt: 'A collaborative gathering of Pune\'s brightest entrepreneurial minds, fostering connections and sharing innovative ideas across the city\'s startup ecosystem.',
      author: 'E-Cell Team',
      date: 'September 27, 2025',
      readTime: '6 min read',
      category: 'Events',
      tags: ['Meetup', 'Networking', 'COEP Pune'],
      link: '/blogs/ceo-pune-meetup'
    },
    {
      id: 3,
      title: 'E-Cell DYPIU at Entrepreneurship Awareness Drive',
      excerpt: 'E-Cell DYPIU takes the lead in spreading entrepreneurship awareness across Pune, empowering aspiring entrepreneurs with knowledge and resources.',
      author: 'E-Cell DYPIU',
      date: 'October 1, 2025',
      readTime: '7 min read',
      category: 'Events',
      tags: ['Awareness', 'Startup Ecosystem', 'Pune'],
      link: '/blogs/entrepreneurship-awareness-drive'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-yellow selection:text-black font-sans overflow-x-hidden">

      {/* Hero Section */}
      <section className="min-h-[50vh] md:min-h-screen flex flex-col justify-center pt-24 md:pt-32 pb-12 relative border-b-4 border-white">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-[15vw] leading-[0.9] md:leading-[0.8] font-black tracking-tighter text-transparent stroke-text hover:text-brand-yellow transition-colors duration-500 cursor-default">
              THE<br /><span className="text-white">BLOG</span>
            </h1>
            <p className="text-lg md:text-3xl font-bold max-w-2xl mt-6 md:mt-8 pl-4 border-l-4 md:border-l-8 border-brand-yellow">
              INSIGHTS FROM THE <span className="text-brand-yellow">ENTREPRENEURIAL</span> FRONTIER.
            </p>
          </motion.div>
        </div>
      </section>

      <FunkyMarquee text="READING" speed={25} className="bg-brand-yellow text-black border-y-4 border-black -rotate-1 scale-105 z-20" />

      {/* Featured Articles Section */}
      <section className="py-12 md:py-20 px-4 bg-zinc-900 border-t-4 border-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-6xl font-black mb-8 md:mb-16 tracking-tighter uppercase text-center md:text-left">
            FEATURED <span className="text-brand-yellow">POSTS</span>
          </h2>

          <div className="grid grid-cols-1 gap-8 md:gap-12">
            {blogPosts.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black border-4 border-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 shadow-[8px_8px_0px_#FFB22C] md:shadow-[12px_12px_0px_#FFB22C] hover:shadow-[4px_4px_0px_#FFB22C] md:hover:shadow-[8px_8px_0px_#FFB22C] hover:translate-x-1 hover:translate-y-1 transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 md:gap-4 mb-4 md:mb-6">
                      <span className="bg-zinc-800 text-white px-3 py-1 rounded-full font-mono text-xs md:text-sm border border-zinc-600">{blog.category}</span>
                      <span className="bg-brand-yellow text-black px-3 py-1 rounded-full font-mono font-bold text-xs md:text-sm">{blog.readTime}</span>
                    </div>
                    <h3 className="text-2xl md:text-5xl font-black mb-4 md:mb-6 uppercase leading-tight group-hover:text-brand-yellow transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-base md:text-xl text-gray-400 font-bold mb-6 md:mb-8 leading-relaxed max-w-3xl">
                      {blog.excerpt}
                    </p>
                    <Link to={blog.link} className="inline-flex items-center text-lg md:text-xl font-black uppercase hover:underline decoration-4 decoration-brand-yellow underline-offset-4">
                      READ ARTICLE <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6" />
                    </Link>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-black animate-spin-slow">
                      <BookOpen className="w-16 h-16 text-black" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-brand-yellow border-y-4 border-black text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-6xl font-black text-black mb-6 md:mb-8 uppercase">Stay Updated</h2>
          <div className="flex justify-center gap-4">
            <Link to="/newsletter" className="bg-black text-white px-6 py-3 md:px-8 md:py-4 text-lg md:text-xl font-black uppercase border-4 border-transparent hover:border-white hover:bg-zinc-900 transition-all w-full md:w-auto">
              SUBSCRIBE TO NEWSLETTER
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

export default Blogs;

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Sparkles, 
  Briefcase, 
  Shield, 
  Code2, 
  Megaphone, 
  Palette, 
  Share2, 
  DollarSign, 
  Award
} from 'lucide-react';
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

const departments = [
  { id: 'all', name: 'All Members', icon: Users },
  { id: 'Executive Board', name: 'Executive Board', icon: Award },
  { id: 'Technical Team', name: 'Technical', icon: Code2 },
  { id: 'Corporate Relations Team', name: 'Corporate Relations', icon: Briefcase },
  { id: 'Management Team', name: 'Management', icon: Shield },
  { id: 'Design Team', name: 'Design', icon: Palette },
  { id: 'Social Media Team', name: 'Social Media', icon: Share2 },
  { id: 'Public Relations Team', name: 'PR', icon: Megaphone },
  { id: 'Marketing Team', name: 'Marketing', icon: Sparkles },
  { id: 'Finance Team', name: 'Finance', icon: DollarSign },
];

const teamData = [
  // EXECUTIVE BOARD
  {
    name: 'Yash Maru',
    position: 'President',
    department: 'Executive Board',
    image: '/team/yash-maru.jpeg',
    priority: 1
  },
  {
    name: 'Preet Sonar',
    position: 'Vice-President',
    department: 'Executive Board',
    image: '/team/preet-sonar.jpg',
    priority: 2
  },
  {
    name: 'D Disha Shree',
    position: 'General Secretary',
    department: 'Executive Board',
    image: '/team/d-disha-shree.png',
    priority: 3
  },

  // FINANCE TEAM
  {
    name: 'Shantanu Patil',
    position: 'Treasurer',
    department: 'Finance Team',
    image: '/team/shantanu-patil.jpg',
    priority: 1
  },

  // TECHNICAL TEAM
  {
    name: 'Rigved Aherrao',
    position: 'Tech Lead',
    department: 'Technical Team',
    image: '/team/rigved-aherrao.jpeg',
    priority: 1
  },
  {
    name: 'Yash Tripathi',
    position: 'Tech Secretary',
    department: 'Technical Team',
    image: '/team/yash-tripathi.png',
    priority: 2
  },
  {
    name: 'Diya Rathod',
    position: 'Tech Team Member',
    department: 'Technical Team',
    image: '/team/diya-rathod.jpg',
    priority: 3
  },
  {
    name: 'Krushna Nirmalkar',
    position: 'Tech Team Member',
    department: 'Technical Team',
    image: '/team/krushna-nirmalkar.jpg',
    priority: 4
  },
  {
    name: 'Riya Petle',
    position: 'Tech Team Member',
    department: 'Technical Team',
    image: '/team/riya-petle.jpg',
    priority: 5
  },
  {
    name: 'Aadi Rohankar',
    position: 'Tech Team Member',
    department: 'Technical Team',
    image: '/team/aadi-rohankar.jpeg',
    priority: 6
  },

  // CORPORATE RELATIONS TEAM
  {
    name: 'Ram Mittal',
    position: 'CR Lead',
    department: 'Corporate Relations Team',
    image: '/team/ram-mittal.jpg',
    priority: 1
  },
  {
    name: 'Abhishek Ghate',
    position: 'CR Team Member',
    department: 'Corporate Relations Team',
    image: '/team/abhishek-ghate.jpeg',
    priority: 2
  },
  {
    name: 'Aviraj Raut',
    position: 'CR Team Member',
    department: 'Corporate Relations Team',
    image: '/team/aviraj-raut.png',
    priority: 3
  },
  {
    name: 'Koushal Pratap Singh',
    position: 'CR Team Member',
    department: 'Corporate Relations Team',
    image: '/team/koushal-pratap-singh.jpg',
    priority: 4
  },
  {
    name: 'Ketaki',
    position: 'CR Team Member',
    department: 'Corporate Relations Team',
    image: '/team/ketaki.jpg',
    priority: 5
  },
  {
    name: 'Aaryan Thole',
    position: 'CR Team Member',
    department: 'Corporate Relations Team',
    image: '/team/aaryan-thole.jpg',
    priority: 6
  },

  // MANAGEMENT TEAM
  {
    name: 'Yash Jain',
    position: 'Ops Lead',
    department: 'Management Team',
    image: '/team/yash-jain.jpg',
    priority: 1
  },
  {
    name: 'Nishant Kumar',
    position: 'Ops Secretary',
    department: 'Management Team',
    image: '/team/nishant-kumar.jpg',
    priority: 2
  },
  {
    name: 'Vyom Singhai',
    position: 'Hospitality Lead',
    department: 'Management Team',
    image: '/team/vyom-singhai.jpg',
    priority: 3
  },
  {
    name: 'Krushna Patil',
    position: 'Hospitality Secretary',
    department: 'Management Team',
    image: '/team/krushna-patil.png',
    priority: 4
  },
  {
    name: 'Israr Sheikh',
    position: 'Security Joint-Lead',
    department: 'Management Team',
    image: '/team/israr-sheikh.jpg',
    priority: 5
  },
  {
    name: 'Amey Mode',
    position: 'Security Joint-Lead',
    department: 'Management Team',
    image: '/team/amey-mode.png',
    priority: 6
  },
  {
    name: 'Soham Raut',
    position: 'Management Team Member',
    department: 'Management Team',
    image: '/team/soham-raut.jpg',
    priority: 7
  },
  {
    name: 'Harshit Barde',
    position: 'Management Team Member',
    department: 'Management Team',
    image: '/team/harshit-barde.png',
    priority: 8
  },
  {
    name: 'Rohan Rijhwani',
    position: 'Management Team Member',
    department: 'Management Team',
    image: '/team/rohan-rijhwani.jpg',
    priority: 9
  },
  {
    name: 'Suman',
    position: 'Management Team Member',
    department: 'Management Team',
    image: '/team/suman.jpg',
    priority: 10
  },
  {
    name: 'Prince Jha',
    position: 'Management Team Member',
    department: 'Management Team',
    image: '/team/prince-jha.jpg',
    priority: 11
  },
  {
    name: 'Sarthak Saoji',
    position: 'Management Team Member',
    department: 'Management Team',
    image: '/team/sarthak-saoji.png',
    priority: 12
  },
  {
    name: 'Sharvari Burle',
    position: 'Management Team Member',
    department: 'Management Team',
    image: '/team/sharvari-burle.jpg',
    priority: 13
  },
  {
    name: 'Madhura Joshi',
    position: 'Management Team Member',
    department: 'Management Team',
    image: '/team/madhura-joshi.jpg',
    priority: 14
  },
  {
    name: 'Sneha Kelzarkar',
    position: 'Anchor',
    department: 'Management Team',
    image: '/team/sneha-kelzarkar.jpeg',
    priority: 15
  },

  // DESIGN TEAM
  {
    name: 'Bhavika Deshmukh',
    position: 'Design Lead',
    department: 'Design Team',
    image: '/team/bhavika-deshmukh.png',
    priority: 1
  },
  {
    name: 'Om Joshi',
    position: 'Design Secretary',
    department: 'Design Team',
    image: '/team/om-joshi.jpg',
    priority: 2
  },
  {
    name: 'Vanshika Kanojiya',
    position: 'Design Team Member',
    department: 'Design Team',
    image: '/team/vanshika-kanojiya.jpg',
    priority: 3
  },
  {
    name: 'Aarushi Jain',
    position: 'Design Team Member',
    department: 'Design Team',
    image: '/team/aarushi-jain.jpg',
    priority: 4
  },
  {
    name: 'Diya Bagul',
    position: 'Design Team Member',
    department: 'Design Team',
    image: '/team/diya-bagul.jpg',
    priority: 5
  },
  {
    name: 'Krutika Ashapure',
    position: 'Design Team Member',
    department: 'Design Team',
    image: '/team/krutika-ashapure.jpg',
    priority: 6
  },
  {
    name: 'Pranjal',
    position: 'Design Team Member',
    department: 'Design Team',
    image: '/team/pranjal.jpg',
    priority: 7
  },

  // SOCIAL MEDIA TEAM
  {
    name: 'Sharvari Khandait',
    position: 'Social Media Lead',
    department: 'Social Media Team',
    image: '/team/sharvari-khandait.jpg',
    priority: 1
  },
  {
    name: 'Samikshit Ghule',
    position: 'Social Media Coordinator',
    department: 'Social Media Team',
    image: '/team/samikshit-ghule.jpg',
    priority: 2
  },
  {
    name: 'Almeer Khan',
    position: 'Social Media Team Member',
    department: 'Social Media Team',
    image: '/team/almeer-khan.jpg',
    priority: 3
  },
  {
    name: 'Pawani Sharma',
    position: 'Social Media Team Member',
    department: 'Social Media Team',
    image: '/team/pawani-sharma.jpg',
    priority: 4
  },
  {
    name: 'Viral Babariya',
    position: 'Social Media Team Member',
    department: 'Social Media Team',
    image: '/team/viral-babariya.jpg',
    priority: 5
  },
  {
    name: 'Sankalp',
    position: 'Social Media Team Member',
    department: 'Social Media Team',
    image: '/team/sankalp.png',
    priority: 6
  },

  // PUBLIC RELATIONS TEAM
  {
    name: 'Yash Pawar',
    position: 'PR Lead',
    department: 'Public Relations Team',
    image: '/team/yash-pawar.jpeg',
    priority: 1
  },
  {
    name: 'Swara Pusalkar',
    position: 'PR Joint-Coordinator',
    department: 'Public Relations Team',
    image: '/team/swara-pusalkar.jpg',
    priority: 2
  },
  {
    name: 'Kali Kanungo',
    position: 'PR Joint-Coordinator',
    department: 'Public Relations Team',
    image: '/team/kali-kanungo.jpg',
    priority: 3
  },
  {
    name: 'Shravani Sakunde',
    position: 'PR Team Member',
    department: 'Public Relations Team',
    image: '/team/shravani-sakunde.jpeg',
    priority: 4
  },

  // MARKETING TEAM
  {
    name: 'Pranav Batheja',
    position: 'Marketing Lead',
    department: 'Marketing Team',
    image: '/team/pranav-batheja.jpeg',
    priority: 1
  },
  {
    name: 'Sanskruti Amdare',
    position: 'Marketing Coordinator',
    department: 'Marketing Team',
    image: '/team/sanskruti-amdare.png',
    priority: 2
  },
  {
    name: 'Anwesha Sahay',
    position: 'Marketing Team Member',
    department: 'Marketing Team',
    image: '/team/anwesha-sahay.jpg',
    priority: 3
  },
  {
    name: 'Disha Sachdev',
    position: 'Marketing Team Member',
    department: 'Marketing Team',
    image: '/team/disha-sachdev.jpg',
    priority: 4
  },
  {
    name: 'Priyal Bisen',
    position: 'Marketing Team Member',
    department: 'Marketing Team',
    image: '/team/priyal-bisen.jpg',
    priority: 5
  },
  {
    name: 'Vanshika Kanojiya',
    position: 'Marketing Team Member',
    department: 'Marketing Team',
    image: '/team/vanshika-kanojiya.jpg',
    priority: 6
  },
  {
    name: 'Mitali Lodh',
    position: 'Marketing Team Member',
    department: 'Marketing Team',
    image: '/team/mitali-lodh.jpeg',
    priority: 7
  },
  {
    name: 'Devesh Sankhla',
    position: 'Marketing Team Member',
    department: 'Marketing Team',
    image: '/team/devesh-sankhla.jpg',
    priority: 8
  }
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

// Team Member Card Component
const MemberCard = ({ member, index }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [member.image]);

  // Get initials for fallback avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      {/* Card Box with Neo-brutalist Shadow and Border */}
      <div className="bg-zinc-900 border-4 border-white rounded-[2rem] overflow-hidden relative shadow-[6px_6px_0px_rgba(255,255,255,0.15)] hover:shadow-[10px_10px_0px_#FFB22C] hover:border-brand-yellow transition-all duration-300 flex flex-col h-full">
        
        {/* Department Badge Top Left */}
        <div className="absolute top-4 left-4 z-30 pointer-events-none">
          <span className="inline-block bg-black/80 backdrop-blur-md text-white border-2 border-white/60 group-hover:border-brand-yellow group-hover:text-brand-yellow px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-full shadow-md transition-colors duration-300">
            {member.department.replace(' Team', '')}
          </span>
        </div>

        {/* Image / Avatar Container */}
        <div className="aspect-[4/5] relative overflow-hidden bg-zinc-950 flex items-center justify-center">
          {member.image && !imgError ? (
            <>
              <img
                src={member.image}
                alt={member.name}
                onError={() => setImgError(true)}
                loading="lazy"
                className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105 filter group-hover:contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300 z-10" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFB22C_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="w-24 h-24 rounded-full bg-brand-yellow text-black flex items-center justify-center text-3xl font-black font-mono border-4 border-black shadow-[4px_4px_0px_white] mb-4 group-hover:scale-110 transition-transform duration-300">
                {getInitials(member.name)}
              </div>
              <Users className="w-6 h-6 text-brand-yellow opacity-40" />
            </div>
          )}
        </div>

        {/* Info Banner at Bottom */}
        <div className="p-5 z-20 bg-black/90 backdrop-blur-md border-t-4 border-white group-hover:border-brand-yellow transition-colors duration-300 mt-auto">
          <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-white mb-1 group-hover:text-brand-yellow transition-colors duration-300 line-clamp-1">
            {member.name}
          </h3>
          <p className="text-brand-yellow font-mono font-bold tracking-wider text-xs md:text-sm uppercase flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
            {member.position}
          </p>
        </div>

      </div>
    </motion.div>
  );
};

const Team = () => {
  const containerRef = useRef(null);
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members based on department and search query
  const filteredMembers = useMemo(() => {
    return teamData.filter((member) => {
      const matchesDept = selectedDept === 'all' || member.department === selectedDept;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.position.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query);
      return matchesDept && matchesSearch;
    });
  }, [selectedDept, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-yellow selection:text-black overflow-x-hidden" ref={containerRef}>

      {/* 1. HERO SECTION */}
      <section className="min-h-[50vh] md:min-h-[65vh] flex flex-col justify-center pt-32 pb-12 relative border-b-2 border-white/10">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "circOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-brand-yellow text-black px-4 py-1.5 rounded-full text-xs md:text-sm font-black uppercase font-mono tracking-widest mb-6 border-2 border-black shadow-[4px_4px_0px_#fff]">
              <Sparkles className="w-4 h-4" /> DYPIU E-CELL TEAM
            </div>

            <h1 className="text-7xl md:text-[11vw] leading-[0.85] font-black tracking-tighter text-transparent stroke-text hover:text-brand-yellow transition-colors duration-500 cursor-default">
              THE<br /><span className="text-white">SQUAD</span>
            </h1>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-8 md:mt-12 gap-8">
              <p className="text-xl md:text-4xl font-bold max-w-2xl leading-tight">
                WE ARE THE <span className="text-brand-yellow underline decoration-wavy underline-offset-8">ARCHITECTS</span> OF INNOVATION AT DYPIU.
              </p>
              <div className="flex items-center gap-3 bg-zinc-900 border-2 border-zinc-700 px-6 py-3 rounded-2xl">
                <Users className="w-6 h-6 text-brand-yellow" />
                <div>
                  <div className="text-2xl font-black text-white leading-none">{teamData.length}</div>
                  <div className="text-xs font-mono uppercase text-gray-400">Core Members</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. MARQUEE SEPARATOR */}
      <section className="bg-brand-yellow text-black border-y-4 border-black -rotate-1 scale-105 z-20 relative shadow-2xl">
        <Marquee text="LEADERS • INNOVATORS • BUILDERS • VISIONARIES" speed={18} />
      </section>

      {/* 3. MENTOR SECTION */}
      <section className="py-16 md:py-28 px-4 relative">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-stretch border-4 border-white rounded-[2.5rem] overflow-hidden shadow-[12px_12px_0px_#FFB22C]">
            {/* Image Side */}
            <div className="md:w-1/2 relative min-h-[420px] md:min-h-[500px] border-b-4 md:border-b-0 md:border-r-4 border-white overflow-hidden group bg-zinc-900">
              <img
                src={mentor.image}
                alt={mentor.name}
                className="w-full h-full object-cover transition-all duration-500 scale-100 group-hover:scale-105"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <span className="inline-block bg-brand-yellow text-black px-6 md:px-8 py-3 md:py-4 text-xl md:text-3xl font-black font-mono uppercase rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000]">
                  THE MENTOR
                </span>
              </div>
            </div>

            {/* Content Side */}
            <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-zinc-900 overflow-hidden">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-[0.9]">
                DR.<br />SANDHYA<br /><span className="text-stroke-yellow text-transparent">INGALE</span>
              </h2>
              <p className="text-lg md:text-2xl font-bold text-gray-300 mb-8 border-l-4 border-brand-yellow pl-6 leading-relaxed">
                {mentor.bio}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mentor.achievements.map((tag, i) => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer bg-black/50 border border-zinc-800 p-3 rounded-xl hover:border-brand-yellow transition-all">
                    <div className="w-3.5 h-3.5 bg-brand-yellow rotate-45 group-hover:scale-125 transition-transform" />
                    <span className="text-sm md:text-base font-mono uppercase tracking-wider font-bold text-gray-200 group-hover:text-brand-yellow transition-colors">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE TEAM SECTION */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          
          {/* Section Header */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center text-center mb-12"
          >
            <h2 className="bg-brand-yellow text-black px-8 md:px-14 py-4 md:py-6 text-3xl md:text-6xl font-black tracking-tighter uppercase rounded-2xl border-4 border-black shadow-[8px_8px_0px_#fff] mb-6">
              CORE MEMBERS
            </h2>
            <p className="text-gray-400 font-bold max-w-xl text-base md:text-lg">
              Meet the dynamic minds leading teams across Executive, Tech, CR, Management, Design, Media, PR, and Marketing.
            </p>
          </motion.div>

          {/* Search & Department Filter Tabs */}
          <div className="mb-12 space-y-6">
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, role, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border-2 border-white/30 focus:border-brand-yellow text-white pl-12 pr-4 py-3.5 rounded-full outline-none font-medium transition-all shadow-[4px_4px_0px_rgba(255,255,255,0.1)] focus:shadow-[6px_6px_0px_#FFB22C]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono uppercase bg-zinc-800 hover:bg-brand-yellow hover:text-black px-2.5 py-1 rounded-full transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-5xl mx-auto">
              {departments.map((dept) => {
                const isSelected = selectedDept === dept.id;
                const count = dept.id === 'all'
                  ? teamData.length
                  : teamData.filter(m => m.department === dept.id).length;

                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs md:text-sm font-bold uppercase transition-all duration-300 border-2 ${
                      isSelected
                        ? 'bg-brand-yellow text-black border-black shadow-[4px_4px_0px_#fff] scale-105'
                        : 'bg-zinc-900 text-gray-300 border-zinc-700 hover:border-white hover:text-white'
                    }`}
                  >
                    <dept.icon className="w-3.5 h-3.5" />
                    <span>{dept.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isSelected ? 'bg-black text-brand-yellow' : 'bg-zinc-800 text-gray-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-8 px-2 border-b border-zinc-800 pb-4">
            <div className="text-sm font-mono uppercase text-gray-400">
              Showing <span className="text-brand-yellow font-bold">{filteredMembers.length}</span> members
              {selectedDept !== 'all' && (
                <span> in <span className="text-white font-bold">{selectedDept}</span></span>
              )}
              {searchQuery && (
                <span> matching "<span className="text-brand-yellow font-bold">{searchQuery}</span>"</span>
              )}
            </div>
            {(selectedDept !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedDept('all');
                  setSearchQuery('');
                }}
                className="text-xs font-mono uppercase text-brand-yellow hover:underline flex items-center gap-1"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Members Grid */}
          {filteredMembers.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredMembers.map((member, index) => (
                  <MemberCard key={`${member.department}-${member.name}`} member={member} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-zinc-900/50 border-2 border-dashed border-zinc-700 rounded-3xl p-8">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white uppercase mb-2">No Members Found</h3>
              <p className="text-gray-400 mb-6">Try searching with a different keyword or resetting filters.</p>
              <button
                onClick={() => {
                  setSelectedDept('all');
                  setSearchQuery('');
                }}
                className="bg-brand-yellow text-black font-black font-mono uppercase px-6 py-3 rounded-full border-2 border-black shadow-[4px_4px_0px_#fff] hover:scale-105 transition-all"
              >
                Show All Members
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-16 md:py-24 bg-white text-black text-center relative overflow-hidden">
        <Marquee text="JOIN US " direction="right" speed={15} className="absolute top-4 opacity-20" />
        <Marquee text="BECOME A LEADER " direction="left" speed={25} className="absolute bottom-4 opacity-20" />

        <div className="container mx-auto relative z-10 px-4">
          <h2 className="text-5xl md:text-8xl font-black mb-8 md:mb-10 tracking-tighter">
            READY TO <span className="outline-text">LEAD?</span>
          </h2>
          <p className="text-lg md:text-2xl font-bold max-w-xl mx-auto mb-8 text-zinc-700">
            Be a part of the vibrant entrepreneurial ecosystem at DYPIU and shape tomorrow's innovators.
          </p>
          <Link to="/apply">
            <button className="text-xl md:text-3xl font-black bg-brand-yellow px-10 md:px-16 py-5 md:py-7 rounded-full border-4 border-black hover:bg-black hover:text-white hover:scale-105 transition-all duration-300 shadow-[6px_6px_0px_0px_#000] md:shadow-[10px_10px_0px_0px_#000]">
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

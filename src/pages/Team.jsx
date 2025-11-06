
import JoinInfoPopover from '../components/JoinInfoPopover';
import { motion } from 'framer-motion';
import { Mail, Users, Award, Star } from 'lucide-react';

// Core Team array (sample data, replace with actual team members as needed)
const coreTeam = [
  { name: 'YASH MARU', position: 'PRESIDENT', image: '/team/YASH MARU.jpeg', icon: Users },
  { name: 'PREET SONAR', position: 'VICE PRESIDENT', image: '/team/PREET SONAR.jpeg', icon: Users },
  { name: 'BHAVIKA DESHMUKH', position: 'DESIGN LEAD', image: '/team/BHAVIKA DESHMUKH.png', icon: Users },
  { name: 'PRERANA MAHAJAN', position: 'DESIGN CO-LEAD', image: '/team/PRERANA MAHAJAN.png', icon: Users },
  { name: 'D DISHA SHREE', position: 'GENERAL SECRETARY', image: '/team/DISHA SHREE.png', icon: Users },
  { name: 'HIMESH WANI', position: 'OPERATION LEAD', image: '/team/HIMESH WANI (2).png', icon: Users },
  { name: 'YASH PAWAR', position: 'PR LEAD', image: '/team/YASH PAWAR.jpeg', icon: Users },
  { name: 'PRANAV BATHEJA', position: 'MARKETING LEAD', image: '/team/PRANAV BHATEJA.jpeg', icon: Users },
  { name: 'RAM MITTAL', position: 'CORPORATE LEAD', image: '/team/RAM MITTAL.png', icon: Users },
  { name: 'RIGVED AHEARRAO', position: 'TECHNICAL LEAD', image: '/team/RIGVED AHEARRAO.png', icon: Users },
  { name: 'SHARWARI KHANDAIT', position: 'SOCIAL MEDIA LEAD', image: '/team/SHARWARI KHANDAIT.jpeg', icon: Users },
  { name: 'SHANTANU PATIL', position: 'TREASURY LEAD', image: '/team/SHANTANU PATIL.png', icon: Users },
];

const mentor = {
  name: 'Dr. Sandhya Ingale',
  position: 'Experienced Mentor',
  department: 'Faculty Advisor',
  bio: 'Distinguished academic and industry expert with extensive experience in entrepreneurship, innovation, and business development. Dr. Ingale brings valuable insights from her rich professional background to guide and mentor the E-Cell team.',
  achievements: [
    'Extensive experience in academic leadership',
    'Expert in business development and innovation',
    'Mentor to numerous successful entrepreneurs',
    'Published researcher in entrepreneurship studies'
  ]
};

const Team = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-blue-400 mb-4 tracking-widest font-mono text-sm">// OUR TEAM</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-space">
              Meet Our <span className="text-blue-400">Team</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 font-body">
              The passionate individuals driving innovation and entrepreneurship at DYPIU
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-lg px-6 py-4 rounded-lg">
                <div className="text-3xl font-bold text-white">13</div>
                <div className="text-blue-200">Core Team Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg px-6 py-4 rounded-lg">
                <div className="text-3xl font-bold text-white">9</div>
                <div className="text-blue-200">Leadership Roles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg px-6 py-4 rounded-lg">
                <div className="text-3xl font-bold text-white">1</div>
                <div className="text-blue-200">Experienced Mentor</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Experienced Mentor */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-blue-600 mb-4 tracking-widest font-mono text-sm font-bold">// EXPERIENCED MENTOR</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-space">
              Our <span className="text-blue-600">Mentor</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-body">
              Experienced guidance from distinguished academic and industry expert
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-12">
                <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
                  {/* Profile Image - Replace the src with actual image path when you add it */}
                  <div className="relative mb-6 md:mb-0 md:mr-8">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden">
                      <img
                        src="/SANDHYA INGLE.jpeg"
                        alt="Dr. Sandhya Ingale"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="text-center md:text-left flex-1 mt-4">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2 font-space">{mentor.name}</h3>
                    <p className="text-blue-600 font-semibold mb-2 text-xl font-space">{mentor.position}</p>
                    <p className="text-gray-600 mb-4 font-body text-lg">{mentor.department}</p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Academic Leader</span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">Innovation Expert</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Mentor</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <p className="text-gray-700 font-body leading-relaxed text-lg italic">"{mentor.bio}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4 font-space">Key Achievements</h4>
                    <div className="space-y-3">
                      {mentor.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <Award className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-700 font-body leading-relaxed">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4 font-space">Impact Areas</h4>
                    <div className="space-y-3">
                      <div className="text-gray-700 font-body">Entrepreneurship Development</div>
                      <div className="text-gray-700 font-body">Business Innovation</div>
                      <div className="text-gray-700 font-body">Academic Leadership</div>
                      <div className="text-gray-700 font-body">Student Mentorship</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-blue-600 mb-4 tracking-widest font-mono text-sm font-bold">// LEADERSHIP</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-space">
              Core <span className="text-blue-600">Team</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-body">
              The leadership team that guides our vision and drives our mission forward
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coreTeam.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-32 bg-gradient-primary flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 shadow-lg aspect-square flex items-center justify-center">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover aspect-square"
                        style={{ aspectRatio: '1/1' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <member.icon className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 font-space">{member.name}</h3>
                  <p className="text-blue-600 font-semibold text-sm font-space">{member.position}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-blue-400 mb-4 tracking-widest font-mono text-sm font-bold">// JOIN US</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-space">
              Want to Join Our Team?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto font-body">
              We're always looking for passionate individuals who want to make a difference.
              Join us and be part of something amazing!
            </p>
            <div className="flex justify-center">
              <JoinInfoPopover>
                <a
                  href="https://forms.gle/Jg2szi9CoK6sNbE97"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Apply Now — Join our mailing list"
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  Apply Now
                </a>
              </JoinInfoPopover>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Team;

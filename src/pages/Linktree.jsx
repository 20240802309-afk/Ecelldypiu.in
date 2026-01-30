import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Github, Twitter, Mail, Globe, Calendar, Users } from 'lucide-react';
import '../index.css';

// WhatsApp SVG Icon Component
const WhatsAppIcon = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const Linktree = () => {
  // Bio Data
  const bioData = {
    name: 'E-Cell DYPIU',
    username: '@ecell.dypiu',
    url: 'https://ecelldypiu.in',
    avatar: '/logonew.png',
    description: 'Entrepreneurship Cell at DY Patil International University',
    subdesc: 'Empowering the next generation of entrepreneurs and innovators',
  };

  // Social Links
  const socialLinks = [
    {
      title: 'Instagram',
      url: 'https://www.instagram.com/ecell.dypiu?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      icon: Instagram,
    },
    {
      title: 'LinkedIn',
      url: 'https://www.linkedin.com/company/ecell-dypiu/posts/?feedView=all',
      icon: Linkedin,
    },
    {
      title: 'WhatsApp',
      url: 'https://chat.whatsapp.com/LlZrAibpCEdBrnpDwrGaQT?mode=wwt',
      icon: WhatsAppIcon,
    },
  ];

  // Quick Links
  const quickLinks = [
    {
      title: 'Our Instagram',
      url: 'https://www.instagram.com/ecell.dypiu?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      icon: Instagram,
    },
    {
      title: 'Upcoming Events',
      url: 'https://ecelldypiu.in/events',
      icon: Calendar,
    },
    {
      title: 'Our LinkedIn',
      url: 'https://www.linkedin.com/company/ecell-dypiu/posts/?feedView=all',
      icon: Linkedin,
    },
    {
      title: 'WhatsApp Community',
      url: 'https://chat.whatsapp.com/LlZrAibpCEdBrnpDwrGaQT?mode=wwt',
      icon: WhatsAppIcon,
    },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Top Part */}
        <div style={styles.topPart}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.header}
          >
            {/* Avatar */}
            <div style={styles.avatarContainer}>
              <div style={styles.avatarWrapper}>
                <img
                  src={bioData.avatar}
                  alt={bioData.name}
                  style={styles.avatar}
                />
              </div>
            </div>

            {/* Title */}
            <div style={styles.title}>
              <h1 style={styles.titleName}>{bioData.name}</h1>
              <h3 style={styles.titleUsername}>
                <a href={bioData.url} style={styles.usernameLink}>{bioData.username}</a>
              </h3>
            </div>
          </motion.div>

          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={styles.bio}
          >
            <h1 style={styles.bioDescription}>{bioData.description}</h1>
            <h4 style={styles.bioSubdesc}>{bioData.subdesc}</h4>
          </motion.div>

          {/* Social Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={styles.socialSection}
          >
            <div style={styles.socialIconsContainer}>
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={styles.socialIconBox}
                  title={link.title}
                >
                  <link.icon size={24} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={styles.linksSection}
          >
            <h3 style={styles.sectionTitle}>QUICK LINKS</h3>
            {quickLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between transition-all group hover:bg-brand-yellow hover:border-brand-yellow hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,178,44,0.3)] my-2"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-center text-lg font-bold text-white group-hover:text-black transition-colors">
                  <link.icon size={22} className="mr-3 text-white group-hover:text-black transition-colors" />
                  {link.title}
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white group-hover:text-black transition-colors">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Bottom Part - Footer Removed */}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#000000',
    color: '#fff',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
    padding: '24px',
  },
  topPart: {
    width: '100%',
    maxWidth: '600px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '60px',
    marginBottom: '12px',
  },
  avatarContainer: {
    height: '110px',
    width: '110px',
    position: 'relative',
    marginBottom: '16px',
  },
  avatarWrapper: {
    height: '100%',
    width: '100%',
  },
  avatar: {
    height: '100%',
    width: '100%',
    borderRadius: '50%',
    objectFit: 'contain',
    border: '2px solid #333',
    backgroundColor: '#000',
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  titleName: {
    fontSize: '38px',
    fontWeight: '800',
    letterSpacing: '-2px',
    color: '#fff',
    marginBottom: '6px',
    textTransform: 'uppercase',
  },
  titleUsername: {
    marginTop: '6px',
    fontSize: '16px',
    fontWeight: '500',
    letterSpacing: '1px',
    color: '#FFB22C', // Brand Yellow
    fontFamily: '"JetBrains Mono", monospace',
    textTransform: 'uppercase',
  },
  usernameLink: {
    color: '#FFB22C',
    textDecoration: 'none',
  },
  bio: {
    display: 'flex',
    flexDirection: 'column',
    margin: '24px 0',
  },
  bioDescription: {
    fontSize: '20px',
    lineHeight: '28px',
    fontWeight: '500',
    letterSpacing: '-0.5px',
    padding: '0 20px',
    marginBottom: '10px',
    color: '#e5e5e5',
  },
  bioSubdesc: {
    fontSize: '16px',
    letterSpacing: '0px',
    margin: '5px 0',
    opacity: '0.6',
    fontWeight: '400',
  },
  socialSection: {
    padding: '12px 0',
    marginBottom: '18px',
  },
  socialIconsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  socialIconBox: {
    padding: '12px',
    borderRadius: '50%',
    border: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#111',
    color: '#fff',
    textDecoration: 'none',
  },
  linksSection: {
    padding: '12px 0',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '500px',
    margin: '0 auto',
    width: '100%',
  },
  sectionTitle: {
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '4px',
    marginBottom: '20px',
    color: '#666',
    fontWeight: '700',
  },
};

export default Linktree;

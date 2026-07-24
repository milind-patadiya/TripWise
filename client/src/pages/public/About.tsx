import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Globe2, ShieldCheck, HeartHandshake, Zap, MapPin, Users, Award, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

// ─── Animated Number Hook ─────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  useEffect(() => {
    if (isInView && ref.current) {
      const start = 0;
      const end = value;
      const duration = 2000;
      const startTime = performance.now();

      const updateCounter = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function (easeOutExpo)
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(start + (end - start) * easeProgress);
        
        if (ref.current) {
          ref.current.textContent = current.toLocaleString('en-US') + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };
      requestAnimationFrame(updateCounter);
    }
  }, [isInView, value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const VALUES = [
  { icon: Globe2, title: 'Explore the Unexplored', desc: 'We bring you destinations that go beyond the ordinary tourist traps, curated by experts.' },
  { icon: Zap, title: 'Powered by AI', desc: 'Our enterprise-grade AI ensures your itineraries are hyper-personalized and realistic.' },
  { icon: ShieldCheck, title: 'Trust & Safety', desc: 'From real-time advisories to verified reviews, your safety is baked into our platform.' },
  { icon: HeartHandshake, title: 'Sustainable Travel', desc: 'We promote eco-friendly stays and local experiences that give back to the community.' }
];

const TIMELINE = [
  { year: '2020', title: 'The Inception', desc: 'TripWise was founded in a small garage with a big dream: fixing broken travel planning.' },
  { year: '2022', title: 'Global Expansion', desc: 'Expanded our reach to over 50 countries, partnering with 10,000+ premium hotels.' },
  { year: '2024', title: 'AI Revolution', desc: 'Integrated state-of-the-art Gemini AI to automate dynamic itinerary generation.' },
  { year: '2026', title: 'Market Leaders', desc: 'Serving millions of happy travelers worldwide as the #1 next-gen travel platform.' },
];

const TEAM = [
  { name: 'Milind Patadiya', role: 'Backend Developer & Database Engineer', image: '/team/milind.png' },
  { name: 'Shyam Nakum', role: 'UI/UX Designer & User Experience Specialist', image: '/team/shyam.png' },
  { name: 'Prashant Vala', role: 'Frontend Developer & Interface Designer', image: '/team/prashant.png' },
];

export default function About() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000" 
            alt="About us hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60" />
        </motion.div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-6 tracking-tight">
              Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Travel</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 font-medium">
              We combine human expertise with artificial intelligence to create unforgettable journeys.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── CORE FEATURES (Replaced Dummy Stats) ──────────────────────── */}
      <div className="relative z-20 -mt-20 container mx-auto px-4 md:px-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100 dark:divide-slate-800">
          <div className="text-center px-4">
            <Zap className="mx-auto text-indigo-500 mb-4" size={32} />
            <div className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              AI Trip Planner
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Powered by Gemini</div>
          </div>
          <div className="text-center px-4">
            <MapPin className="mx-auto text-indigo-500 mb-4" size={32} />
            <div className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Curated Places
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Handpicked Stays</div>
          </div>
          <div className="text-center px-4">
            <HeartHandshake className="mx-auto text-indigo-500 mb-4" size={32} />
            <div className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Seamless UI
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Intuitive Design</div>
          </div>
          <div className="text-center px-4">
            <ShieldCheck className="mx-auto text-indigo-500 mb-4" size={32} />
            <div className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Secure System
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Robust Backend</div>
          </div>
        </div>
      </div>

      {/* ── MISSION & VALUES ───────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-6 py-32">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Our Mission</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            We believe travel planning shouldn't feel like a chore. By leveraging cutting-edge AI and a curated network of global partners, we aim to make discovering, planning, and booking your next adventure seamless, personalized, and deeply inspiring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {VALUES.map((val, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <val.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{val.title}</h3>
              <p className="text-slate-500 leading-relaxed">
                {val.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── OUR STORY ──────────────────────────────────────────────────── */}
      <div className="bg-indigo-50 dark:bg-slate-900/50 py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Our Story</h2>
              <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="space-y-8 text-lg text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
              <p>
                TripWise was born out of a shared passion for technology and a common frustration with how chaotic travel planning can be. As a team of three dedicated developers, we realized that the modern traveler spends too much time juggling multiple tabs, spreadsheets, and booking platforms. We wanted to build something better.
              </p>
              <p>
                Combining our strengths, we set out to create a comprehensive, intelligent travel companion. <strong>Milind</strong> engineered a robust and secure backend database architecture to ensure every booking and user profile is safe. <strong>Shyam</strong> meticulously designed the user experience, ensuring that from the moment you land on the site, everything feels intuitive, beautiful, and completely stress-free. Finally, <strong>Prashant</strong> brought those designs to life through clean, responsive, and dynamic frontend code that makes the platform incredibly fast and interactive.
              </p>
              <p>
                Together, we integrated advanced AI capabilities and real-world tools into a single platform. We are incredibly proud of TripWise—it represents our dedication, our teamwork, and our vision for the future of travel planning.
              </p>
            </div>
            
            {/* Timeline */}
            <div className="mt-20">
              <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-12">Our Journey</h3>
              <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900/50 ml-4 md:ml-1/2 md:translate-x-[-1px] space-y-12">
                {TIMELINE.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`relative pl-8 md:pl-0 ${i % 2 === 0 ? 'md:pr-12 md:text-right md:mr-auto' : 'md:pl-12 md:ml-auto'} md:w-1/2`}
                  >
                    <div className="absolute top-1 left-[-25px] md:left-auto md:right-[-25px] w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900 shadow-lg z-10" 
                         style={{ ...(i % 2 !== 0 && { right: 'auto', left: '-25px' }) }} />
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow">
                      <span className="text-indigo-600 font-bold text-sm mb-1 block">{item.year}</span>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TEAM ───────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Meet the Leadership</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">The minds behind the magic of TripWise.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TEAM.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group text-center bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl h-full border border-slate-100 dark:border-slate-800">
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden border-4 border-indigo-50 dark:border-slate-800 shadow-inner">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    onError={(e) => {
                      // Fallback to a nice avatar if the image is missing
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=4f46e5&color=fff&size=200`;
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{member.name}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium px-4">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <div className="bg-indigo-600 py-24 text-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to start your journey?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/destinations">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 font-bold px-8 h-14 rounded-2xl w-full sm:w-auto text-lg shadow-xl">
                Explore Destinations
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-8 h-14 rounded-2xl w-full sm:w-auto text-lg">
                Create an Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

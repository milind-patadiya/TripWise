import { motion } from 'framer-motion';
import { PlaneTakeoff } from 'lucide-react';

const brandText = 'TripWise';

const letterVariants: any = {
  hidden: { opacity: 0, y: 20, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: 0.5 + i * 0.07,
      duration: 0.5,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
};

// Floating dot positions (simulating world destinations)
const FLOATING_DOTS = [
  { x: '15%', y: '20%', size: 4, delay: 0.2 },
  { x: '80%', y: '15%', size: 3, delay: 0.5 },
  { x: '10%', y: '75%', size: 5, delay: 0.8 },
  { x: '85%', y: '70%', size: 3, delay: 0.3 },
  { x: '25%', y: '45%', size: 4, delay: 0.6 },
  { x: '70%', y: '40%', size: 3, delay: 0.9 },
  { x: '50%', y: '85%', size: 4, delay: 0.4 },
  { x: '35%', y: '12%', size: 3, delay: 0.7 },
  { x: '90%', y: '45%', size: 5, delay: 1.0 },
  { x: '60%', y: '25%', size: 3, delay: 0.35 },
];

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 40%, #e0e7ff 70%, #f8fafc 100%)' }}
    >
      {/* Animated background gradient overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(79,70,229,0.06) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating destination dots */}
      {FLOATING_DOTS.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-indigo-400"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.4, 0.15, 0.4, 0],
            scale: [0, 1, 1.2, 1, 0],
            y: [0, -8, 0, 8, 0],
          }}
          transition={{
            duration: 3.5,
            delay: dot.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle connecting lines between dots */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
        <motion.line x1="15%" y1="20%" x2="25%" y2="45%" stroke="#4f46e5" strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5 }} />
        <motion.line x1="80%" y1="15%" x2="70%" y2="40%" stroke="#4f46e5" strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.7 }} />
        <motion.line x1="25%" y1="45%" x2="50%" y2="50%" stroke="#4f46e5" strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.9 }} />
        <motion.line x1="70%" y1="40%" x2="50%" y2="50%" stroke="#4f46e5" strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1.1 }} />
      </svg>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Orbital rings around logo */}
        <div className="relative mb-8">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              width: 120,
              height: 120,
              top: -20,
              left: -20,
              border: '1px solid rgba(79,70,229,0.1)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-indigo-500"
              style={{ top: -4, left: '50%', marginLeft: -4 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Middle ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 100,
              height: 100,
              top: -10,
              left: -10,
              border: '1px solid rgba(245,158,11,0.15)',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <motion.div
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-400"
              style={{ top: -3, left: '50%', marginLeft: -3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Logo icon container */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 180,
              damping: 18,
              duration: 0.8,
            }}
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)',
              boxShadow: '0 8px 32px rgba(79,70,229,0.25), 0 0 0 1px rgba(79,70,229,0.1)',
            }}
          >
            {/* Shine effect on logo */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, delay: 0.8, repeat: Infinity, repeatDelay: 3 }}
            />
            <motion.div
              initial={{ x: -24, y: 24, opacity: 0, rotate: -15 }}
              animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 14,
                delay: 0.3,
              }}
            >
              <PlaneTakeoff size={36} className="text-white" strokeWidth={2} />
            </motion.div>
          </motion.div>
        </div>

        {/* Brand name with 3D letter reveal */}
        <div className="flex items-center gap-0.5 mb-3 overflow-hidden" style={{ perspective: '600px' }}>
          {brandText.split('').map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="text-4xl font-extrabold tracking-tight"
              style={{
                display: 'inline-block',
                background: i < 4
                  ? 'linear-gradient(135deg, #312e81, #4f46e5)'
                  : 'linear-gradient(135deg, #d97706, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Tagline with subtle fade */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6, ease: 'easeOut' }}
          className="text-slate-400 text-sm font-medium tracking-widest uppercase"
        >
          Your Journey, Simplified
        </motion.p>

        {/* Premium loading bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="mt-10 w-52 h-[3px] rounded-full overflow-hidden relative"
          style={{ background: 'rgba(79,70,229,0.08)' }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width: '40%',
              background: 'linear-gradient(90deg, #4f46e5, #f59e0b)',
            }}
            animate={{
              x: ['-100%', '280%'],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

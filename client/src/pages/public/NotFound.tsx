import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg relative z-10"
      >
        <motion.div 
          animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="text-9xl font-extrabold text-indigo-100 dark:text-indigo-900/30 mb-8 flex justify-center"
        >
          <Compass size={120} className="text-indigo-500 opacity-80" strokeWidth={1} />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Oops! Looks like you're lost.
        </h1>
        <p className="text-slate-500 mb-10">
          The page you are looking for doesn't exist or has been moved. 
          Let's get you back on track to your next adventure.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold px-8">
              <Home size={18} /> Back to Home
            </Button>
          </Link>
          <Link to="/destinations">
            <Button size="lg" variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold px-8 bg-white dark:bg-slate-900">
              <MapPin size={18} /> Destinations
            </Button>
          </Link>
          <Link to="/packages">
            <Button size="lg" variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold px-8 bg-white dark:bg-slate-900">
              <Compass size={18} /> Packages
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <div className="text-9xl font-extrabold text-indigo-100 dark:text-indigo-900/30 mb-8">
          404
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Oops! Looks like you're lost.
        </h1>
        <p className="text-slate-500 mb-10">
          The page you are looking for doesn't exist or has been moved. 
          Let's get you back on track to your next adventure.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            <Home size={18} />
            Back to Home
          </Link>
          <Link
            to="/destinations"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
          >
            <MapPin size={18} />
            Explore Destinations
          </Link>
          <Link
            to="/packages"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
          >
            <Compass size={18} />
            View Packages
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

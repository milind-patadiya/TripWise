import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, CreditCard, ChevronRight, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';

interface BookingDraft {
  itemType: 'Destination' | 'Package' | 'Hotel';
  itemId: string;
  itemName: string;
  itemImage?: string;
  destinationName: string;
  checkIn: string;
  checkOut?: string;
  travelers: number;
  baseFare: number;
  taxesAndFees: number;
  discount: number;
  totalAmount: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const draft = location.state as BookingDraft | null;

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // Payment fields (mock — no real payment processor wired up)
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (!draft) {
      // Nothing to book — nothing was selected from a Destination/Package/Hotel page
      navigate('/destinations', { replace: true });
    }
  }, [draft, navigate]);

  if (!draft) return null;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError('Please enter a valid email address.');
    }
    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      return setError('Phone number must be exactly 10 digits.');
    }
    
    setStep(2);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const rawCard = cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(rawCard)) {
      return setError('Card number must be exactly 16 digits.');
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      return setError('Expiry date must be in MM/YY format.');
    }
    const [month, year] = expiry.split('/');
    const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expDate < new Date()) {
      return setError('Card has expired.');
    }

    if (!/^\d{3}$/.test(cvv)) {
      return setError('CVV must be exactly 3 digits.');
    }

    setIsProcessing(true);

    try {
      const res = await api.post('/bookings', {
        itemType: draft.itemType,
        itemId: draft.itemId,
        itemName: draft.itemName,
        itemImage: draft.itemImage,
        destinationName: draft.destinationName,
        checkIn: draft.checkIn,
        checkOut: draft.checkOut,
        travelers: draft.travelers,
        travelerDetails: { firstName, lastName, email, phone },
        baseFare: draft.baseFare,
        taxesAndFees: draft.taxesAndFees,
        discount: draft.discount,
      });
      setConfirmedBooking(res.data);
      queryClient.invalidateQueries({ queryKey: ['my_bookings'] });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto max-w-6xl px-4">

        {/* Progress Header */}
        <div className="mb-8 flex justify-center items-center max-w-2xl mx-auto relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 rounded-full -z-10 transition-all duration-500"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />
          <div className="w-full flex justify-between">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
          </div>
        </div>

        {step === 3 && confirmedBooking ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-xl border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Booking Confirmed!</h1>
            <p className="text-slate-500 mb-8 text-lg">
              Your {draft.itemType.toLowerCase()} booking for <span className="font-semibold text-slate-700 dark:text-slate-300">{draft.itemName}</span> is confirmed.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-8 text-left space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Booking Ref</p>
                <p className="font-bold text-slate-900 dark:text-white">{confirmedBooking.bookingRef}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Destination</p>
                <p className="font-semibold text-slate-900 dark:text-white">{draft.destinationName}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Check-in</p>
                <p className="font-semibold text-slate-900 dark:text-white">{new Date(draft.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              {draft.checkOut && (
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Check-out</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{new Date(draft.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">Total Paid</p>
                <p className="font-bold text-indigo-600 text-xl">₹{draft.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {confirmedBooking.itinerary && confirmedBooking.itinerary.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-8 text-left max-h-96 overflow-y-auto custom-scrollbar">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Your Day-by-Day Itinerary</h3>
                <div className="space-y-6">
                  {confirmedBooking.itinerary.map((day: any) => (
                    <div key={day.day} className="relative pl-6 border-l-2 border-indigo-200 dark:border-indigo-900/50">
                      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full -left-[7px] top-1.5" />
                      <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">Day {day.day}: {day.theme}</h4>
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <p><strong className="text-slate-900 dark:text-white">Morning:</strong> {day.morning}</p>
                        <p><strong className="text-slate-900 dark:text-white">Afternoon:</strong> {day.afternoon}</p>
                        <p><strong className="text-slate-900 dark:text-white">Evening:</strong> {day.evening}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => navigate('/dashboard/trips')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-xl font-bold text-lg">
              View My Bookings
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl p-4 flex items-center gap-3 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Traveler Details</h2>
                  <form className="space-y-6" onSubmit={handleDetailsSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                        <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                        <input required value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                      <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                      <input required value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
                    </div>
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl gap-2 mt-4 text-lg">
                      Continue to Payment <ChevronRight size={18} />
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Lock size={24} className="text-emerald-500" /> Secure Payment
                  </h2>
                  <form className="space-y-6" onSubmit={handlePayment}>
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 flex items-center gap-3 mb-6">
                      <ShieldCheck size={24} className="text-indigo-600" />
                      <p className="text-sm text-indigo-900 dark:text-indigo-300 font-medium">Demo payment — no real card is charged. Your booking is still saved for real.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Card Number</label>
                      <div className="relative">
                        <CreditCard size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Expiry Date</label>
                        <input required value={expiry} onChange={(e) => setExpiry(e.target.value)} type="text" placeholder="MM/YY" maxLength={5} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">CVV</label>
                        <input required value={cvv} onChange={(e) => setCvv(e.target.value)} type="password" placeholder="123" maxLength={3} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl gap-2 mt-4 text-lg">
                      {isProcessing ? 'Processing...' : `Pay ₹${draft.totalAmount.toLocaleString('en-IN')} Securely`}
                    </Button>
                  </form>
                </motion.div>
              )}
            </div>

            {/* Right Column: Order Summary — real data */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-28">
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  {draft.itemImage && (
                    <img src={draft.itemImage} alt={draft.itemName} className="w-16 h-16 rounded-xl object-cover" />
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                      {draft.itemType}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight mt-1">{draft.itemName}</h3>
                    <p className="text-xs text-slate-500">{draft.destinationName}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      {draft.itemType === 'Hotel' ? 'Check-in / Check-out' : 'Travel Date'}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right">
                      {new Date(draft.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {draft.checkOut && ` – ${new Date(draft.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Travelers</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{draft.travelers}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Base Fare</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{draft.baseFare.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Taxes & Fees</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{draft.taxesAndFees.toLocaleString('en-IN')}</span>
                  </div>
                  {draft.discount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-600">Discount Applied</span>
                      <span className="font-semibold text-emerald-600">-₹{draft.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                  <span className="font-bold text-indigo-600 text-2xl">₹{draft.totalAmount.toLocaleString('en-IN')}</span>
                </div>

                <p className="text-xs text-slate-400 mt-4 text-center">
                  By continuing, you agree to our <Link to="/about" className="underline">Terms & Conditions</Link>.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

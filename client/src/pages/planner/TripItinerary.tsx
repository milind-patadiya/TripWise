import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { CheckCircle2, Navigation, Coffee, Sun, Moon, Calendar, MapPin, Wallet, ArrowLeft, Download, Share2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { generateItineraryPdf } from '@/utils/generatePdf';
import InteractiveMap from '@/components/planner/InteractiveMap';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function TripItinerary() {
  const navigate = useNavigate();
  const [plannerData] = useState<any>(() => {
    const raw = localStorage.getItem('trip_planner_data');
    return raw ? JSON.parse(raw) : null;
  });
  const [itinerary, setItinerary] = useState<any>(null);
  const [allLocations, setAllLocations] = useState<any[]>([]);

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/ai/plan-trip', data);
      return res.data.itinerary;
    },
    onSuccess: (data) => {
      setItinerary(data);
      toast.success('Itinerary generated successfully!');
      
      // Extract locations for the map
      const locs: any[] = [];
      data.days?.forEach((d: any) => {
        if (d.locations) {
          d.locations.forEach((l: any) => {
            locs.push({ ...l, day: d.day });
          });
        }
      });
      setAllLocations(locs);
    },
    onError: () => {
      toast.error('Failed to generate itinerary. Please try again.');
      navigate('/planner/setup');
    }
  });

  useEffect(() => {
    if (plannerData) {
      generateMutation.mutate(plannerData);
      localStorage.removeItem('trip_planner_data');
    } else {
      navigate('/planner/setup');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(itinerary.days);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update day numbers
    const updatedItems = items.map((item: any, index: number) => ({
      ...item,
      day: index + 1
    }));
    
    setItinerary({ ...itinerary, days: updatedItems });
    
    // Update map locations
    const locs: any[] = [];
    updatedItems.forEach((d: any) => {
      if (d.locations) {
        d.locations.forEach((l: any) => {
          locs.push({ ...l, day: d.day });
        });
      }
    });
    setAllLocations(locs);
  };

  if (generateMutation.isPending) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 relative mb-8">
          <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full animate-ping" />
          <div className="absolute inset-2 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
          <Navigation className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Crafting your perfect trip...</h2>
        <p className="text-slate-500 text-center max-w-md">Our AI is analyzing thousands of data points to create a personalized itinerary for {plannerData?.destination}.</p>
      </div>
    );
  }

  if (!itinerary) return null;

  const totalBudget = itinerary.totalEstimatedCost || Object.values(itinerary.budgetBreakdown).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/planner/setup')} className="gap-2">
            <ArrowLeft size={16} /> Back to Planner
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2 bg-white dark:bg-slate-900">
              <Share2 size={16} /> Share
            </Button>
            <Button className="gap-2 bg-indigo-600 text-white" onClick={() => generateItineraryPdf(plannerData, itinerary)}>
              <Download size={16} /> Export PDF
            </Button>
            <Button 
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20" 
              onClick={async () => {
                try {
                  const payload = {
                    title: `My AI Trip to ${plannerData.destination}`,
                    source: plannerData.source || 'Home',
                    destination: plannerData.destination,
                    budget: Object.values(itinerary.budgetBreakdown).reduce((a: any, b: any) => a + b, 0),
                    days: plannerData.days,
                    travelers: plannerData.travelers,
                    travelStyle: 'Adventure', 
                    travelerType: 'Couple',
                    status: 'planned',
                    packingList: itinerary.packingList,
                  };
                  await api.post('/trips', payload);
                  toast.success('Itinerary saved to Dashboard!');
                } catch (err) {
                  toast.error('Failed to save itinerary.');
                }
              }}
            >
              <CheckCircle2 size={16} /> Save Itinerary
            </Button>
          </div>
        </div>

        {/* Hero Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            Your {plannerData?.days}-Day Adventure in <span className="text-indigo-600">{plannerData?.destination}</span>
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center"><Calendar size={20} /></div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Duration</p>
                <p className="font-bold text-slate-900 dark:text-white">{plannerData?.days} Days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center"><MapPin size={20} /></div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Destination</p>
                <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{plannerData?.destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center"><Wallet size={20} /></div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Est. Budget</p>
                <p className="font-bold text-slate-900 dark:text-white">₹{totalBudget.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center"><CheckCircle2 size={20} /></div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Style</p>
                <p className="font-bold text-slate-900 dark:text-white">{plannerData?.budget}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Itinerary Timeline (Left, draggable) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Day-by-Day Itinerary</h2>
            <p className="text-sm text-slate-500 mb-4">Drag and drop to reorder your days.</p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="itinerary-days">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {itinerary.days.map((day: any, idx: number) => (
                      <Draggable key={`day-${day.day}-${idx}`} draggableId={`day-${day.day}-${idx}`} index={idx}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-6 rounded-2xl border ${snapshot.isDragging ? 'bg-indigo-50 border-indigo-200 shadow-xl dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'} transition-all`}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing">
                                <GripVertical size={20} />
                              </div>
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 font-bold shrink-0">
                                {day.day}
                              </div>
                              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{day.theme}</h3>
                            </div>
                            
                            <div className="space-y-4 pl-12 border-l-2 border-slate-100 dark:border-slate-800 ml-4">
                              {day.schedule && day.schedule.map((item: any, i: number) => (
                                <div key={i} className="relative">
                                  <div className="absolute -left-[25px] top-1 bg-white dark:bg-slate-900 p-1 rounded-full">
                                    {item.time.toLowerCase() === 'morning' ? <Coffee className="text-amber-500" size={14} /> : 
                                     item.time.toLowerCase() === 'afternoon' ? <Sun className="text-orange-500" size={14} /> : 
                                     <Moon className="text-indigo-500" size={14} />}
                                  </div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.time}</p>
                                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{item.location}</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.activity}</p>
                                </div>
                              ))}
                              
                              {/* Fallback for old schema */}
                              {day.morning && (
                                <>
                                  <div className="relative">
                                    <div className="absolute -left-[25px] top-1 bg-white dark:bg-slate-900 p-1 rounded-full"><Coffee className="text-amber-500" size={14} /></div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Morning</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{day.morning}</p>
                                  </div>
                                  <div className="relative">
                                    <div className="absolute -left-[25px] top-1 bg-white dark:bg-slate-900 p-1 rounded-full"><Sun className="text-orange-500" size={14} /></div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Afternoon</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{day.afternoon}</p>
                                  </div>
                                  <div className="relative">
                                    <div className="absolute -left-[25px] top-1 bg-white dark:bg-slate-900 p-1 rounded-full"><Moon className="text-indigo-500" size={14} /></div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Evening</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{day.evening}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Interactive Map (Right Sticky) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="h-[500px] lg:h-[calc(100vh-140px)] sticky top-24">
              <InteractiveMap locations={allLocations} />
            </div>

            {itinerary.hotels && itinerary.hotels.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recommended Hotels</h3>
                <div className="space-y-4">
                  {itinerary.hotels.map((hotel: any, i: number) => (
                    <div key={i} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{hotel.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{hotel.description}</p>
                        <p className="text-xs font-bold text-amber-500 mt-1">★ {hotel.rating}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">₹{hotel.pricePerNight}</div>
                        <div className="text-xs text-slate-400">/ night</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {itinerary.transportRecommendations && itinerary.transportRecommendations.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Transport Advice</h3>
                <ul className="space-y-2">
                  {itinerary.transportRecommendations.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Navigation size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {itinerary.packingList && itinerary.packingList.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Packing Checklist</h3>
                  {itinerary.weatherSummary && (
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-3 py-1 rounded-full">{itinerary.weatherSummary}</span>
                  )}
                </div>
                <ul className="space-y-2">
                  {itinerary.packingList.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

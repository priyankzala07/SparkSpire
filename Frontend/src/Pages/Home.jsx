import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../Utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaRegClock, FaTicketAlt, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const search = searchParams.get('search') || '';

     const fetchEvents = useCallback(async () => {
        try {
            const { data } = await api.get(`/events?search=${search}`);
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 400); // 400ms debounce
        return () => clearTimeout(timeoutId);
    }, [fetchEvents]);

   

    return (
        <div className=" home flex flex-col min-h-screen ">
            {/* Hero Section */}
            <div className="relative bg-black text-white rounded-3xl overflow-hidden mb-12 shadow-2xl">
                <div className="absolute inset-0 opacity-100 bg-[url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/8 to-transparent"></div>
                <div className="relative p-10 md:p-20 text-center flex flex-col items-center z-10">
                    <span className="bg-transparent font-black text-white backdrop-blur-xl px-4 py-1.5 rounded-full text-xs font-bold tracking-widest  mb-6 border border-white/20">Welcome To SparkSpire</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg">
                        Find Your Next <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-green-100">Unforgettable</span> Experience
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover the best tech conferences, late-night music festivals, and hands-on workshops happening directly in your area. Secure your spot today.
                    </p>

                </div>
            </div>

            {/* Why Choose Us / Features row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
                <div className="bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-700 flex flex-col items-center text-center hover:-translate-y-4 hover:scale-110 transition duration-300">
                    <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-slate-950/50">
                        <FaRegClock />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Fast Booking</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Secure your tickets instantly with our fast streamlined booking infrastructure built for speed.</p>
                </div>
                <div className="bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-700 flex flex-col items-center text-center hover:-translate-y-4 hover:scale-110 transition duration-300">
                    <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-slate-950/50">
                        <FaTicketAlt />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Seamless Access</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Download tickets instantly or manage them right from your personal dashboard with easily.</p>
                </div>
                <div className="bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-700 flex flex-col items-center text-center hover:-translate-y-4 hover:scale-110 transition duration-300">
                    <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-slate-950/50">
                        <FaShieldAlt />
                    </div>
                    <h3 className="text-xl  font-bold text-white mb-3">Secure Platform</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">All transactions and registrations are bounded by cutting-edge security and 2FA OTP tech.</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8 px-2 border-b border-slate-700 pb-4">
                <h2 className="text-3xl font-extrabold text-white">Upcoming Events</h2>
                <div className="text-slate-400 font-medium">{events.length} results found</div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-xl font-semibold text-slate-400">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-xl text-slate-400">No events found matching your search.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <div key={event._id} className="bg-slate-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col">
                            <div className="h48 bg-slate-800 overflow-hidden relative">
                                {event.image ? (
                                    <img src={`${event.image}?tr=w-full,h-full`} loading='lazy' alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 font-bold text-2xl">
                                        {event.category || 'Event'}
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                    {event.ticketPrice === 0 ? <span className="text-green-600">FREE</span> : <span className="text-white">₹{event.ticketPrice}</span>}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow ">
                                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{event.category}</div>
                                <h2 className="text-xl font-bold text-slate-100 mb-3">{event.title}</h2>
                                <div className="flex flex-col gap-2 mb-4 text-slate-400 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className="text-slate-400" />
                                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-slate-400" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                                        <div className="bg-slate-700 h-2 rounded-full" style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4">Available Seats: {event.availableSeats}</p>
                                    <Link to={`/events/${event._id}`} className="block w-full text-center bg-slate-800 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg transition">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <footer className="mt-auto pt-16 pb-8 border-t border-slate-700 text-center">
                <div  className="flex justify-center items-center gap-2 mb-4">
              <Link
            to="/"
            className="transition-transform duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg transition-all duration-300 hover:rotate-6 hover:scale-110 hover:shadow-2xl">
                <span className="text-white text-2xl">🎟️</span>
              </div>

              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  SparkSpire
                </h1>

                <p className="text-xs text-slate-400">
                  Discover Amazing Events
                </p>
              </div>

            </div>
          </Link></div>
                <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                    The simplest, most dynamic way to manage, discover, and host world-class events in your local city. Let's make memories together.
                </p>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    &copy; {new Date().getFullYear()} SparkSpire Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;

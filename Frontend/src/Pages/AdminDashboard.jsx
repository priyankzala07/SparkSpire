import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Context/AuthContextValue';
import api from '../Utils/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submittingEvent, setSubmittingEvent] = useState(false);
    const [updatingBookingId, setUpdatingBookingId] = useState(null);

    const [showEventForm, setShowEventForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: ''
    });
        
     const fetchData = async () => {
        try {
            const [eventsRes, bookingsRes] = await Promise.all([
        api.get('/events'),
        api.get('/bookings/my')
        ]);

        setEvents(eventsRes.data);
        setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

   

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setSubmittingEvent(true);

        try {
            let image = '';

            if (imageFile) {
            const uploadData = new FormData();
            uploadData.append('image', imageFile);

            const uploadRes = await api.post('/events/upload-image', uploadData);
            image = uploadRes.data.image;
            }

            await api.post('/events', { ...formData, image });
            setShowEventForm(false);
            setImageFile(null);
            setFormData({
                title: '', description: '', date: '', location: '', category: '',
                totalSeats: '', ticketPrice: '', image: ''
            });
            await fetchData();
        } catch (error) {
            console.error('Create event error:', error.response?.data || error);
            alert(error.response?.data?.error || error.response?.data?.message || 'Error creating event');
        } finally {
            setSubmittingEvent(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || error.response?.data?.error || 'Error deleting event');
            }
        }
    };

    const handleConfirmBooking = async (id, paymentStatus) => {
        try {
            setUpdatingBookingId(id);
            const { data } = await api.put(`/bookings/${id}/confirm`, { paymentStatus });
            const confirmedBooking = data.booking;

            // Use the API response so the status and dashboard totals change immediately.
            setBookings(currentBookings => currentBookings.map(booking =>
                booking._id === id ? confirmedBooking : booking
            ));
            setEvents(currentEvents => currentEvents.map(event =>
                event._id === confirmedBooking.eventId?._id
                    ? { ...event, availableSeats: confirmedBooking.eventId.availableSeats }
                    : event
            ));
        } catch (error) {
            alert(error.response?.data?.message || 'Error confirming booking');
        } finally {
            setUpdatingBookingId(null);
        }
    };

    const handleCancelBooking = async (id) => {
        if (window.confirm('Cancel this user\'s booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading admin panel...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-black text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Zala's Dashboard</h1>
                    <p className="text-slate-400">Manage events and manually confirm bookings.</p>
                </div>
                <button
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="w-full md:w-auto bg-slate-900 text-black font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition shadow-md"
                >
                    {showEventForm ? 'Cancel Creation' : '+ Create New Event'}
                </button>
            </div>

            {/* Admin Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-700 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-black text-green-600">₹{bookings.reduce((sum, b) => b.paymentStatus === 'paid' && b.status === 'confirmed' ? sum + b.amount : sum, 0)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-xl font-bold">₹</div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-700 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Paid Clients</p>
                        <h3 className="text-3xl font-black text-blue-600">{new Set(bookings.filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed').map(b => b.userId?._id)).size}</h3>
                    </div>
                    <div className="w-12 h-12 bg-sky-950/20 text-blue-500 rounded-full flex items-center justify-center text-xl font-bold">👤</div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-700 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Pending Requests</p>
                        <h3 className="text-3xl font-black text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-950/30 text-yellow-600 rounded-full flex items-center justify-center text-xl font-bold">⏳</div>
                </div>
            </div>

            {showEventForm && (
                <div className="bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-700 mb-8 animation-slideDown">
                    <h2 className="text-2xl font-bold mb-6 text-slate-100">Create New Event</h2>
                    <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input required type="text" placeholder="Event Title" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <input required type="text" placeholder="Category (e.g., Tech, Music)" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        <input required type="date" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        <input required type="text" placeholder="Location" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                        <input required type="number" placeholder="Total Seats" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition" value={formData.totalSeats} onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} />
                        <input required type="number" placeholder="Ticket Price (0 for free)" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition" value={formData.ticketPrice} onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })} />

                        <div className="md:col-span-2">
                            <input required type="file" className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition" accept="image/*" onChange={(e) => setImageFile(e.target.files[0] || null)} />
                        </div>

                        <textarea required placeholder="Event Description" className="border px-4 py-3 rounded-lg md:col-span-2 h-32 focus:ring-2 focus:ring-slate-500 outline-none transition" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        <button type="submit" disabled={submittingEvent} className="md:col-span-2 bg-slate-950 text-white font-bold py-3 mt-2 rounded-lg hover:bg-black transition shadow-md disabled:cursor-not-allowed disabled:opacity-60">
                            {submittingEvent ? 'Publishing...' : 'Publish Event'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-x-scroll" id='delete'>
                {/* Events Section */}
                <div className="flex flex-col" id="delete">
                    <h2 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 text-sm">{events.length}</span>
                        All Events
                    </h2>
                    <div  className=" bg-slate-900 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
                        <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {events.length === 0 ? <li className="p-6 text-slate-400 text-center">No events created yet.</li> :
                                events.map(event => (
                                    <li key={event._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-950 transition border-b border-slate-700 last:border-0">
                                        <div>
                                            <h4 className="font-bold text-white mb-1 leading-tight">{event.title}</h4>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                                <span className="flex items-center gap-1 font-medium"><div className="w-2 h-2 rounded-full bg-blue-500"></div> {new Date(event.date).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1 font-medium"><div className={`w-2 h-2 rounded-full ${event.availableSeats > 0 ? 'bg-emerald-950/300' : 'bg-red-950/300'}`}></div> {event.availableSeats}/{event.totalSeats} seats</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteEvent(event._id)} className="w-full sm:w-auto text-red-500 hover:text-white hover:bg-red-950/300 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm shrink-0">
                                            Delete
                                        </button>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>

                {/* Bookings Section */}
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-950/30 text-yellow-700 text-sm font-bold">{bookings.length}</span>
                        Booking Requests
                    </h2>
                    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
                        <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {bookings.length === 0 ? <li className="p-6 text-slate-400 text-center">No bookings yet.</li> :
                                bookings.map(booking => (
                                    <li key={booking._id} className={`p-6 hover:bg-slate-950 transition border-l-4 ${booking.status === 'pending' ? 'border-l-yellow-400' : booking.status === 'confirmed' ? 'border-l-green-400' : 'border-l-red-400'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-white text-lg leading-tight">{booking.eventId?.title || 'Deleted Event'}</h4>
                                            <div className="flex flex-col gap-1 items-end shrink-0 ml-4">
                                                <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-950/30 text-yellow-700'}`}>{booking.status}</span>
                                                {booking.status !== 'cancelled' && <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-800 text-slate-100'}`}>{booking.paymentStatus.replace('_', ' ')}</span>}
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 rounded-lg p-3 mb-3 border border-slate-700 text-sm">
                                            <p className="text-slate-300 flex items-center gap-2 mb-1">
                                                <span className="font-bold w-16 text-slate-400 uppercase text-xs">User:</span>
                                                <span className="font-semibold">{booking.userId?.name}</span>
                                                <span className="text-slate-400">({booking.userId?.email})</span>
                                            </p>
                                            <p className="text-slate-300 flex items-center gap-2 mb-1">
                                                <span className="font-bold w-16 text-slate-400 uppercase text-xs">Amount:</span>
                                                <span className={`font-semibold ${booking.amount === 0 ? 'text-green-600' : ''}`}>{booking.amount === 0 ? 'Free' : `₹${booking.amount}`}</span>
                                            </p>
                                            <p className="text-slate-300 flex items-center gap-2 mb-1">
                                                <span className="font-bold w-16 text-slate-400 uppercase text-xs">Date:</span>
                                                <span>{new Date(booking.bookedAt).toLocaleString()}</span>
                                            </p>
                                            {booking.eventId && (
                                                <p className="text-slate-300 flex items-center gap-2 mt-2 pt-2 border-t border-slate-700">
                                                    <span className="font-bold w-16 text-slate-400 uppercase text-xs">Seats:</span>
                                                    <span className={`font-bold ${booking.eventId.availableSeats > 0 ? 'text-green-600' : 'text-red-500'}`}>{booking.eventId.availableSeats}</span> remaining of {booking.eventId.totalSeats}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action buttons for admin */}
                                        {booking.status === 'pending' && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <button disabled={updatingBookingId === booking._id} onClick={() => handleConfirmBooking(booking._id, 'paid')} className="flex-1 min-w-[ 120px ] bg-emerald-950/30 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60">
                                                    ✓ Approve as Paid
                                                </button>
                                                <button disabled={updatingBookingId === booking._id} onClick={() => handleConfirmBooking(booking._id, 'not_paid')} className="flex-1 min-w-[ 120px ] bg-slate-950 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60">
                                                    ✓ Approve UnPaid
                                                </button>
                                                <button disabled={updatingBookingId === booking._id} onClick={() => handleCancelBooking(booking._id)} className="w-[ 80px ] bg-red-950/30 text-red-600 hover:bg-red-950/300 hover:text-white border border-red-200 text-xs font-bold py-2.5 px-3 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-60">
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;

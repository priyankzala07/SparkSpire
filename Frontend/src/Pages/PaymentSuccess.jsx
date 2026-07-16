import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-green-500 transform transition-all hover:-translate-y-1">
                <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6 drop-shadow-sm" />
                <h1 className="text-4xl font-black text-white mb-4">Booking Confirmed!</h1>
                <p className="text-slate-400 mb-8 text-lg">Your ticket has been booked successfully. A confirmation email has been sent to your registered email address.</p>
                <div className="space-y-4">
                    <Link to="/dashboard" className="block w-full bg-emerald-950/300 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl">
                        View My Tickets
                    </Link>
                    <Link to="/" className="block w-full bg-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-4 px-6 rounded-xl transition">
                        Discover More Events
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { type Booking } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Trash2, CalendarClock } from 'lucide-react';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBookings = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, "bookings"), 
        where("userId", "==", auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];

      data.sort((a, b) => a.startTime.seconds - b.startTime.seconds);

      setBookings(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Cancel this meeting?")) return;

    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      toast.success("Booking cancelled");
      fetchMyBookings();
    } catch (error) {
      toast.error("Error cancelling booking");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <p>You haven't booked any rooms yet.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Browse Rooms
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-blue-900">{booking.title}</h3>
                <div className="text-gray-600 flex items-center mt-1">
                  <CalendarClock size={16} className="mr-2" />
                  {format(booking.startTime.toDate(), 'PPP')} at {format(booking.startTime.toDate(), 'HH:mm')} - {format(booking.endTime.toDate(), 'HH:mm')}
                </div>
              </div>
              
              <button
                onClick={() => handleCancel(booking.id)}
                className="text-red-500 hover:text-red-700 p-2 border border-red-100 rounded hover:bg-red-50 transition"
                title="Cancel Booking"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
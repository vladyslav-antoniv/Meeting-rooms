import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { type Room } from '../../types';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchBookingsForRoom, addBooking, clearBookings } from './bookingsSlice';
import toast from 'react-hot-toast';
import { checkOverlap } from '../../utils/bookingUtils';
import { format } from 'date-fns';

export const RoomDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const { items: bookings } = useAppSelector(state => state.bookings);

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const roomSnap = await getDoc(doc(db, "rooms", id));
        if (roomSnap.exists()) {
          setRoom({ id: roomSnap.id, ...roomSnap.data() } as Room);
        } else {
          toast.error("Room not found");
          navigate('/');
        }
      } catch (e) {
        toast.error("Error loading room info");
      } finally {
        setLoading(false);
      }

      dispatch(fetchBookingsForRoom(id));
    };

    fetchData();

    return () => { dispatch(clearBookings()); }
  }, [id, navigate, dispatch]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !room || !id) return;

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (startDateTime >= endDateTime) {
      toast.error("End time must be after start time");
      return;
    }

    const hasConflict = checkOverlap(startDateTime, endDateTime, bookings);
    if (hasConflict) {
      toast.error("⚠️ This time slot is already booked!");
      return;
    }

    try {
      await dispatch(addBooking({
        roomId: id,
        userId: user.uid,
        userName: user.displayName || user.email || 'User',
        title,
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime)
      })).unwrap();
      
      toast.success("Room booked successfully!");
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error("Failed to book room");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!room) return <div>Room not found</div>;

  const todaysBookings = bookings.filter(b => 
    format(b.startTime.toDate(), 'yyyy-MM-dd') === date
  ).sort((a, b) => a.startTime.seconds - b.startTime.seconds);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{room.name}</h1>
        <p className="text-gray-600 mt-2">{room.description}</p>
        <p className="text-sm text-gray-500 mt-2">Capacity: {room.capacity} people</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4">Book this Room</h2>
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border p-2 rounded" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Start</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border p-2 rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium">End</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border p-2 rounded" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Confirm Booking</button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Schedule for {date}</h2>
          {todaysBookings.length === 0 ? (
            <p className="text-green-600">The room is free all day!</p>
          ) : (
            <ul className="space-y-3">
              {todaysBookings.map(b => (
                <li key={b.id} className="bg-white p-3 rounded shadow-sm border-l-4 border-red-500">
                  <div className="font-bold">{format(b.startTime.toDate(), 'HH:mm')} - {format(b.endTime.toDate(), 'HH:mm')}</div>
                  <div className="text-gray-600">{b.title}</div>
                  <div className="text-xs text-gray-400">by {b.userName}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
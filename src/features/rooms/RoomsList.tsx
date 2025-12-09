import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { type Room } from '../../types';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, Trash2, CalendarDays } from 'lucide-react';

export const RoomsList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const roomsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];

      setRooms(roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // only for admin
  const handleDelete = async (roomId: string, ownerId: string) => {
    if (auth.currentUser?.uid !== ownerId) {
      toast.error("You don't have permission to delete this room");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await deleteDoc(doc(db, "rooms", roomId));
      toast.success("Room deleted");
      fetchRooms();
    } catch (error) {
      console.error("Помилка при видаленні:", error);
      toast.error("Error deleting room");
    }
  };

  if (loading) return <div className="text-center py-10">Loading rooms...</div>;

  if (rooms.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">No rooms found yet.</p>
        <Link to="/create-room" className="text-blue-600 font-medium hover:underline">
          Create your first room
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <div key={room.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
            {/* only for admin */}
            {auth.currentUser?.uid === room.ownerId && (
              <button 
                onClick={() => handleDelete(room.id, room.ownerId)}
                className="text-gray-400 hover:text-red-500 transition"
                title="Delete room"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
          
          <p className="text-gray-600 mb-4 flex-grow line-clamp-2">{room.description}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Users size={16} className="mr-2" />
            <span>Capacity: {room.capacity} people</span>
          </div>

          <Link 
            to={`/rooms/${room.id}`}
            className="w-full flex items-center justify-center bg-blue-50 text-blue-600 py-2 rounded-md hover:bg-blue-100 transition font-medium"
          >
            <CalendarDays size={18} className="mr-2" />
            Book Room
          </Link>
        </div>
      ))}
    </div>
  );
};
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchRooms, deleteRoom } from './roomsSlice';
import { auth } from '../../config/firebase';
import toast from 'react-hot-toast';
import { Users, Trash2, CalendarDays, Edit } from 'lucide-react';

export const RoomsList = () => {
  const dispatch = useAppDispatch();
  
  const { items: rooms, status } = useAppSelector((state) => state.rooms);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRooms());
    }
  }, [status, dispatch]);

  const handleDelete = async (roomId: string, ownerId: string) => {
    if (auth.currentUser?.uid !== ownerId) return;
    if (!window.confirm("Are you sure?")) return;

    try {
      await dispatch(deleteRoom(roomId)).unwrap();
      toast.success("Room deleted");
    } catch (error) {
      toast.error("Error deleting room");
    }
  };

  if (status === 'loading') return <div className="text-center py-10">Loading rooms...</div>;
  if (status === 'failed') return <div className="text-center py-10 text-red-500">Error loading rooms</div>;

  if (rooms.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg">
        <p className="text-gray-500 mb-4">No rooms found.</p>
        <Link to="/create-room" className="text-blue-600 hover:underline">Create first room</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <div key={room.id} className="bg-white rounded-lg shadow-sm border p-6 flex flex-col hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
            
            {auth.currentUser?.uid === room.ownerId && (
              <div className="flex gap-2">
                 <Link to={`/rooms/${room.id}/edit`} className="text-gray-400 hover:text-blue-500">
                    <Edit size={20} />
                 </Link>
                 <button onClick={() => handleDelete(room.id, room.ownerId)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={20} />
                 </button>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-4 flex-grow line-clamp-2">{room.description}</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Users size={16} className="mr-2" />
            <span>Capacity: {room.capacity}</span>
          </div>

          <Link 
            to={`/rooms/${room.id}`}
            className="w-full flex items-center justify-center bg-blue-50 text-blue-600 py-2 rounded font-medium hover:bg-blue-100"
          >
            <CalendarDays size={18} className="mr-2" />
            Book Room
          </Link>
        </div>
      ))}
    </div>
  );
};
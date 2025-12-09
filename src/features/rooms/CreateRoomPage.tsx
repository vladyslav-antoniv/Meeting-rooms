import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAppSelector } from '../../app/hooks';
import toast from 'react-hot-toast';

const roomSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1 person"),
});

type RoomFormData = z.infer<typeof roomSchema>;

export const CreateRoomPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
  });

  const onSubmit = async (data: RoomFormData) => {
    if (!user || !user.email) {
      toast.error("You must be logged in");
      return;
    }

    try {
      await addDoc(collection(db, "rooms"), {
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        ownerId: user.uid,
        createdAt: Date.now(),
        // add admin
        accessList: {
          [user.email]: 'admin'
        }
      });

      toast.success('Room created successfully!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Error creating room');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">Create New Room</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Room Name</label>
          <input {...register('name')} className="mt-1 block w-full border rounded-md p-2" placeholder="Conference Room A" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea {...register('description')} className="mt-1 block w-full border rounded-md p-2" rows={3} placeholder="A quiet room with a projector..." />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Capacity (people)</label>
          <input type="number" {...register('capacity')} className="mt-1 block w-full border rounded-md p-2" />
          {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity.message}</p>}
        </div>

        <div className="flex gap-4 mt-6">
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </form>
    </div>
  );
};
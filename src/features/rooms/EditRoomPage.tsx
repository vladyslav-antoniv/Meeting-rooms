import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { type Room } from '../../types';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

import { useAppDispatch } from '../../app/hooks';
import { updateRoom } from './roomsSlice';

type EditFormData = {
  name: string;
  description: string;
  capacity: number;
};

export const EditRoomPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  
  // Local States
  const [accessList, setAccessList] = useState<Record<string, 'admin' | 'user'>>({});
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  const { register, handleSubmit, reset } = useForm<EditFormData>();

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "rooms", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Room;
          
          if (auth.currentUser?.uid !== data.ownerId) {
            toast.error("Only the owner can edit this room");
            navigate('/');
            return;
          }

          reset({
            name: data.name,
            description: data.description,
            capacity: data.capacity
          });
          
          setAccessList(data.accessList || {});
        } else {
          toast.error("Room not found");
          navigate('/');
        }
      } catch (error) {
        console.error(error);
        toast.error("Error loading room");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, navigate, reset]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      toast.error("Invalid email");
      return;
    }
    setAccessList(prev => ({ ...prev, [newEmail]: newRole }));
    setNewEmail('');
    toast.success(`Added ${newEmail}`);
  };

  const handleRemoveUser = (email: string) => {
    const newList = { ...accessList };
    delete newList[email];
    setAccessList(newList);
  };

  const onSubmit = async (data: EditFormData) => {
    if (!id) return;
    
    try {
      await dispatch(updateRoom({
        id,
        data: {
          ...data,
          accessList: accessList
        }
      })).unwrap();

      toast.success("Room updated successfully!");
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error("Error updating room");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow mt-8">
      <button onClick={() => navigate('/')} className="flex items-center text-gray-500 mb-6 hover:text-blue-600">
        <ArrowLeft size={18} className="mr-1" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Room & Permissions</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input {...register('name')} className="w-full border p-2 rounded mt-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea {...register('description')} className="w-full border p-2 rounded mt-1" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input type="number" {...register('capacity')} className="w-full border p-2 rounded mt-1" />
          </div>
        </div>

        <hr />

        <div>
          <h3 className="text-lg font-semibold mb-3">Access Management</h3>
          <div className="flex gap-2 mb-4">
            <input 
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="flex-1 border p-2 rounded"
            />
            <select 
              value={newRole}
              onChange={e => setNewRole(e.target.value as 'admin' | 'user')}
              className="border p-2 rounded bg-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="button" onClick={handleAddUser} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
              <Plus size={24} />
            </button>
          </div>

          <div className="bg-gray-50 rounded border p-4 space-y-2">
            {Object.entries(accessList).map(([email, role]) => (
              <div key={email} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                <div>
                  <span className="font-medium">{email}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {role.toUpperCase()}
                  </span>
                </div>
                <button type="button" onClick={() => handleRemoveUser(email)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 font-bold"
        >
          <Save size={20} /> Save Changes
        </button>
      </form>
    </div>
  );
};
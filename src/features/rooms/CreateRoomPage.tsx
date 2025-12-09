import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { fetchRooms } from "./roomsSlice";
import toast from "react-hot-toast";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

const roomSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1 person"),
});

type RoomFormData = z.infer<typeof roomSchema>;

export const CreateRoomPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [accessList, setAccessList] = useState<
    Record<string, "admin" | "user">
  >({});
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Invalid email");
      return;
    }

    setAccessList((prev) => ({
      ...prev,
      [newEmail]: newRole,
    }));

    setNewEmail("");
    toast.success(`Added ${newEmail} to list`);
  };

  const handleRemoveUser = (email: string) => {
    const newList = { ...accessList };
    delete newList[email];
    setAccessList(newList);
  };

  const onSubmit = async (data: RoomFormData) => {
    if (!user || !user.email) {
      toast.error("You must be logged in");
      return;
    }

    try {
      const finalAccessList = {
        ...accessList,
        [user.email]: "admin",
      };

      await addDoc(collection(db, "rooms"), {
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        ownerId: user.uid,
        createdAt: Date.now(),
        accessList: finalAccessList,
      });

      toast.success("Room created successfully!");

      dispatch(fetchRooms());

      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Error creating room");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow mt-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center text-gray-500 mb-6 hover:text-blue-600 transition"
      >
        <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Room</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Room Name
            </label>
            <input
              {...register("name")}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="Conference Room A"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("description")}
              className="mt-1 block w-full border rounded-md p-2"
              rows={3}
              placeholder="A quiet room with a projector..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Capacity (people)
            </label>
            <input
              type="number"
              {...register("capacity")}
              className="mt-1 block w-full border rounded-md p-2"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm">{errors.capacity.message}</p>
            )}
          </div>
        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="text-lg font-semibold mb-3">Access Management</h3>
          <p className="text-sm text-gray-500 mb-4">
            You can verify access rights immediately upon creation.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="flex-1 border p-2 rounded"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddUser(e);
              }}
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "admin" | "user")}
              className="border p-2 rounded bg-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="button"
              onClick={handleAddUser}
              className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
              title="Add user to list"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="bg-gray-50 rounded border p-4 space-y-2 min-h-[100px]">
            {Object.keys(accessList).length === 0 && (
              <div className="text-center text-gray-400 text-sm py-2">
                Only you (Owner) will have access initially.
              </div>
            )}

            {Object.entries(accessList).map(([email, role]) => (
              <div
                key={email}
                className="flex justify-between items-center bg-white p-2 rounded shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{email}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {role.toUpperCase()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveUser(email)}
                  className="text-gray-400 hover:text-red-600 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex justify-center items-center gap-2 font-bold shadow-md"
        >
          <Save size={20} />
          {isSubmitting ? "Creating Room..." : "Create Room"}
        </button>
      </form>
    </div>
  );
};

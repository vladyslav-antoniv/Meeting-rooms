import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { doc, setDoc } from 'firebase/firestore';

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.name
        });
        
        await setDoc(doc(db, "users", userCredential.user.uid), {
           uid: userCredential.user.uid,
           email: data.email,
           name: data.name,
           createdAt: new Date()
        });
      }

      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error('Registration failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlaneTakeoff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    },
    onError: (err: Error | unknown) => {
      const axiosError = err as import('axios').AxiosError<{ message: string }>;
      const errorMsg = axiosError.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 rounded-3xl p-10 border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
          <PlaneTakeoff size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h2>
        <p className="text-slate-500 text-sm mt-2">Start planning your dream trips today.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <Input {...register('name')} placeholder="John Doe" error={errors.name?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
          <Input {...register('email')} type="email" placeholder="Enter your email" error={errors.email?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
          <Input {...register('password')} type="password" placeholder="••••••••" error={errors.password?.message} />
        </div>
        
        <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
      </p>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import { FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200'>
      <div className='max-w-5xl w-full mx-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
        <div className='hidden lg:flex flex-col justify-center p-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-lg overflow-hidden'>
          <h2 className='text-4xl font-extrabold mb-4'>Find your dream property</h2>
          <p className='text-lg opacity-90 mb-6'>Search, list and manage real estate easily — fast, secure, and beautiful.</p>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center'>
              <FaSignInAlt className='text-white text-xl' />
            </div>
            <div>
              <p className='font-semibold'>Quick listings</p>
              <p className='text-sm opacity-90'>Create and manage listings in seconds</p>
            </div>
          </div>
        </div>

        <div className='p-6 lg:p-10 bg-white rounded-2xl shadow-xl'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-emerald-600 rounded-md flex items-center justify-center text-white font-bold'>RE</div>
                <div>
                  <h1 className='text-2xl font-semibold text-slate-800'>RealEstate</h1>
                  <p className='text-xs text-slate-500'>Sign in to continue</p>
                </div>
              </div>
            </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='relative'>
              <label htmlFor='email' className='sr-only'>Email</label>
              <FaEnvelope className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              <input
                name='email'
                type='email'
                placeholder='Email'
                aria-label='Email'
                required
                className='w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all duration-200'
                id='email'
                onChange={handleChange}
              />
            </div>

            <div className='relative'>
              <label htmlFor='password' className='sr-only'>Password</label>
              <FaLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              <input
                name='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Password'
                aria-label='Password'
                required
                className='w-full pl-10 pr-12 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all duration-200'
                id='password'
                onChange={handleChange}
              />
              <button
                type='button'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((s) => !s)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500'
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className='flex items-center justify-between text-sm text-slate-600'>
              <label className='flex items-center gap-2'>
                <input id='remember' type='checkbox' className='h-4 w-4 rounded border-slate-300' />
                Remember me
              </label>
              <Link to={'/forgot-password'} className='hover:underline'>Forgot?</Link>
            </div>

            <button
              type='submit'
              disabled={loading}
              aria-busy={loading}
              className='w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {loading ? (
                <svg className='animate-spin h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
              ) : (
                <>
                  <FaSignInAlt />
                  Sign In
                </>
              )}
            </button>

            <p className='text-center text-slate-600 text-sm mt-4'>
              Don’t have an account?{' '}
              <Link to={'/sign-up'} className='text-emerald-600 font-semibold hover:underline'>Sign up</Link>
            </p>

            {error && (
              <p className='mt-2 text-center text-red-500 bg-red-50 p-3 rounded-lg'>
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

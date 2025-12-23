import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200'>
      <div className='max-w-5xl w-full mx-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
        <div className='p-6 lg:p-10 bg-white rounded-2xl shadow-xl'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-rose-500 rounded-md flex items-center justify-center text-white font-bold'>RE</div>
              <div>
                <h1 className='text-2xl font-semibold text-slate-800'>RealEstate</h1>
                <p className='text-xs text-slate-500'>Create your account</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='relative'>
              <label htmlFor='username' className='sr-only'>Username</label>
              <FaUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              <input
                name='username'
                type='text'
                placeholder='Username'
                aria-label='Username'
                required
                className='w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-200'
                id='username'
                onChange={handleChange}
              />
            </div>
            <div className='relative'>
              <FaEnvelope className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              <input
                type='email'
                placeholder='Email'
                className='w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-200'
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
                className='w-full pl-10 pr-12 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-200'
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

            <button
              type='submit'
              disabled={loading}
              aria-busy={loading}
              className='w-full bg-emerald-600 text-white py-3 rounded-lg uppercase font-semibold hover:bg-emerald-700 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200'
            >
              {loading ? (
                <span className='flex items-center justify-center'>
                  <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <>
                  <FaUserPlus />
                  Sign Up
                </>
              )}
            </button>

            <p className='mt-4 text-center text-slate-600'>
              Already have an account?{' '}
              <Link to={'/sign-in'} className='text-emerald-600 font-semibold hover:underline'>Sign in</Link>
            </p>

            {error && (
              <p className='mt-4 text-center text-red-500 bg-red-50 p-3 rounded-lg'>
                {error}
              </p>
            )}
          </form>
        </div>

        <div className='hidden lg:flex flex-col justify-center p-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg'>
          <h2 className='text-3xl font-bold mb-4'>Create and showcase listings</h2>
          <p className='opacity-90'>Gain visibility and connect with buyers quickly.</p>
        </div>
      </div>
    </div>
  );
}

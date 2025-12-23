import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);
  return (
    <header className='sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200'>
      <div className='flex justify-between items-center max-w-6xl mx-auto px-4 py-3'>
        <Link to='/'>
          <h1 className='font-extrabold text-lg sm:text-2xl tracking-tight flex flex-wrap'>
            <span className='text-slate-800'>Real</span>
            <span className='text-slate-500'>Estate</span>
          </h1>
        </Link>
        <form
          onSubmit={handleSubmit}
          className='bg-white/70 border border-slate-200 px-3 py-2 rounded-lg flex items-center shadow-sm focus-within:ring-2 focus-within:ring-slate-300'
        >
          <input
            type='text'
            placeholder='Search homes, lands...'
            className='bg-transparent placeholder-slate-400 focus:outline-none w-28 sm:w-64'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type='submit' className='ml-2 p-1 text-slate-600 hover:text-slate-800'>
            <FaSearch />
          </button>
        </form>
        <ul className='flex items-center gap-2 sm:gap-4'>
          <Link to='/'>
            <li className={`hidden sm:inline px-3 py-2 rounded-md text-sm font-medium hover:text-slate-900 hover:bg-slate-100 ${location.pathname === '/' ? 'text-slate-900 bg-slate-100' : 'text-slate-700'}`}>
              Home
            </li>
          </Link>
          <Link to='/lands'>
            <li className={`hidden sm:inline px-3 py-2 rounded-md text-sm font-medium hover:text-slate-900 hover:bg-slate-100 ${location.pathname === '/lands' ? 'text-slate-900 bg-slate-100' : 'text-slate-700'}`}>
              Lands
            </li>
          </Link>
          <Link to='/about'>
            <li className={`hidden sm:inline px-3 py-2 rounded-md text-sm font-medium hover:text-slate-900 hover:bg-slate-100 ${location.pathname === '/about' ? 'text-slate-900 bg-slate-100' : 'text-slate-700'}`}>
              About
            </li>
          </Link>
          <Link to='/profile'>
            {currentUser ? (
              <img
                className='rounded-full h-8 w-8 object-cover ring-1 ring-slate-300 hover:ring-slate-400'
                src={currentUser.avatar}
                alt='profile'
                title='Profile'
              />
            ) : (
              <li className={`px-3 py-2 rounded-md text-sm font-semibold hover:text-white hover:bg-slate-800 ${location.pathname === '/sign-in' ? 'bg-slate-800 text-white' : 'bg-slate-700 text-white'}`}>
                Sign in
              </li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}

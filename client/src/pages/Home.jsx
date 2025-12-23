import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';
import backgroundImg from '../images/image.jpg'; // Your image path
import '../styles/PropertyGrid.css';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        console.log('Fetching offer listings...');
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        console.log('Offer listings response:', data);
        setOfferListings(data);
        fetchAllListings();
      } catch (error) {
        console.error('Error fetching offer listings:', error);
      }
    };

    const fetchAllListings = async () => {
      try {
        console.log('Fetching all listings...');
        const res = await fetch('/api/listing/get?limit=8');
        const data = await res.json();
        console.log('All listings response:', data);
        setAllListings(data);
      } catch (error) {
        console.error('Error fetching all listings:', error);
      }
    };

    fetchOfferListings();
  }, []);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      {/* Hero Section */}
      <div className="h-screen relative">
        <div className="absolute inset-0 bg-black bg-opacity-50">
          {/* Top Text */}
          <div className='flex flex-col gap-8 p-28 px-3 max-w-6xl mx-auto text-white'>
            <h1 className='font-bold text-4xl lg:text-7xl'>
              Find your next <span className='text-slate-200'>perfect</span>
              <br />
              place with ease
            </h1>
            <div className='text-gray-200 text-base sm:text-lg'>
              Real Estate is the best place to find your next perfect place to live.
              <br />
              We have a wide range of properties for you to choose from.
              <br />
              <span className='text-green-300 font-semibold'>🛒 New: Buy properties instantly with our one-click purchase feature!</span>
            </div>
            <Link
              to={'/search'}
              className='text-base sm:text-lg text-blue-200 font-bold hover:underline'
            >
              Let's get started...
            </Link>
          </div>

          {/* Swiper */}
          <div className="absolute bottom-0 w-full">
            <Swiper navigation>
              {offerListings &&
                offerListings.length > 0 &&
                offerListings.map((listing) => (
                  <SwiperSlide key={listing._id}>
                    <div
                      style={{
                        background: `url(${listing.imageUrls[1]}) center no-repeat`,
                        backgroundSize: 'cover',
                      }}
                      className='h-[300px]'
                    ></div>
                  </SwiperSlide>
                ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="relative py-20 min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative max-w-6xl mx-auto px-4 lg:px-6 overflow-hidden">
          {allListings && allListings.length > 0 ? (
            <div className="space-y-8">
              <div className='flex justify-between items-center mb-8'>
                <h2 className='text-4xl font-semibold text-white'>Recent Listings</h2>
                <Link className='text-lg text-blue-200 hover:underline' to={'/search'}>
                  Show more listings
                </Link>
              </div>
              
              {/* Special Offers Section */}
              {offerListings && offerListings.length > 0 && (
                <div className="mb-24">
                  <div className="text-center mb-16">
                    <h3 className="text-4xl font-bold text-white mb-6">🔥 Special Offers</h3>
                    <div className="section-divider offers-divider"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center place-items-center">
                    {offerListings.map((listing) => (
                      <div key={listing._id} className="w-full max-w-[300px] mx-auto">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300">
                          <ListingItem listing={listing} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Properties Section */}
              <div className="mb-24">
                <div className="text-center mb-16">
                  <h3 className="text-4xl font-bold text-white mb-6">🏠 Recent Properties</h3>
                  <div className="section-divider"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center place-items-center">
                  {allListings.slice(0, 8).map((listing) => (
                    <div key={listing._id} className="w-full max-w-[300px] mx-auto">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300">
                        <ListingItem listing={listing} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-16">
                  <Link 
                    to="/search" 
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    View All Properties →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-center py-12'>
              <h2 className='text-3xl font-bold text-white mb-4'>No Listings Available</h2>
              <p className='text-xl text-gray-300'>Check back later for new listings</p>
              <Link 
                className='inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300' 
                to={'/search'}
              >
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

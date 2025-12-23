import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
  FaRulerCombined,
  FaShoppingCart,
} from 'react-icons/fa';
import Contact from '../components/Contact';

// https://sabe.io/blog/javascript-format-numbers-commas#:~:text=The%20best%20way%20to%20format,format%20the%20number%20with%20commas.

export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (!params.listingId) {
          setError(true);
          setLoading(false);
          console.error('Listing ID is missing');
          return;
        }
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          console.error('Failed to fetch listing:', data.message);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
        console.error('Error fetching listing:', error);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const handlePurchase = async () => {
    if (!currentUser) {
      setPurchaseError('Please sign in to purchase land');
      return;
    }

    if (currentUser._id === listing.userRef) {
      setPurchaseError('You cannot purchase your own listing');
      return;
    }

    setPurchasing(true);
    setPurchaseError('');

    try {
      const res = await fetch(`/api/listing/purchase/${listing._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      const data = await res.json();

      if (data.success === false) {
        setPurchaseError(data.message);
        setPurchasing(false);
        return;
      }

      setPurchaseSuccess(true);
      setPurchasing(false);
      
      // Update the listing state to reflect the purchase
      setListing(data.listing);

    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError('Failed to purchase property. Please try again.');
      setPurchasing(false);
    }
  };

  return (
    <main>
      {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
      {error && (
        <p className='text-center my-7 text-2xl'>Something went wrong!</p>
      )}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className='h-[550px]'
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: 'cover',
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer'>
            <FaShare
              className='text-slate-500'
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className='fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2'>
              Link copied!
            </p>
          )}
          <div className='flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4'>
            <p className='text-2xl font-semibold'>
              {listing.name} - ₹{' '}
              {listing.offer
                ? listing.discountPrice.toLocaleString('en-IN')
                : listing.regularPrice.toLocaleString('en-IN')}
              {listing.type === 'rent' && ' / month'}
            </p>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className='flex items-center gap-2 text-slate-600 text-lg mt-4 p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors duration-200 cursor-pointer'
            >
              <FaMapMarkerAlt className='text-red-600 text-xl' />
              <span className='font-medium'>{listing.address}</span>
            </a>
            <div className='flex gap-4'>
              <p className='bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
              </p>
              {listing.isLand && (
                <p className='bg-blue-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                  Land Property
                </p>
              )}
              {listing.offer && (
                <p className='bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                  ₹{(+listing.regularPrice - +listing.discountPrice).toLocaleString('en-IN')} OFF
                </p>
              )}
              {listing.sold && (
                <p className='bg-gray-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                  SOLD
                </p>
              )}
            </div>
            <p className='text-slate-800'>
              <span className='font-semibold text-black'>Description - </span>
              {listing.description}
            </p>
            {listing.isLand ? (
              // Land-specific details
              <div className='space-y-4'>
                <ul className='text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6'>
                  <li className='flex items-center gap-1 whitespace-nowrap'>
                    <FaRulerCombined className='text-lg' />
                    {listing.area} {listing.areaUnit}
                  </li>
                  <li className='flex items-center gap-1 whitespace-nowrap'>
                    <FaMapMarkedAlt className='text-lg' />
                    {listing.zoning}
                  </li>
                </ul>
                <div className='bg-slate-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-slate-800 mb-2'>Land Details:</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm'>
                    <p><span className='font-medium'>Topography:</span> {listing.topography}</p>
                    <p><span className='font-medium'>Zoning:</span> {listing.zoning}</p>
                    {listing.utilities && listing.utilities.length > 0 && (
                      <p><span className='font-medium'>Utilities:</span> {listing.utilities.join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Regular property details
              <ul className='text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6'>
                <li className='flex items-center gap-1 whitespace-nowrap '>
                  <FaBed className='text-lg' />
                  {listing.bedrooms > 1
                    ? `${listing.bedrooms} beds `
                    : `${listing.bedrooms} bed `}
                </li>
                <li className='flex items-center gap-1 whitespace-nowrap '>
                  <FaBath className='text-lg' />
                  {listing.bathrooms > 1
                    ? `${listing.bathrooms} baths `
                    : `${listing.bathrooms} bath `}
                </li>
                <li className='flex items-center gap-1 whitespace-nowrap '>
                  <FaParking className='text-lg' />
                  {listing.parking ? 'Parking spot' : 'No Parking'}
                </li>
                <li className='flex items-center gap-1 whitespace-nowrap '>
                  <FaChair className='text-lg' />
                  {listing.furnished ? 'Furnished' : 'Unfurnished'}
                </li>
              </ul>
            )}
            {/* Buy button for ALL sale properties */}
            {listing.type === 'sale' && currentUser && listing.userRef !== currentUser._id && !listing.sold && (
              <div className='space-y-3'>
                {purchaseSuccess ? (
                  <div className='bg-green-100 text-green-800 p-4 rounded-lg text-center font-semibold'>
                    🎉 Purchase Successful! You are now the owner of this property.
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold text-lg transition-colors duration-200 ${
                        purchasing
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <FaShoppingCart />
                      {purchasing ? 'Processing Purchase...' : `Buy This Property for ₹${listing.offer ? listing.discountPrice.toLocaleString('en-IN') : listing.regularPrice.toLocaleString('en-IN')}`}
                    </button>
                    {purchaseError && (
                      <p className='text-red-600 text-center bg-red-50 p-3 rounded-lg'>{purchaseError}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Contact button for rent properties or when user wants to contact */}
            {currentUser && listing.userRef !== currentUser._id && !contact && (listing.type === 'rent' || listing.sold) && (
              <button
                onClick={() => setContact(true)}
                className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3'
              >
                Contact {listing.type === 'rent' ? 'landlord' : 'seller'}
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}

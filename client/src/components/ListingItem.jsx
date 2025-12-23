import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined, FaShoppingCart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useState } from 'react';

export default function ListingItem({ listing }) {
  const { currentUser } = useSelector((state) => state.user);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  if (!listing || !listing._id) {
    return null; // Don't render if listing or ID is missing
  }

  const handlePurchase = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      
      // Optionally reload the page or update the listing state
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError('Failed to purchase property. Please try again.');
      setPurchasing(false);
    }
  };

  return (
    <div className='bg-white shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-lg w-full max-w-[300px] mx-auto group'>
      <Link to={`/listing/${listing._id}`}>
        <div className='relative overflow-hidden'>
          <img
            src={
              listing.imageUrls[0] ||
              'https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg'
            }
            alt='listing cover'
            className='h-[320px] sm:h-[220px] w-full object-cover group-hover:scale-105 transition-scale duration-300'
          />
          {listing.offer && (
            <div className='absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-sm font-semibold'>
              ₹{(listing.regularPrice - listing.discountPrice).toLocaleString('en-IN')} OFF
            </div>
          )}
          {listing.isLand && (
            <div className='absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-semibold'>
              Land
            </div>
          )}
        </div>
        <div className='p-4 flex flex-col gap-2'>
          <p className='text-xl font-bold text-slate-800 truncate'>
            {listing.name}
          </p>
          <div className='flex items-center gap-1 text-gray-600'>
            <MdLocationOn className='h-5 w-5 text-green-700' />
            <p className='text-sm truncate w-full'>
              {listing.address}
            </p>
          </div>
          <p className='text-gray-600 text-sm line-clamp-2'>
            {listing.description}
          </p>
          <div className='flex items-center justify-between mt-2'>
            <p className='text-lg font-bold text-slate-800'>
              ₹
              {listing.offer
                ? listing.discountPrice.toLocaleString('en-IN')
                : listing.regularPrice.toLocaleString('en-IN')}
              {listing.type === 'rent' && ' / month'}
            </p>
            {listing.isLand ? (
              <div className='flex items-center gap-2 text-gray-600'>
                <FaRulerCombined className='text-green-700' />
                <span className='text-sm font-medium'>
                  {listing.area} {listing.areaUnit}
                </span>
              </div>
            ) : (
              <div className='flex gap-4 text-gray-600'>
                <div className='flex items-center gap-1'>
                  <FaBed className='text-green-700' />
                  <span className='text-sm font-medium'>
                    {listing.bedrooms}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <FaBath className='text-green-700' />
                  <span className='text-sm font-medium'>
                    {listing.bathrooms}
                  </span>
                </div>
              </div>
            )}
          </div>
          {listing.isLand && (
            <div className='mt-2 flex flex-wrap gap-2'>
              <span className='text-xs bg-gray-100 px-2 py-1 rounded-full'>
                {listing.zoning}
              </span>
              <span className='text-xs bg-gray-100 px-2 py-1 rounded-full'>
                {listing.topography}
              </span>
              {listing.utilities?.map((utility, index) => (
                <span key={index} className='text-xs bg-gray-100 px-2 py-1 rounded-full'>
                  {utility}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      
      {/* Buy button for ALL properties - SIMPLIFIED VERSION */}
      <div className='p-4 pt-0'>
        {currentUser ? (
          currentUser._id !== listing.userRef ? (
            listing.type === 'sale' ? (
              purchaseSuccess ? (
                <div className='bg-green-100 text-green-800 p-3 rounded-lg text-center font-semibold'>
                  Purchase Successful! 🎉
                </div>
              ) : (
                <>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                      purchasing
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <FaShoppingCart />
                    {purchasing ? 'Processing...' : `Buy Now - ₹${listing.offer ? listing.discountPrice.toLocaleString('en-IN') : listing.regularPrice.toLocaleString('en-IN')}`}
                  </button>
                  {purchaseError && (
                    <p className='text-red-600 text-sm mt-2 text-center'>{purchaseError}</p>
                  )}
                </>
              )
            ) : (
              <button
                className='w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-gray-600 text-white'
                disabled
              >
                For Rent Only
              </button>
            )
          ) : (
            <button
              className='w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-gray-400 text-gray-600'
              disabled
            >
              Your Property
            </button>
          )
        ) : (
          <button
            onClick={() => alert('Please sign in to purchase this property')}
            className='w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200'
          >
            <FaShoppingCart />
            Sign In to Buy
          </button>
        )}
      </div>
    </div>
  );
}

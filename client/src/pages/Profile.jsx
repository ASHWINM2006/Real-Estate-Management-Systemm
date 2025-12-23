import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCamera,
  FaHome,
  FaTrash,
  FaSignOutAlt,
  FaEdit,
  FaList,
} from 'react-icons/fa';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(data.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      console.log('Fetching listings for user:', currentUser._id);
      
      const res = await fetch(`/api/user/listings/${currentUser._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await res.json();
      console.log('Listings response:', data);
      
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    console.log('User listings updated:', userListings);
  }, [userListings]);

  useEffect(() => {
    console.log('Current user:', currentUser);
  }, [currentUser]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-8'>
      <div className='max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-slate-800 mb-2'>Profile</h1>
          <p className='text-slate-600'>Manage your account settings</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Profile Image Section */}
          <div className='flex flex-col items-center'>
            <div className='relative group'>
              <img
                onClick={() => fileRef.current.click()}
                src={formData.avatar || currentUser.avatar}
                alt='profile'
                className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
              />
              <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                <FaCamera className='text-white text-3xl' />
              </div>
            </div>
            <input
              onChange={(e) => setFile(e.target.files[0])}
              type='file'
              ref={fileRef}
              hidden
              accept='image/*'
            />
            <p className='text-sm mt-2'>
              {fileUploadError ? (
                <span className='text-red-700 flex items-center gap-1'>
                  <FaTrash className='text-sm' /> Error Image upload (image must be less than 2 mb)
                </span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
              ) : filePerc === 100 ? (
                <span className='text-green-700 flex items-center gap-1'>
                  <FaEdit className='text-sm' /> Image successfully uploaded!
                </span>
              ) : (
                ''
              )}
            </p>
          </div>

          {/* Form Fields */}
          <div className='space-y-4'>
            <div className='relative'>
              <FaUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              <input
                type='text'
                placeholder='Username'
                defaultValue={currentUser.username}
                id='username'
                className='w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-300'
                onChange={handleChange}
              />
            </div>

            <div className='relative'>
              <FaEnvelope className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              <input
                type='email'
                placeholder='Email'
                id='email'
                defaultValue={currentUser.email}
                className='w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-300'
                onChange={handleChange}
              />
            </div>

            <div className='relative'>
              <FaLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              <input
                type='password'
                placeholder='Password'
                onChange={handleChange}
                id='password'
                className='w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-300'
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-4'>
            <button
              disabled={loading}
              className='w-full bg-slate-700 text-white py-3 rounded-lg uppercase font-semibold hover:bg-slate-800 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <svg className='animate-spin h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <FaEdit /> Update Profile
                </>
              )}
            </button>

            <Link
              className='w-full bg-green-700 text-white py-3 rounded-lg uppercase font-semibold hover:bg-green-800 transition-all duration-300 flex items-center justify-center gap-2'
              to={'/create-listing'}
            >
              <FaHome /> Create Listing
            </Link>
          </div>
        </form>

        {/* Additional Actions */}
        <div className='mt-8 space-y-4'>
          <button 
            onClick={handleShowListings}
            className='w-full bg-blue-700 text-white py-3 rounded-lg uppercase font-semibold hover:bg-blue-800 transition-all duration-300 flex items-center justify-center gap-2'
          >
            <FaList /> {userListings.length > 0 ? 'Hide Listings' : 'Show Listings'}
          </button>

          <div className='flex justify-between items-center pt-4 border-t border-slate-200'>
            <button
              onClick={handleDeleteUser}
              className='text-red-700 hover:text-red-800 transition-colors duration-200 flex items-center gap-2'
            >
              <FaTrash /> Delete Account
            </button>
            <button
              onClick={handleSignOut}
              className='text-red-700 hover:text-red-800 transition-colors duration-200 flex items-center gap-2'
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </div>

        {/* Status Messages */}
        <div className='mt-6 space-y-2'>
          {error && (
            <p className='text-red-700 bg-red-50 p-3 rounded-lg text-center'>
              {error}
            </p>
          )}
          {updateSuccess && (
            <p className='text-green-700 bg-green-50 p-3 rounded-lg text-center'>
              User is updated successfully!
            </p>
          )}
          {showListingsError && (
            <p className='text-red-700 bg-red-50 p-3 rounded-lg text-center'>
              Error showing listings
            </p>
          )}
        </div>

        {/* User Listings Section */}
        {Array.isArray(userListings) && userListings.length > 0 && (
          <div className='mt-8'>
            <h2 className='text-2xl font-semibold text-slate-800 mb-4'>Your Listings</h2>
            <div className='grid grid-cols-1 gap-4'>
              {userListings.map((listing) => (
                <div
                  key={listing._id}
                  className='border rounded-lg p-4 flex justify-between items-center gap-4 bg-slate-50 hover:bg-slate-100 transition-colors duration-200'
                >
                  <Link
                    to={`/listing/${listing._id}`}
                    className='flex-1'
                  >
                    <div className='flex items-center gap-4'>
                      <img
                        src={listing.imageUrls[0]}
                        alt={listing.name}
                        className='h-16 w-16 object-cover rounded-lg'
                      />
                      <div>
                        <h3 className='font-semibold text-slate-800'>{listing.name}</h3>
                        <p className='text-slate-600 text-sm'>
                          ${listing.offer ? listing.discountPrice : listing.regularPrice}
                          {listing.type === 'rent' && ' / month'}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleListingDelete(listing._id)}
                      className='text-red-700 hover:text-red-800 transition-colors duration-200 p-2'
                    >
                      <FaTrash />
                    </button>
                    <Link
                      to={`/edit-listing/${listing._id}`}
                      className='text-green-700 hover:text-green-800 transition-colors duration-200 p-2'
                    >
                      <FaEdit />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show message when no listings */}
        {Array.isArray(userListings) && userListings.length === 0 && !showListingsError && (
          <div className='mt-8 text-center text-slate-600'>
            <p>You haven't created any listings yet.</p>
            <Link
              to='/create-listing'
              className='text-blue-700 hover:text-blue-800 font-semibold mt-2 inline-block'
            >
              Create your first listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

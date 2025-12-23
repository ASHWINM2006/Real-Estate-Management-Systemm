import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] };
    }

    let isLand = req.query.isLand;

    if (isLand === undefined || isLand === 'false') {
      isLand = { $in: [false, true] };
    } else if (isLand === 'true') {
      isLand = true;
    }

    const searchTerm = req.query.searchTerm || '';

    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    // Build query object
    const query = {
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      furnished,
      parking,
      type,
      isLand,
      sold: false, // Exclude sold properties
    };

    const listings = await Listing.find(query)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const purchaseListing = async (req, res, next) => {
  try {
    console.log('Purchase request for listing ID:', req.params.id);
    console.log('User making request:', req.user.id);
    
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      console.log('Listing not found');
      return next(errorHandler(404, 'Listing not found!'));
    }
    
    console.log('Listing found:', {
      id: listing._id,
      name: listing.name,
      type: listing.type,
      isLand: listing.isLand,
      sold: listing.sold,
      userRef: listing.userRef,
      regularPrice: listing.regularPrice,
      discountPrice: listing.discountPrice,
      offer: listing.offer
    });

    // Check if listing is already sold
    if (listing.sold) {
      console.log('Property already sold');
      return next(errorHandler(400, 'This property has already been sold!'));
    }

    // Check if user is trying to buy their own listing
    if (req.user.id === listing.userRef) {
      console.log('User trying to buy own listing');
      return next(errorHandler(400, 'You cannot purchase your own listing!'));
    }

    // Check if it's a sale property (both regular properties and land can be purchased)
    if (listing.type !== 'sale') {
      console.log('Property not for sale, type:', listing.type);
      return next(errorHandler(400, 'Purchase feature is only available for properties listed for sale!'));
    }
    
    console.log('All checks passed, proceeding with purchase...');

    // Calculate final price
    const finalPrice = listing.offer ? listing.discountPrice : listing.regularPrice;

    // Update listing as sold
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        sold: true,
        soldTo: req.user.id,
        soldDate: new Date(),
        soldPrice: finalPrice,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Purchase successful!',
      listing: updatedListing,
      purchaseDetails: {
        buyerId: req.user.id,
        soldPrice: finalPrice,
        soldDate: updatedListing.soldDate,
      }
    });
  } catch (error) {
    next(error);
  }
};

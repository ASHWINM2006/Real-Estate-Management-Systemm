import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: false,
    },
    bedrooms: {
      type: Number,
      required: false,
    },
    furnished: {
      type: Boolean,
      required: false,
    },
    parking: {
      type: Boolean,
      required: false,
    },
    type: {
      type: String,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
    // Land specific fields
    isLand: {
      type: Boolean,
      default: false,
    },
    area: {
      type: Number,
      required: function() { return this.isLand; },
    },
    areaUnit: {
      type: String,
      enum: ['sqft', 'sqm', 'acre', 'hectare'],
      required: function() { return this.isLand; },
    },
    zoning: {
      type: String,
      required: function() { return this.isLand; },
    },
    topography: {
      type: String,
      required: function() { return this.isLand; },
    },
    utilities: {
      type: [String],
      required: function() { return this.isLand; },
    },
    // Purchase tracking fields
    sold: {
      type: Boolean,
      default: false,
    },
    soldTo: {
      type: String, // User ID of the buyer
      required: false,
    },
    soldDate: {
      type: Date,
      required: false,
    },
    soldPrice: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;

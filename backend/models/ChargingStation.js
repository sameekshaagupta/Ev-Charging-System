const mongoose = require('mongoose');

const chargingStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Active',
    required: true
  },
  powerOutput: {
    type: Number,
    required: [true, 'Power output is required'],
    min: [1, 'Power output must be at least 1 kW'],
    max: [350, 'Power output cannot exceed 350 kW']
  },
  connectorType: {
    type: String,
    enum: ['Type 1', 'Type 2', 'CHAdeMO', 'CCS', 'Tesla Supercharger'],
    required: [true, 'Connector type is required']
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'Parking', 'Restaurant', 'Shopping', 'Restroom', '24/7 Access']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
chargingStationSchema.index({ 
  'location.latitude': 1, 
  'location.longitude': 1 
});

module.exports = mongoose.model('ChargingStation', chargingStationSchema);
const { validationResult } = require('express-validator');
const ChargingStation = require('../models/ChargingStation');

exports.createChargingStation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const chargingStationData = {
      ...req.body,
      createdBy: req.user._id
    };

    const chargingStation = new ChargingStation(chargingStationData);
    await chargingStation.save();

    await chargingStation.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Charging station created successfully',
      chargingStation
    });
  } catch (error) {
    console.error('Create charging station error:', error);
    res.status(500).json({ message: 'Server error creating charging station' });
  }
};

exports.getAllChargingStations = async (req, res) => {
  try {
    const {
      status,
      connectorType,
      minPower,
      maxPower,
      page = 1,
      limit = 10,
      sort = 'createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (connectorType) filter.connectorType = connectorType;
    if (minPower || maxPower) {
      filter.powerOutput = {};
      if (minPower) filter.powerOutput.$gte = Number(minPower);
      if (maxPower) filter.powerOutput.$lte = Number(maxPower);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get charging stations with filters
    const chargingStations = await ChargingStation.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await ChargingStation.countDocuments(filter);

    res.json({
      chargingStations,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get all charging stations error:', error);
    res.status(500).json({ message: 'Server error fetching charging stations' });
  }
};

exports.getChargingStationById = async (req, res) => {
  try {
    const chargingStation = await ChargingStation.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!chargingStation) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    res.json({ chargingStation });
  } catch (error) {
    console.error('Get charging station error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid charging station ID' });
    }
    res.status(500).json({ message: 'Server error fetching charging station' });
  }
};

exports.updateChargingStation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const chargingStation = await ChargingStation.findById(req.params.id);

    if (!chargingStation) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    // Check if user owns the charging station or is admin
    if (chargingStation.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this charging station' });
    }

    // Update charging station
    Object.assign(chargingStation, req.body);
    await chargingStation.save();

    await chargingStation.populate('createdBy', 'name email');

    res.json({
      message: 'Charging station updated successfully',
      chargingStation
    });
  } catch (error) {
    console.error('Update charging station error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid charging station ID' });
    }
    res.status(500).json({ message: 'Server error updating charging station' });
  }
};

exports.deleteChargingStation = async (req, res) => {
  try {
    const chargingStation = await ChargingStation.findById(req.params.id);

    if (!chargingStation) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    // Check if user owns the charging station or is admin
    if (chargingStation.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this charging station' });
    }

    await ChargingStation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Charging station deleted successfully' });
  } catch (error) {
    console.error('Delete charging station error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid charging station ID' });
    }
    res.status(500).json({ message: 'Server error deleting charging station' });
  }
};
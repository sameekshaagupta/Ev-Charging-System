const express = require('express');
const { body } = require('express-validator');
const chargingStationController = require('../controllers/chargingStationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const chargingStationValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('status')
    .isIn(['Active', 'Inactive', 'Maintenance'])
    .withMessage('Status must be Active, Inactive, or Maintenance'),
  body('powerOutput')
    .isFloat({ min: 1, max: 350 })
    .withMessage('Power output must be between 1 and 350 kW'),
  body('connectorType')
    .isIn(['Type 1', 'Type 2', 'CHAdeMO', 'CCS', 'Tesla Supercharger'])
    .withMessage('Invalid connector type')
];

// All routes require authentication
router.use(auth);

// Routes
router.post('/', chargingStationValidation, chargingStationController.createChargingStation);
router.get('/', chargingStationController.getAllChargingStations);
router.get('/:id', chargingStationController.getChargingStationById);
router.put('/:id', chargingStationValidation, chargingStationController.updateChargingStation);
router.delete('/:id', chargingStationController.deleteChargingStation);

module.exports = router;
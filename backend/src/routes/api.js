const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const controllers = require('../controllers/apiControllers');

// Public Auth routes
router.post('/auth/login', controllers.login);

// Protected routes
router.use(authenticateToken);

// User Profile
router.get('/auth/me', controllers.getCurrentUser);

// Dashboard
router.get('/dashboard', controllers.getDashboardStats);

// Employees
router.get('/employees', controllers.getEmployees);
router.get('/employees/:id', controllers.getEmployeeById);
router.post('/employees', controllers.createEmployee);
router.put('/employees/:id', controllers.updateEmployee);
router.delete('/employees/:id', controllers.deleteEmployee);
router.post('/employees/bulk-upload', controllers.bulkUploadEmployees);

// Seats
router.get('/seats', controllers.getSeats);
router.post('/seats/assign', controllers.assignSeat);
router.post('/seats/transfer', controllers.transferSeat);
router.post('/seats/release', controllers.releaseSeat);

// Projects
router.get('/projects', controllers.getProjects);
router.post('/projects', controllers.createProject);

// Floors & Zones
router.get('/floors-zones', controllers.getFloorsAndZones);

// AI Chatbot
router.post('/ai/chat', controllers.processAIChat);

module.exports = router;

const router = require('express').Router();
const authRoutes = require('./authRoutes');
const membershipRoutes = require('./membershipRoutes');
const clubRoutes = require('./clubRoutes');
const courtRoutes = require('./courtRoutes');
const bookingRoutes = require('./bookingRoutes');
const matchRoutes = require('./matchRoutes');

router.use('/auth', authRoutes);
router.use('/memberships', membershipRoutes);
router.use('/clubs', clubRoutes);
router.use('/courts', courtRoutes);
router.use('/bookings', bookingRoutes);
router.use('/matches', matchRoutes);

module.exports = router;

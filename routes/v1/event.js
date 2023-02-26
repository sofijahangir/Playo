const express = require("express");
const router = express.Router();

const eventController = require('../../controllers/v1/event');
const auth = require('../../middleware/auth');

router.post('/event/create',auth.authenticate, eventController.create);
router.post('/event/join/:event_id',auth.authenticate, eventController.joinEvent);

router.get('/event/details/:event_id',auth.authenticate, eventController.getEventDetails);
router.get('/event/respond/:join_id',auth.authenticate, eventController.respondToJoinRequest);
router.get('/event/getAll',auth.authenticate, eventController.getAllEvents);
router.get('/event/getPlayers/:event_id', auth.authenticate, eventController.getEventPlayers);


router.put('/event/cancelJoin/:user_id/:event_id', auth.authenticate, eventController.cancelJoinRequest);
router.put('/event/acceptJoin/:user_id/:event_id', auth.authenticate, eventController.acceptJoinRequest);
router.put('/event/rejectJoin/:user_id/:event_id', auth.authenticate, eventController.rejectJoinRequest);

module.exports = router;
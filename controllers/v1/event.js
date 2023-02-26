
const Event = require("../../src/Model/v1/Event");

const User = require('../../src/Model/v1/User');


exports.create = async (req, res) => {
  try {
    const db = req.con;

    const { name, location, eventTime, maxPlayers, description } = req.body;
    const organizerId = req.user_id;

    console.log("Organizer ID: ", organizerId);

    const newEvent = await Event.createEvent(db, name, description, location, eventTime, maxPlayers, organizerId);

    res.json({
      status: true,
      message: "Event created successfully",
      data: {
        title: name,
        description,
        location,
        date_time: eventTime,
        max_players: maxPlayers,
        organizer_id: organizerId,
      }
    });
  } catch (err) {
    res.json({
      status: false,
      message: "Something went wrong",
      error: err
    })
  }
}


exports.joinEvent = async (req, res) => {
  try {
    const db = req.con;
    const { user_id } = req;
    const { event_id } = req.params;

    console.log("User ID: ", user_id);

    // Check if user has already joined the event
    const existingJoin = await Event.getByUserAndEvent(db, user_id, event_id);
    if (existingJoin) {
      return res.status(400).json({ error: 'User has already joined the event' });
    }

    // Check if event has reached its maximum number of players
    const event = await Event.getEventById(db, event_id);
    if (event.max_players <= event.num_players) {
      return res.status(400).json({ error: 'Event is full' });
    }


    // Create join record
    const join = await Event.createJoinRequest(db, user_id, event_id);

    res.json({ 
      status: true, 
      message: 'Join request created successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};


exports.getEventDetails = async (req, res) => {
  try {
    const db = req.con;
    const { event_id } = req.params;
    const { user_id } = req;

    // Get event details
    const event = await Event.getEventById(db, event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user has joined the event
    const join = await Event.getByUserAndEvent(db,user_id, event_id);

    res.json({ status: true, message: 'Event details retrieved successfully', data: { event, join } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};



exports.respondToJoinRequest = async (req, res) => {
  try {
    const db = req.con;

    const { join_id } = req.params;
    const { user_id } = req;
    const { status } = req.body;

    console.log("User ID: ", user_id);

    // Check if the user is the event organizer
    const join = await Event.getEventByJoinId(db,join_id);
    const event = await Event.getEventById(db,join.event_id);

    if (event.organizer_id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update the join record with the response
    await Event.updateStatus(db, join_id, status);

    res.json({ status: true, message: 'Join request response updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};



exports.getAllEvents = async (req, res) => {
  try {
    const db = req.con;
    const { user_id } = req;

    // Get all events sorted by start time
    const events = await Event.getAllUpcomingSortedByTime(db);

    // Add a "join_status" field to each event indicating whether the user has requested to join the event
    for (const event of events) {
      const join = await Event.getByUserAndEvent(db, user_id, event.id);
      if (join) {
        event.join_status = join.status;
      } else {
        event.join_status = 'not_requested';
      }
    }

    res.json({ status: true, events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};


exports.cancelJoinRequest = async (req, res) => {
  try {
    const db = req.con;
    const { user_id, event_id } = req.params;

    // Check if the user has already been accepted or rejected for the join request
    const joinRequest = await Event.getJoinRequest(db, user_id, event_id);
    if (!joinRequest || joinRequest.status !== "pending") {
      return res.json({
        status: false,
        message: "User has not requested to join the event or request has already been processed",
      });
    }

    // Check if the event has not started yet
    const event = await Event.getEventById(db, event_id);
    const startTime = new Date(event.start_time);
    const currentTime = new Date();
    if (startTime < currentTime) {
      return res.json({
        status: false,
        message: "Event has already started. Cannot cancel join request.",
      });
    }

    // Cancel the join request
    const result = await Event.cancelJoinRequest(db, user_id, event_id);
    if (result.affectedRows === 1) {
      return res.json({
        status: true,
        message: "Join request cancelled successfully.",
      });
    } else {
      return res.json({
        status: false,
        message: "Unable to cancel join request. Please try again later.",
      });
    }
  } catch (err) {
    res.json({
      status: false,
      message: "Something went wrong",
      error: err,
    });
  }
};



exports.acceptJoinRequest = async (req, res) => {
  try {
    const db = req.con;
    const { user_id, event_id } = req.params;

    const joinRequest = await Event.getJoinRequest(db, user_id, event_id);
    if (!joinRequest || joinRequest.status !== "pending") {
      return res.json({
        status: false,
        message: "User has not requested to join the event or request has already been processed",
      });
    }

    const event = await Event.getEventById(db, event_id);
    const limit = event.max_players;
    const numJoined = await Event.getTotalJoined(db, event_id);
    if (numJoined >= limit) {
      return res.json({
        status: false,
        message: "Event is already full. Cannot accept join request.",
      });
    }

    // Accept the join request
    const result = await Event.acceptJoinRequest(db, user_id, event_id);
    if (result.affectedRows === 1) {
      return res.json({
        status: true,
        message: "Join request accepted successfully.",
      });
    } else {
      return res.json({
        status: false,
        message: "Unable to accept join request. Please try again later.",
      });
    }
  } catch (err) {
    res.json({
      status: false,
      message: "Something went wrong",
      error: err,
    });
  }
};



exports.rejectJoinRequest = async (req, res) => {
  try {
    const db = req.con;
    const { user_id,event_id } = req.params;

    const eventJoinRequest = await Event.getJoinRequest(db, user_id, event_id);

    if (!eventJoinRequest) {
      return res.status(404).json({ status: false, message: 'Join request not found' });
    }

    const event = await Event.getEventById(db, event_id);

    if (event.organizer_id !== user_id) {
      return res.status(401).json({ status: false, message: 'Unauthorized access' });
    }

    if (eventJoinRequest.status === 'rejected') {
      return res.status(400).json({ status: false, message: 'Join request has already been rejected' });
    }

    await Event.updateStatus(db, eventJoinRequest.id, 'rejected');

    return res.json({ status: true, message: 'Join request rejected successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Something went wrong',
      error: err
    });
  }
}


exports.getEventPlayers = async (req, res) => {
  try {
    const db = req.con;
    const { user_id } = req;
    const { event_id } = req.params;

    const event = await Event.getEventById(db,event_id,)
    if (!event) {
      return res.status(404).json({ status: false, message: 'Event not found' });
    }

    if (event.organizer_id !== user_id) {
      return res.status(401).json({ status: false, message: 'Unauthorized access' });

    }

    const players = await Event.getEventPlayers(db, event_id);

    return res.json({ status: true, data: players });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Something went wrong',
      error: err
    });
  }
}

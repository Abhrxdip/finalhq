const eventService = require('../services/eventService');
const { AppError, asyncHandler } = require('../utils/http');

const listEvents = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const events = await eventService.getEvents({ status: status || null });

  res.status(200).json({
    events,
  });
});

const getEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await eventService.getEventById(eventId);

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  res.status(200).json({ event });
});

module.exports = {
  listEvents,
  getEvent,
};

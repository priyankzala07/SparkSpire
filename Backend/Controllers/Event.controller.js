const mongoose = require('mongoose');
const eventModel = require('../Models/Events.model');
const Booking = require('../Models/Booking.model');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const GetAllEvents = async (req, res) => {
    try {
        const search = escapeRegex(String(req.query.search || '').slice(0, 100));

        const events = await eventModel.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ]
        });

        res.json(events);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const GetEventById = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        const event = await eventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const CreateEvent = async (req, res) => {
    try {

        const {
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            ticketPrice,
            image
        } = req.body;


        const event = await eventModel.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,   // ⭐ Important line
            ticketPrice,
            image
                });

        res.status(201).json(event);

    }  catch (error) {
    console.error("Create Event Error:", error);

    res.status(500).json({
        success: false,
        message: error.message
    });
}
};

const DeleteEvent = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        const hasActiveBookings = await Booking.exists({
            eventId: req.params.id,
            status: { $in: ['pending', 'confirmed'] }
        });
        if (hasActiveBookings) {
            return res.status(400).json({ message: 'Cannot delete an event with active bookings' });
        }
        const event = await eventModel.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const UpdateEvent = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        const event = await eventModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    GetAllEvents,
    GetEventById,
    CreateEvent,
    DeleteEvent,
    UpdateEvent
};

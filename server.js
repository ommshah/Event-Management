// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 27017;

// Connect to MongoDB (adjust your URI as needed)
mongoose.connect('mongodb://localhost/event_management', { useNewUrlParser: true, useUnifiedTopology: true });

// Event Schema
const eventSchema = new mongoose.Schema({
    name: String,
    date: String,
    description: String,
    attendees: [String]
});

const Event = mongoose.model('Event', eventSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/create', (req, res) => {
    res.sendFile(__dirname + '/views/create.html');
});

app.post('/create', async (req, res) => {
    const event = new Event(req.body);
    await event.save();
    res.redirect('/view');
});

app.get('/view', async (req, res) => {
    const events = await Event.find();
    res.send(`
        <h1>Events</h1>
        <ul>
            ${events.map(e => `<li><a href="/register/${e._id}">${e.name}</a></li>`).join('')}
        </ul>
        <a href="/">Home</a>
    `);
});

app.get('/register/:id', async (req, res) => {
    const event = await Event.findById(req.params.id);
    res.send(`
        <h1>Register for ${event.name}</h1>
        <form action="/register/${event._id}" method="POST">
            <input type="text" name="attendee" placeholder="Your Name" required>
            <button type="submit">Register</button>
        </form>
        <a href="/view">Back to Events</a>
    `);
});

app.post('/register/:id', async (req, res) => {
    const event = await Event.findById(req.params.id);
    event.attendees.push(req.body.attendee);
    await event.save();
    res.redirect('/view');
});

app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/views/contact.html');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

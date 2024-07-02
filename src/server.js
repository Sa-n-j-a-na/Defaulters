const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000; // Ensure this port is not in use by any other application

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

app.use(bodyParser.json());
app.use(cors());

app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    console.log('Received role:', role);
    console.log('Received login request:', { username, role });

    if (!['pe', 'mentor', 'hod'].includes(role)) {
        console.log('Access forbidden for role:', role); // Logging the role that caused the issue
        return res.status(403).json({ message: 'Access forbidden for this role' });
    }

    try {
        await client.connect();
        const database = client.db('defaulterTrackingSystem');
        
        let collection;
        if (role === 'pe') {
            collection = database.collection('pt');
        } else if (role === 'mentor') {
            collection = database.collection('mentors');
        } else if (role === 'hod') {
            collection = database.collection('hod');
        } else {
            return res.status(403).json({ message: 'Access forbidden for this role' });
        }

        const query = { username: username, password: password };
        const user = await collection.findOne(query);

        if (user) {
            res.status(200).json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
});

app.get('/mentors', async (req, res) => {
    const { department, year } = req.query;

    try {
        await client.connect();
        const database = client.db('defaulterTrackingSystem');
        const mentors = database.collection('mentor_db');
        const query = { department, year };
        const mentorsList = await mentors.find(query).toArray();

        res.status(200).json(mentorsList);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log('Server is running on http://localhost:5000');

});

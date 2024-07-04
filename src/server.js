const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000;

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

app.use(bodyParser.json());
app.use(cors());

app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;

    if (!['pe', 'mentor', 'hod'].includes(role)) {
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

        const query = { username, password };
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

app.post('/latecomers', async (req, res) => {
    const formData = req.body;
    console.log('Received latecomers data:', formData); // Check if data is received correctly

    try {
        await client.connect();
        const database = client.db('defaulterTrackingSystem');
        const latecomersCollection = database.collection('latecomers_db');

        await latecomersCollection.insertOne(formData);
        console.log("Latecomers data inserted");

        res.status(200).json({ message: 'Latecomers data submitted successfully' });
    } catch (error) {
        console.error("Error submitting latecomers data:", error);
        res.status(500).json({ message: 'Failed to submit latecomers data' });
    } finally {
        await client.close();
    }
});


app.post('/dresscode', async (req, res) => {
    const formData = req.body;
    console.log('Received dresscode data:', formData); // Check if data is received correctly

    try {
        await client.connect();
        const database = client.db('defaulterTrackingSystem');
        const disciplineCollection = database.collection('discipline_db');

        await disciplineCollection.insertOne(formData);
        console.log("Discipline data inserted");

        res.status(200).json({ message: 'Discipline data submitted successfully' });
    } catch (error) {
        console.error("Error submitting discipline data:", error);
        res.status(500).json({ message: 'Failed to submit discipline data' });
    } finally {
        await client.close();
    }
});

app.get('/:defaulterType', async (req, res) => {
    const { defaulterType } = req.params;
    const { fromDate, toDate } = req.query;
    try {
        await client.connect();
        const database = client.db('defaulterTrackingSystem');
        let collection;

        if (defaulterType === 'latecomers') {
            collection = database.collection('latecomers_db');
        } else if (defaulterType === 'dresscode') {
            collection = database.collection('discipline_db');
        } else {
            return res.status(400).json({ message: 'Invalid defaulterType' });
        }
        const startDate = new Date(`${fromDate}T00:00:00.000Z`).toISOString();;
        const endDate = new Date(`${toDate}T23:59:59.999Z`).toISOString();;
  
        const query = {
            entryDate: {
                $gte: startDate,
                $lte: endDate
            }
        };
        console.log(query);
        const reportData = await collection.find(query).toArray();
        console.log('Fetched report data:', reportData);
        res.json(reportData);
    } catch (error) {
        console.error('Error fetching report data:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

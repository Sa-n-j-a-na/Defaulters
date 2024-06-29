const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000;

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(cors());

app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    console.log('Received role:', role); 
    if (role !== 'pt-sir') {
        return res.status(403).json({ message: 'Access forbidden for this role' });
    }

    try {
        await client.connect();
        const database = client.db('defaulterTrackingSystem');
        const collection = database.collection('pt');

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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

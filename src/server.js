
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000;

const uri = "mongodb+srv://defaulter:defaulter@dts.mkkmthk.mongodb.net/";
const client = new MongoClient(uri);

let mongoClient = null;

const connectToDatabase = async () => {
    if (!mongoClient) {
        mongoClient = await client.connect();
    }
    return mongoClient;
};

app.use(bodyParser.json());
app.use(cors());

app.get('/mentors', async (req, res) => {
    const { dept } = req.query;

    try {
        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');
        const mentors = await database.collection('mentor').find({ dept }).toArray();
        res.json(mentors);
    } catch (error) {
        console.error('Error fetching mentor names:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;

    if (!['pe', 'mentor', 'hod'].includes(role)) {
        return res.status(403).json({ message: 'Access forbidden for this role' });
    }

    try {
        const client = await connectToDatabase();
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
        console.log(user);
        const { dept , mentorName } = user;
        if (user) {
            res.status(200).json({ message: 'Login successful', user ,dept,mentorName});
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/student', async (req, res) => {
    const { rollNumber } = req.query;
    console.log(rollNumber); // This should log the rollNumber passed from the frontend
    try {
      const client = await connectToDatabase();
      const database = client.db('defaulterTrackingSystem');
      const student = database.collection('student');
      const query = {};
      if (rollNumber) {
        query.rollNumber = rollNumber;
      }
      const datas = await student.find(query).toArray();
      res.status(200).json(datas);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/mentor', async (req, res) => {
    const { rollNumber } = req.query;

    try {
        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');
        const mentorCollection = database.collection('mentor');

        const query = { "students.rollNumber": rollNumber };

        const mentorData = await mentorCollection.findOne(query);
        res.status(200).json(mentorData);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/hod/mentorOverview', async (req, res) => {
    const { dept } = req.query;
    console.log('Request received for dept:', dept);
    try {
      const client = await connectToDatabase();
      const database = client.db('defaulterTrackingSystem');
  
      const mentors = await database.collection('mentor').find({ dept: dept }).toArray();
      const overviewData = [];
  
      for (const mentor of mentors) {
        const mentorName = mentor.mentorName;
        const latecomersCount = await database.collection('latecomers_db').countDocuments({ mentorName: mentorName });
        const disciplineCount = await database.collection('discipline_db').countDocuments({ mentorName: mentorName });
        const totalDefaulters = latecomersCount + disciplineCount;
  
        overviewData.push({ mentorName, totalDefaulters });
      }
      console.log(overviewData);
      res.json(overviewData);
    } catch (error) {
      console.error('Error fetching mentor overview:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
app.get('/checkEntry', async (req, res) => {
    const { rollNumber, entryDate, defaulterType } = req.query;
    console.log(`${rollNumber} ${entryDate} ${defaulterType}`);
    
    try {
      const client = await connectToDatabase();
      const db = client.db('defaulterTrackingSystem');
      let collectionName = '';
  
      if (defaulterType === 'latecomers') {
        collectionName = 'latecomers_db';
      } else if (defaulterType === 'dresscode') {
        collectionName = 'discipline_db';
      }
  
      if (!collectionName) {
        return res.status(400).json({ exists: false });
      }
  
      const collection = db.collection(collectionName);
  
      // Extract date part from entryDate
      const date = new Date(entryDate);
      const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999)).toISOString();
      console.log(startOfDay+''+endOfDay);
      const existingEntry = await collection.findOne({
        rollNumber: rollNumber,
        entryDate: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
  
      console.log('Existing Entry:', existingEntry); // Log the result of the find query
      res.json({ exists: !!existingEntry });
    } catch (error) {
      console.error('Error checking existing entry:', error);
      res.status(500).json({ exists: false });
    }
  });
  
app.post('/latecomers', async (req, res) => {
    const formData = req.body;

    try {
        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');
        const latecomersCollection = database.collection('latecomers_db');

        await latecomersCollection.insertOne(formData);
        console.log("Latecomers data inserted");

        res.status(200).json({ message: 'Latecomers data submitted successfully' });
    } catch (error) {
        console.error("Error submitting latecomers data:", error);
        res.status(500).json({ message: 'Failed to submit latecomers data' });
    }
});

app.post('/dresscode', async (req, res) => {
    const formData = req.body;

    try {
        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');
        const disciplineCollection = database.collection('discipline_db');

        await disciplineCollection.insertOne(formData);
        console.log("Discipline data inserted");

        res.status(200).json({ message: 'Discipline data submitted successfully' });
    } catch (error) {
        console.error("Error submitting discipline data:", error);
        res.status(500).json({ message: 'Failed to submit discipline data' });
    }
});

app.get('/:defaulterType', async (req, res) => {
    const { defaulterType } = req.params;
    const { fromDate, toDate } = req.query;
    try {
        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');
        let collection;

        if (defaulterType === 'latecomers') {
            collection = database.collection('latecomers_db');
        } else if (defaulterType === 'dresscode') {
            collection = database.collection('discipline_db');
        } else {
            return res.status(400).json({ message: 'Invalid defaulterType' });
        }
        const startDate = new Date(`${fromDate}T00:00:00.000Z`).toISOString();
        const endDate = new Date(`${toDate}T23:59:59.999Z`).toISOString();
  
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
    }
});

app.get('/mentorReport/:mentorName', async (req, res) => {
    const { mentorName } = req.params;
    console.log(mentorName);
    const { fromDate, toDate } = req.query;

    try {
        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');

        const startDate = new Date(`${fromDate}T00:00:00.000Z`).toISOString();
        const endDate = new Date(`${toDate}T23:59:59.999Z`).toISOString();

        const query = {
            entryDate: {
                $gte: startDate,
                $lte: endDate
            },
            mentor: mentorName
        };

        const disciplineData = await database.collection('discipline_db').find(query).toArray();
        const latecomersData = await database.collection('latecomers_db').find(query).toArray();

        const combinedData = [...disciplineData, ...latecomersData];

        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching report data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const fetchRepeatedDefaulters = async (type, startDate, endDate) => {
    try {
        console.log(`Fetching repeated defaulters (${type}) for dates ${startDate} to ${endDate}`);

        const pipeline = [
            {
                $match: {
                    entryDate: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: '$rollNumber',
                    count: { $sum: 1 },
                    documents: { $push: '$$ROOT' }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            },
            {
                $unwind: '$documents'
            },
            {
                $replaceRoot: { newRoot: '$documents' }
            }
        ];

        let collectionName = '';
        if (type === 'dresscode') {
            collectionName = 'discipline_db';
        } else if (type === 'latecomers') {
            collectionName = 'latecomers_db';
        }

        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');
        const result = await database.collection(collectionName).aggregate(pipeline).toArray();

        console.log(`Fetched ${result.length} documents for ${type}`);

        return result;
    } catch (error) {
        console.error(`Error fetching repeated defaulters (${type}):`, error);
        return [];
    }
};


app.get('/hodRepeatedDefaulters/:dept/:defaulterType/:fromDate/:toDate', async (req, res) => {
    const { dept, defaulterType, fromDate, toDate } = req.params;

    try {
        const startDate = new Date(`${fromDate}T00:00:00.000Z`).toISOString();
        const endDate = new Date(`${toDate}T23:59:59.999Z`).toISOString();

        let Data = [];
        if (defaulterType === 'dresscode' || defaulterType === 'latecomers') {
            Data = await fetchRepeatedDefaultersByDept(defaulterType, dept, startDate, endDate);
        }
        if (defaulterType === 'both') {
            Data = await fetchRepHod(dept, startDate, endDate);
        }
        res.json(Data);
    } catch (error) {
        console.error(`Error fetching repeated defaulters for department ${dept}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const fetchRepHod = async (dept, startDate, endDate) => {
    try {
        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');

        const disciplineCollection = database.collection('discipline_db');
        const latecomersCollection = database.collection('latecomers_db');

        const disciplineResults = await disciplineCollection.find({
            entryDate: {
                $gte: startDate,
                $lte: endDate
            },
            department: dept
        }).toArray();

        const latecomersResults = await latecomersCollection.find({
            entryDate: {
                $gte: startDate,
                $lte: endDate
            },
            department: dept
        }).toArray();

        const allDefaulterData = [...disciplineResults, ...latecomersResults];

        // Create an object to collect entries by rollNumber
        const rollNumberMap = {};
        
        // Iterate over allDefaulterData to group entries by rollNumber
        allDefaulterData.forEach(entry => {
            if (!rollNumberMap[entry.rollNumber]) {
                rollNumberMap[entry.rollNumber] = [];
            }
            rollNumberMap[entry.rollNumber].push(entry);
        });

        // Filter out groups with only one entry (no duplicates)
        const repeatedDefaulters = Object.values(rollNumberMap)
            .filter(entries => entries.length > 1)
            .flatMap(entries => entries);

        console.log(`Fetched ${repeatedDefaulters.length} repeated defaulters for department ${dept}`);
        console.log(repeatedDefaulters);
        return repeatedDefaulters;
    } catch (error) {
        console.error(`Error fetching repeated defaulters by department ${dept}:`, error);
        return [];
    }
};

const fetchRepeatedDefaultersByDept = async (defaulterType, dept, startDate, endDate) => {
    try {
        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');

        const collection = defaulterType === 'latecomers' ? database.collection('latecomers_db') : database.collection('discipline_db');

        const results = await collection.find({
            entryDate: {
                $gte: startDate,
                $lte: endDate
            },
            department: dept
        }).toArray();

        // Create an object to collect entries by rollNumber
        const rollNumberMap = {};

        // Iterate over results to group entries by rollNumber
        results.forEach(entry => {
            if (!rollNumberMap[entry.rollNumber]) {
                rollNumberMap[entry.rollNumber] = [];
            }
            rollNumberMap[entry.rollNumber].push(entry);
        });

        // Filter out groups with only one entry (no duplicates)
        const repeatedDefaulters = Object.values(rollNumberMap)
            .filter(entries => entries.length > 1)
            .flatMap(entries => entries);

        console.log(`Fetched ${repeatedDefaulters.length} repeated defaulters for department ${dept}`);
        console.log(repeatedDefaulters);
        return repeatedDefaulters;
    } catch (error) {
        console.error(`Error fetching repeated defaulters for department ${dept}:`, error);
        return [];
    }
};

const fetchRepeatedDefaultersByMentor = async (defaulterType, mentorName, startDate, endDate) => {
    try {
        const pipeline = [
            {
                $match: {
                    entryDate: {
                        $gte: startDate,
                        $lte: endDate
                    },
                    mentor: mentorName
                }
            },
            {
                $group: {
                    _id: '$rollNumber',
                    count: { $sum: 1 },
                    documents: { $push: '$$ROOT' }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            },
            {
                $unwind: '$documents'
            },
            {
                $replaceRoot: { newRoot: '$documents' }
            }
        ];

        let collectionName = '';
        if (defaulterType === 'dresscode') {
            collectionName = 'discipline_db';
        } else if (defaulterType === 'latecomers') {
            collectionName = 'latecomers_db';
        }

        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');
        const result = await database.collection(collectionName).aggregate(pipeline).toArray();

        console.log(`Fetched ${result.length} documents for ${defaulterType} by mentor ${mentorName}`);

        return result;
    } catch (error) {
        console.error(`Error fetching repeated defaulters (${defaulterType}) by mentor ${mentorName}:`, error);
        return [];
    }
};

app.get('/mentorRepeatedDefaulters/:mentorName/:defaulterType/:fromDate/:toDate', async (req, res) => {
    const { mentorName, defaulterType, fromDate, toDate } = req.params;

    try {
        const startDate = new Date(`${fromDate}T00:00:00.000Z`).toISOString();
        const endDate = new Date(`${toDate}T23:59:59.999Z`).toISOString();

        let Data = [];
        if (defaulterType === 'dresscode' || defaulterType === 'latecomers') {
            Data = await fetchRepeatedDefaultersByMentor(defaulterType,mentorName, startDate, endDate);
        }
        if (defaulterType === 'both') {
            Data = await fetchRepMen(mentorName, startDate, endDate);
        }
        res.json(Data);
    } catch (error) {
        console.error(`Error fetching repeated defaulters for mentor ${mentorName}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const fetchRepMen = async (mentorName, startDate, endDate) => {
    try {
        const client = await connectToDatabase();
        const database = client.db('defaulterTrackingSystem');

        const disciplineCollection = database.collection('discipline_db');
        const latecomersCollection = database.collection('latecomers_db');

        const disciplineResults = await disciplineCollection.find({
            entryDate: {
                $gte: startDate,
                $lte: endDate
            },
            mentor: mentorName
        }).toArray();

        const latecomersResults = await latecomersCollection.find({
            entryDate: {
                $gte: startDate,
                $lte: endDate
            },
            mentor: mentorName
        }).toArray();

        const allDefaulterData = [...disciplineResults, ...latecomersResults];

        // Create an object to collect entries by rollNumber
        const rollNumberMap = {};
        
        // Iterate over allDefaulterData to group entries by rollNumber
        allDefaulterData.forEach(entry => {
            if (!rollNumberMap[entry.rollNumber]) {
                rollNumberMap[entry.rollNumber] = [];
            }
            rollNumberMap[entry.rollNumber].push(entry);
        });

        // Filter out groups with only one entry (no duplicates)
        const repeatedDefaulters = Object.values(rollNumberMap)
            .filter(entries => entries.length > 1)
            .flatMap(entries => entries);

        console.log(`Fetched ${repeatedDefaulters.length} repeated defaulters for mentor ${mentorName}`);
        console.log(repeatedDefaulters);
        return repeatedDefaulters;
    } catch (error) {
        console.error(`Error fetching repeated defaulters by mentor ${mentorName}:`, error);
        return [];
    }
};


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

process.on('SIGINT', async () => {
    if (mongoClient) {
        await mongoClient.close();
    }
    process.exit(0);
});
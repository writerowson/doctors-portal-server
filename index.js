const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const res = require('express/lib/response');
const port = process.env.PORT || 5000
// use middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.ti8fd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const serviceCollection = client.db('dentist').collection('service')
        const bookingCollection = client.db('dentist').collection('booking')


        //  Api naming convention
        // *app.get('/booking) get all bokking or get plural booking
        // *app.get('/booking/:id) get a specific booking
        // *app.post('/booking) add a new booking
        // *app.delete ('/booking/:id) get a specific booking delete
        // *app.patch('/booking/:id) update booking
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray();
            res.send(services)
            console.log(7 > 6 && 8 < 6 && 6 > 4)
        });

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            //  to handle user entry 
            const query = { treatment: booking.treatment, date: booking.date, patient: booking.patient }
            const result = await bookingCollection.insertOne(booking)
        })




    }
    finally {

    }
}

// video 7.53
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Doctor portal running')
})

app.listen(port, () => {
    console.log(`server is listening ${port}`)
})

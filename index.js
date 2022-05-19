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
        const userCollection = client.db('dentist').collection('user')


        //  Api naming convention
        // *app.get('/booking) get all booking or get plural booking
        // *app.get('/booking/:id) get a specific booking
        // *app.post('/booking) add a new booking
        // *app.delete ('/booking/:id) get a specific booking delete
        // *app.put('/booking/:id)upsert =update (if exists)/insert(if doesn't)
        // *app.patch('/booking/:id) update booking
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray();
            res.send(services)
            console.log(7 > 6 && 8 < 6 && 6 > 4)
        });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            };

            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })


        app.get('/available', async (req, res) => {
            const date = req.query.date || 'May 11, 2022';

            // step 1 get all services
            const services = await serviceCollection.find().toArray()
            // step 2 get the booking of that day
            const query = { date: date }
            const bookings = await bookingCollection.find(query).toArray()
            // step:3 for each service ;
            services.forEach(service => {
                // step 4 : find bookings for that service
                const serviceBookings = bookings.filter(booking => booking.treatment === service.name)
                // step 5 : select slots for the service Booking 
                const bookedSlots = serviceBookings.map(book => book.slot)
                // step 6 : select those slots that are not is bookedSlots

                const available = service.slots.filter(slot => !bookedSlots.includes(slot));

                service.slots = available
                // service.booked = booked
                // --------or------
                // service.booked = serviceBookings.map(s => s.slot)
            })
            res.send(services)
        })

        app.get('/booking', async (req, res) => {
            const patient = req.query.patient
            const query = { patient: patient };
            const bookings = await bookingCollection.find(query).toArray()
            res.send(bookings)
        })

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            //  to handle user entry 
            const query = { treatment: booking.treatment, date: booking.date, patient: booking.patient }
            const exists = await bookingCollection.findOne(query)
            if (exists) {
                return res.send({ success: false, booking: exists })
            }
            const result = await bookingCollection.insertOne(booking)
            res.send({ success: true, result })
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

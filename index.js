const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;


require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kytmz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        const database = client.db('autoMart');
        const carCollections = database.collection('cars');
        const cartCollection = database.collection('orderCart');
        const orderCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('review');

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });
        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.json(result);
        });

        app.get('/cars', async (req, res) => {
            const cursor = carCollections.find({}).limit(6);
            const cars = await cursor.toArray();
            res.send(cars);
        });
        app.get('/products', async (req, res) => {
            const cursor = carCollections.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carCollections.deleteOne(query);
            res.json(result);
        })
        app.post('/addservice', async (req, res) => {
            const service = req.body;
            const result = await carCollections.insertOne(service);
            res.json(result);
        });
        app.post('/cart', async (req, res) => {
            const order = req.body;
            const result = await cartCollection.insertOne(order);
            res.json(result);
        });
        app.get('/cart', async (req, res) => {
            const cursor = cartCollection.find({});
            const carts = await cursor.toArray();
            res.send(carts);
        });
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id };
            const result = await cartCollection.deleteOne(query);
            res.json(result);
        });
        app.post('/orders', async (req, res) => {
            const order = req.body;
            order.createdAt = new Date();
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = { email: email };
            console.log(query);
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        })
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);


        })

    }
    finally {
        // await client.close();
    }
};
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running....');
});
app.listen(port, () => {
    console.log('Running Port', port);
});
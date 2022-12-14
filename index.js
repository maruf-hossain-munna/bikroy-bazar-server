const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middle wares
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jfb2tzn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run() {
    try {
        const CategoriesCollection = client.db("bikroyBazar").collection("categories");
        const productsCollection = client.db("bikroyBazar").collection("products");
        const usersCollection = client.db("bikroyBazar").collection("users");
        const bookingProductCollection = client.db("bikroyBazar").collection("bookingProducts");

        app.get('/categories', async (req, res) => {
            const query = {};
            const cursor = CategoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories)
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { categoryId: id }
            const result = await productsCollection.find(query).toArray();
            // console.log(result);
            res.send(result)
        })

        app.post('/bookingProducts', async(req, res) =>{
            const bookingProduct = req.body;
            console.log(bookingProduct)
            const result = await bookingProductCollection.insertOne(bookingProduct);
            res.send(result)
        })

        app.get('/bookingProducts/', async(req, res) =>{
            const email = req.query.email;
            const query = { email : email };
            const bookingProduct = await bookingProductCollection.find(query).toArray();
            res.send(bookingProduct)
        })

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result)
        })

        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products)
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query)
            res.send(product);
        })



        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })

        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.put('/users/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })



        // app.get('/users/seller/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email }
        //     const user = await usersCollection.findOne(query);
        //     res.send({ isSeller: user?.role === 'seller' });
        // })

        // seller vs buyer

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller : user?.role === 'Seller' });
        })

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer : user?.role === 'Buyer' });
        })

        app.delete('/users/seller/:id', async(req, res) =>{
            const id = req.params.id;
            const filter = { _id: ObjectId(id)};
            console.log(filter);
            const result = await usersCollection.deleteOne(filter);
            console.log(result);
            res.send(result)
        })

        app.get('/user/seller', async (req, res) => {
            const result = await usersCollection.find({ role: 'Seller' }).toArray();
            res.send(result)
        })

        app.get('/user/buyer', async (req, res) => {
            const result = await usersCollection.find({ role: 'Buyer' }).toArray();
            res.send(result)
        })

        app.put('/user/seller/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'seller'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
    }

    finally {

    }
}
run().catch(err => console.error(err))



app.get('/', (req, res) => {
    res.send('Bikroy bazar server is running');
});

app.listen(port, () => {
    console.log(`This server running on ${port}`);
})
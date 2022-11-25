const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middle wares
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jfb2tzn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run () {
    try{
        const CategoriesCollection = client.db("bikroyBazar").collection("categories");
        const productsCollection = client.db("bikroyBazar").collection("products");

        app.get('/categories', async (req, res) =>{
            const query = {};
            const cursor = CategoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories)
        })

        app.post('/products', async(req, res) =>{
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result)
        })
    }

    finally{

    }
}
run().catch(err => console.error(err))



app.get('/', (req, res) => {
    res.send('Bikroy bazar server is running');
});

app.listen(port, () => {
    console.log(`This server running on ${port}`);
})
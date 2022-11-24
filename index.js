const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middle wares
app.use(cors());
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Bikroy bazar server is running');
});

app.listen(port, () => {
    console.log(`This server running on ${port}`);
})
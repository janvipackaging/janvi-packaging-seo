require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// --- Mongoose Connection ---
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => console.log("Connected successfully to MongoDB using Mongoose"))
    .catch(err => {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    });

// --- Mongoose Schemas and Models ---
const productSchema = new mongoose.Schema({
    name: String,
    slug: String,
    description: String,
    features: [String],
    templateName: String
});
const locationSchema = new mongoose.Schema({
    city: String,
    slug: String,
    state: String,
    country: String
});
const Product = mongoose.model('Product', productSchema, 'products');
const Location = mongoose.model('Location', locationSchema, 'locations');

// --- Homepage Route ---
app.get('/', (req, res) => {
    res.render('index');
});

// --- Dynamic Product Route ---
app.get('/products/:productSlug/:citySlug', async (req, res) => {
    try {
        const { productSlug, citySlug } = req.params;
        const product = await Product.findOne({ slug: productSlug });
        const location = await Location.findOne({ slug: citySlug });

        if (!product || !location) {
            return res.status(404).send('Page not found');
        }
        
        const viewToRender = product.templateName ? product.templateName : 'product_page';
        res.render(viewToRender, { product, location });

    } catch (error) {
        console.error("An error occurred during the request:", error);
        res.status(500).send('An error occurred');
    }
});

// --- Export the app for Vercel (This replaces app.listen) ---
module.exports = app;
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { SitemapStream } = require('sitemap');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => console.log("Connected successfully to MongoDB using Mongoose"))
    .catch(err => {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    });

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

app.get('/', (req, res) => {
    res.render('index');
});

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

app.get('/sitemap.xml', async (req, res) => {
    res.header('Content-Type', 'application/xml');
    try {
        const smStream = new SitemapStream({ hostname: 'https://cities.janvipackaging.online' });
        smStream.pipe(res);
        smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
        const products = await Product.find({});
        const locations = await Location.find({});
        for (const product of products) {
            for (const location of locations) {
                smStream.write({
                    url: `/products/${product.slug}/${location.slug}`,
                    changefreq: 'weekly',
                    priority: 0.8
                });
            }
        }
        smStream.end();
    } catch (error) {
        console.error("Sitemap generation error:", error);
        res.status(500).end();
    }
});

module.exports = app;

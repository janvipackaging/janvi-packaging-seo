require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { SitemapStream } = require('sitemap');

const app = express();
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
const productSchema = new mongoose.Schema({ name: String, slug: String, description: String, features: [String], templateName: String });
const locationSchema = new mongoose.Schema({ city: String, slug: String, state: String, country: String });
const Product = mongoose.model('Product', productSchema, 'products');
const Location = mongoose.model('Location', locationSchema, 'locations');

// --- Standard Routes ---
app.get('/', (req, res) => { res.render('index'); });

app.get('/products/:productSlug/:citySlug', async (req, res) => {
    try {
        const { productSlug, citySlug } = req.params;
        const product = await Product.findOne({ slug: productSlug });
        const location = await Location.findOne({ slug: citySlug });
        if (!product || !location) { return res.status(404).send('Page not found'); }
        const viewToRender = product.templateName ? product.templateName : 'product_page';
        res.render(viewToRender, { product, location });
    } catch (error) {
        console.error("Request error:", error);
        res.status(500).send('An error occurred');
    }
});

// ======================================================================
// =================== EFFICIENT SITEMAP LOGIC ==========================
// ======================================================================

// --- ROUTE 1: The Sitemap Index File ---
// This is a "table of contents" for your other sitemaps. It's very fast.
app.get('/sitemap.xml', async (req, res) => {
    res.header('Content-Type', 'application/xml');
    try {
        const smStream = new SitemapStream({ hostname: 'https://cities.janvipackaging.online' });
        smStream.pipe(res);
        const products = await Product.find({});
        products.forEach(product => {
            smStream.write({ url: `/sitemaps/${product.slug}.xml` });
        });
        smStream.end();
    } catch (error) {
        console.error("Sitemap index error:", error);
        res.status(500).end();
    }
});

// --- ROUTE 2: Dynamic Sitemaps for Each Product ---
// This creates a smaller sitemap for each product (e.g., /sitemaps/cpp-film.xml).
// Because each file is small, it generates quickly and avoids the timeout.
app.get('/sitemaps/:productSlug.xml', async (req, res) => {
    res.header('Content-Type', 'application/xml');
    const { productSlug } = req.params;
    try {
        const smStream = new SitemapStream({ hostname: 'https://cities.janvipackaging.online' });
        smStream.pipe(res);
        const locations = await Location.find({});
        locations.forEach(location => {
            smStream.write({
                url: `/products/${productSlug}/${location.slug}`,
                changefreq: 'weekly',
                priority: 0.8
            });
        });
        smStream.end();
    } catch (error) {
        console.error(`Error generating sitemap for ${productSlug}:`, error);
        res.status(500).end();
    }
});

// --- Export the app for Vercel ---
module.exports = app;
```eof

---
### ## 2. Deploy and Submit to Google

1.  **Deploy Your Final Changes:** Push the updated `index.js` file to GitHub.
    ```powershell
    git add .
    git commit -m "Implement sitemap index to prevent timeout"
    git push origin main
    ```
2.  **Test It:** Once deployed, test your new sitemap index by visiting:
    `https://cities.janvipackaging.online/sitemap.xml`
    You will see a small file listing the URLs for your individual product sitemaps (e.g., `/sitemaps/clear-bopp-film.xml`).

3.  **Submit the Correct URL to Google:**
    * Go to **Google Search Console**.
    * If you already submitted the old sitemap, remove it.
    * In the "Sitemaps" section, submit your **new sitemap index URL**:
      `sitemap.xml`
    * Click **"Submit"**.



Google will now fetch your main `sitemap.xml` file, see the list of your other sitemaps, and then crawl each of those smaller, faster files without timing out. This will solve the "Couldn't fetch" error for good.

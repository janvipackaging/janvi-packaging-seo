require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');

// --- Mongoose Schemas (must match your index.js) ---
const productSchema = new mongoose.Schema({ name: String, slug: String });
const locationSchema = new mongoose.Schema({ city: String, slug: String });
const Product = mongoose.model('Product', productSchema, 'products');
const Location = mongoose.model('Location', locationSchema, 'locations');

// --- Main function to generate all sitemaps ---
async function generateAllSitemaps() {
    console.log("Starting sitemap generation...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected for sitemap generation.");

    const products = await Product.find({});
    const locations = await Location.find({});
    
    const publicDir = path.join(__dirname, 'public');
    const sitemapsDir = path.join(publicDir, 'sitemaps');

    // Create directories if they don't exist
    if (!fs.existsSync(sitemapsDir)) {
        fs.mkdirSync(sitemapsDir, { recursive: true });
    }

    // --- Generate a sitemap for each product ---
    for (const product of products) {
        const smStream = new SitemapStream({ hostname: 'https://cities.janvipackaging.online' });
        
        locations.forEach(location => {
            smStream.write({
                url: `/products/${product.slug}/${location.slug}`,
                changefreq: 'weekly',
                priority: 0.8
            });
        });
        smStream.end();

        const sitemapContent = await streamToPromise(smStream);
        const filePath = path.join(sitemapsDir, `${product.slug}.xml`);
        fs.writeFileSync(filePath, sitemapContent);
        console.log(`Generated sitemap for ${product.name} at ${filePath}`);
    }

    // --- Generate the main sitemap index file ---
    const smIndexStream = new SitemapStream({ hostname: 'https://cities.janvipackaging.online' });
    products.forEach(product => {
        smIndexStream.write({ url: `/sitemaps/${product.slug}.xml` });
    });
    smIndexStream.end();

    const sitemapIndexContent = await streamToPromise(smIndexStream);
    const indexFilePath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(indexFilePath, sitemapIndexContent);
    console.log(`Generated sitemap index at ${indexFilePath}`);

    await mongoose.disconnect();
    console.log("Sitemap generation complete. Database disconnected.");
}

generateAllSitemaps().catch(err => {
    console.error("Fatal error during sitemap generation:", err);
    process.exit(1);
});

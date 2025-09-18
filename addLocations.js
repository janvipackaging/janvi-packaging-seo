require('dotenv').config();
const mongoose = require('mongoose');

// --- Define the Mongoose Model for Locations ---
// This schema must match your existing 'locations' collection schema.
const locationSchema = new mongoose.Schema({
    city: String,
    slug: { type: String, index: true }, // Indexing slug for faster queries
    state: String, // 'State' can also represent province, region, etc.
    country: String,
});
// Use 'Location' model if it doesn't exist, otherwise use the existing one.
const Location = mongoose.models.Location || mongoose.model('Location', locationSchema, 'locations');

// --- Helper function to create a URL-friendly slug ---
const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// --- A vastly expanded list of world cities, organized by country ---
// The script will automatically filter out 'India' from this list.
const citiesByCountry = [
    // --- North America (Heavily Expanded) ---
    { country: 'United States', state: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'Yonkers'] },
    { country: 'United States', state: 'California', cities: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Sacramento', 'Fresno', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Riverside', 'Santa Ana', 'Irvine'] },
    { country: 'United States', state: 'Texas', cities: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo'] },
    { country: 'United States', state: 'Florida', cities: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Fort Lauderdale', 'Tallahassee'] },
    { country: 'United States', state: 'Illinois', cities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford'] },
    { country: 'United States', state: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'] },
    { country: 'United States', state: 'Ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'] },
    { country: 'United States', state: 'Arizona', cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert'] },
    { country: 'United States', state: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver (WA)', 'Bellevue', 'Olympia'] },
    { country: 'United States', state: 'Massachusetts', cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell'] },
    { country: 'United States', state: 'Colorado', cities: ['Denver', 'Colorado Springs', 'Aurora (CO)', 'Fort Collins'] },
    { country: 'United States', state: 'Georgia', cities: ['Atlanta', 'Augusta', 'Columbus (GA)', 'Savannah', 'Macon'] },
    { country: 'United States', state: 'Nevada', cities: ['Las Vegas', 'Henderson', 'Reno', 'Carson City'] },
    { country: 'United States', state: 'North Carolina', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'] },
    { country: 'United States', state: 'Michigan', cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing'] },
    { country: 'United States', state: 'Virginia', cities: ['Virginia Beach', 'Norfolk', 'Richmond', 'Newport News', 'Alexandria'] },
    { country: 'United States', state: 'Maryland', cities: ['Baltimore', 'Annapolis', 'Frederick'] },
    { country: 'United States', state: 'Minnesota', cities: ['Minneapolis', 'Saint Paul', 'Rochester (MN)'] },
    { country: 'United States', state: 'Missouri', cities: ['Kansas City', 'St. Louis', 'Springfield (MO)', 'Jefferson City'] },
    { country: 'United States', state: 'Wisconsin', cities: ['Milwaukee', 'Madison', 'Green Bay'] },
    { country: 'United States', state: 'Tennessee', cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga'] },
    { country: 'United States', state: 'Indiana', cities: ['Indianapolis', 'Fort Wayne', 'Evansville'] },
    { country: 'United States', state: 'Oregon', cities: ['Portland', 'Salem', 'Eugene'] },
    { country: 'United States', state: 'Utah', cities: ['Salt Lake City', 'West Valley City', 'Provo'] },
    { country: 'United States', state: 'Kentucky', cities: ['Louisville', 'Lexington', 'Frankfort'] },
    { country: 'Canada', state: 'Ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London (ON)', 'Markham', 'Vaughan', 'Kitchener', 'Windsor'] },
    { country: 'Canada', state: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'] },
    { country: 'Canada', state: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond (BC)'] },
    { country: 'Canada', state: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer'] },
    { country: 'Canada', state: 'Manitoba', cities: ['Winnipeg'] },
    { country: 'Canada', state: 'Saskatchewan', cities: ['Saskatoon', 'Regina'] },
    { country: 'Canada', state: 'Nova Scotia', cities: ['Halifax'] },
    { country: 'Mexico', state: 'N/A', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Cancun', 'León', 'Juárez', 'Toluca', 'Querétaro', 'Mérida'] },

    // --- South America (Expanded) ---
    { country: 'Brazil', state: 'N/A', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'] },
    { country: 'Argentina', state: 'N/A', cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'] },
    { country: 'Colombia', state: 'N/A', cities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'] },
    { country: 'Chile', state: 'N/A', cities: ['Santiago', 'Valparaíso', 'Concepción'] },
    { country: 'Peru', state: 'N/A', cities: ['Lima', 'Arequipa', 'Trujillo'] },
    { country: 'Ecuador', state: 'N/A', cities: ['Quito', 'Guayaquil', 'Cuenca'] },
    { country: 'Venezuela', state: 'N/A', cities: ['Caracas', 'Maracaibo', 'Valencia'] },
    { country: 'Bolivia', state: 'N/A', cities: ['La Paz', 'Santa Cruz de la Sierra', 'Cochabamba'] },
    { country: 'Uruguay', state: 'N/A', cities: ['Montevideo'] },
    { country: 'Paraguay', state: 'N/A', cities: ['Asunción'] },

    // --- Europe (Heavily Expanded) ---
    { country: 'United Kingdom', state: 'N/A', cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Bristol', 'Edinburgh', 'Leeds', 'Sheffield', 'Cardiff', 'Belfast', 'Newcastle', 'Nottingham', 'Coventry', 'Leicester'] },
    { country: 'Germany', state: 'N/A', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg'] },
    { country: 'France', state: 'N/A', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes'] },
    { country: 'Spain', state: 'N/A', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Bilbao', 'Alicante', 'Murcia'] },
    { country: 'Italy', state: 'N/A', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Palermo', 'Genoa', 'Bologna', 'Venice', 'Verona', 'Catania'] },
    { country: 'Russia', state: 'N/A', cities: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod', 'Samara'] },
    { country: 'Netherlands', state: 'N/A', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'] },
    { country: 'Belgium', state: 'N/A', cities: ['Brussels', 'Antwerp', 'Ghent', 'Bruges'] },
    { country: 'Switzerland', state: 'N/A', cities: ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern'] },
    { country: 'Sweden', state: 'N/A', cities: ['Stockholm', 'Gothenburg', 'Malmö'] },
    { country: 'Norway', state: 'N/A', cities: ['Oslo', 'Bergen'] },
    { country: 'Denmark', state: 'N/A', cities: ['Copenhagen', 'Aarhus'] },
    { country: 'Ireland', state: 'N/A', cities: ['Dublin', 'Cork'] },
    { country: 'Portugal', state: 'N/A', cities: ['Lisbon', 'Porto'] },
    { country: 'Austria', state: 'N/A', cities: ['Vienna', 'Graz', 'Salzburg'] },
    { country: 'Greece', state: 'N/A', cities: ['Athens', 'Thessaloniki'] },
    { country: 'Poland', state: 'N/A', cities: ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań'] },
    { country: 'Ukraine', state: 'N/A', cities: ['Kyiv', 'Kharkiv', 'Odesa', 'Lviv'] },
    { country: 'Romania', state: 'N/A', cities: ['Bucharest', 'Cluj-Napoca', 'Timișoara'] },
    { country: 'Czech Republic', state: 'N/A', cities: ['Prague', 'Brno'] },
    { country: 'Hungary', state: 'N/A', cities: ['Budapest'] },
    { country: 'Finland', state: 'N/A', cities: ['Helsinki', 'Tampere'] },
    { country: 'Belarus', state: 'N/A', cities: ['Minsk'] },
    { country: 'Croatia', state: 'N/A', cities: ['Zagreb', 'Split'] },
    { country: 'Serbia', state: 'N/A', cities: ['Belgrade'] },
    { country: 'Slovenia', state: 'N/A', cities: ['Ljubljana'] },
    { country: 'Lithuania', state: 'N/A', cities: ['Vilnius'] },
    { country: 'Latvia', state: 'N/A', cities: ['Riga'] },
    { country: 'Estonia', state: 'N/A', cities: ['Tallinn'] },
    { country: 'Bulgaria', state: 'N/A', cities: ['Sofia'] },
    { country: 'Iceland', state: 'N/A', cities: ['Reykjavik'] },

    // --- Asia (Expanded, with exclusions) ---
    { country: 'China', state: 'N/A', cities: ['Shanghai', 'Beijing', 'Chongqing', 'Tianjin', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Nanjing', 'Xi\'an', 'Qingdao', 'Dalian'] },
    { country: 'Japan', state: 'N/A', cities: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kyoto', 'Kobe', 'Kawasaki', 'Hiroshima', 'Sendai'] },
    { country: 'India', state: 'N/A', cities: [] }, // This entry will be filtered out
    { country: 'South Korea', state: 'N/A', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju'] },
    { country: 'Indonesia', state: 'N/A', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar'] },
    { country: 'Thailand', state: 'N/A', cities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Nakhon Ratchasima'] },
    { country: 'Malaysia', state: 'N/A', cities: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh'] },
    { country: 'Singapore', state: 'N/A', cities: ['Singapore'] },
    { country: 'Vietnam', state: 'N/A', cities: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Haiphong'] },
    { country: 'Philippines', state: 'N/A', cities: ['Manila', 'Quezon City', 'Cebu City', 'Davao City'] },
    { country: 'United Arab Emirates', state: 'N/A', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'] },
    { country: 'Saudi Arabia', state: 'N/A', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'] },
    { country: 'Turkey', state: 'N/A', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'] },
    { country: 'Israel', state: 'N/A', cities: ['Jerusalem', 'Tel Aviv', 'Haifa'] },
    { country: 'Qatar', state: 'N/A', cities: ['Doha', 'Al Rayyan'] },
    { country: 'Kuwait', state: 'N/A', cities: ['Kuwait City'] },
    { country: 'Oman', state: 'N/A', cities: ['Muscat'] },
    { country: 'Bahrain', state: 'N/A', cities: ['Manama'] },
    { country: 'Hong Kong', state: 'N/A', cities: ['Hong Kong'] },
    { country: 'Taiwan', state: 'N/A', cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan'] },
    { country: 'Kazakhstan', state: 'N/A', cities: ['Almaty', 'Nur-Sultan', 'Shymkent'] },
    { country: 'Uzbekistan', state: 'N/A', cities: ['Tashkent', 'Samarkand'] },

    // --- Africa (Heavily Expanded) ---
    { country: 'Egypt', state: 'N/A', cities: ['Cairo', 'Alexandria', 'Giza', 'Luxor'] },
    { country: 'South Africa', state: 'N/A', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'] },
    { country: 'Nigeria', state: 'N/A', cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'] },
    { country: 'Kenya', state: 'N/A', cities: ['Nairobi', 'Mombasa', 'Kisumu'] },
    { country: 'Ethiopia', state: 'N/A', cities: ['Addis Ababa'] },
    { country: 'Ghana', state: 'N/A', cities: ['Accra', 'Kumasi'] },
    { country: 'Morocco', state: 'N/A', cities: ['Casablanca', 'Rabat', 'Fez', 'Marrakesh'] },
    { country: 'Tanzania', state: 'N/A', cities: ['Dar es Salaam', 'Dodoma', 'Arusha'] },
    { country: 'Algeria', state: 'N/A', cities: ['Algiers', 'Oran'] },
    { country: 'Angola', state: 'N/A', cities: ['Luanda'] },
    { country: 'Ivory Coast', state: 'N/A', cities: ['Abidjan'] },
    { country: 'Senegal', state: 'N/A', cities: ['Dakar'] },
    { country: 'Tunisia', state: 'N/A', cities: ['Tunis'] },
    { country: 'DR Congo', state: 'N/A', cities: ['Kinshasa', 'Lubumbashi'] },
    { country: 'Sudan', state: 'N/A', cities: ['Khartoum'] },
    { country: 'Uganda', state: 'N/A', cities: ['Kampala'] },
    { country: 'Mozambique', state: 'N/A', cities: ['Maputo'] },
    { country: 'Cameroon', state: 'N/A', cities: ['Douala', 'Yaoundé'] },
    { country: 'Zimbabwe', state: 'N/A', cities: ['Harare'] },
    { country: 'Zambia', state: 'N/A', cities: ['Lusaka'] },
    { country: 'Botswana', state: 'N/A', cities: ['Gaborone'] },
    { country: 'Namibia', state: 'N/A', cities: ['Windhoek'] },
    { country: 'Rwanda', state: 'N/A', cities: ['Kigali'] },

    // --- Oceania (Expanded) ---
    { country: 'Australia', state: 'New South Wales', cities: ['Sydney', 'Newcastle'] },
    { country: 'Australia', state: 'Victoria', cities: ['Melbourne', 'Geelong'] },
    { country: 'Australia', state: 'Queensland', cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Cairns'] },
    { country: 'Australia', state: 'Western Australia', cities: ['Perth', 'Fremantle'] },
    { country: 'Australia', state: 'South Australia', cities: ['Adelaide'] },
    { country: 'Australia', state: 'Tasmania', cities: ['Hobart'] },
    { country: 'Australia', state: 'N/A', cities: ['Canberra', 'Darwin'] },
    { country: 'New Zealand', state: 'N/A', cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Queenstown'] },
    { country: 'Fiji', state: 'N/A', cities: ['Suva'] }
];

// --- IMPORTANT: Filter out Indian cities from this list to avoid duplicates ---
const worldCitiesOnly = citiesByCountry.filter(countryObj => countryObj.country !== 'India');

// --- Flatten the filtered array and generate slugs for each city ---
const locationsToAdd = worldCitiesOnly.flatMap(countryObj =>
    countryObj.cities.map(cityName => ({
        city: cityName,
        slug: slugify(cityName),
        state: countryObj.state || 'N/A',
        country: countryObj.country
    }))
);

// --- Main function to connect to the database and ADD new data ---
async function seedDatabase() {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI environment variable not set. Please create a .env file.");
        return;
    }

    try {
        console.log("Connecting to the database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected successfully.");

        // --- NOTE: The deletion step has been removed to protect your existing data. ---

        console.log(`Preparing to add ${locationsToAdd.length} new WORLD locations (India is excluded).`);
        console.log("This will NOT delete your existing Indian cities.");

        if (locationsToAdd.length > 0) {
            console.log("Inserting new locations...");
            // Using a try-catch with insertMany to handle potential duplicate errors gracefully
            // if you run the script more than once.
            const result = await Location.insertMany(locationsToAdd, { ordered: false }).catch(err => {
                if (err.code === 11000) { // Error code for duplicate key
                    console.warn("Warning: Some duplicate entries were found and ignored. This is expected if you run the script more than once.");
                } else {
                    throw err; // Re-throw other types of errors
                }
            });
            
            const insertedCount = result ? result.length : 0;
            console.log(`Successfully added ${insertedCount} new world locations.`);
        } else {
            console.log("No new non-Indian locations to add.");
        }

    } catch (error) {
        console.error("An error occurred during the seeding process:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
}

// --- Run the Seeder Function ---
seedDatabase();


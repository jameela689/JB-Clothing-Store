const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const productData = require('../data');
dotenv.config();

const seedProducts = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 Connected to MongoDB for seeding');

        console.log('ClearingExisting products');
        await Product.deleteMany({});

        const productsdatafile = productData[0].products;
        console.log("Seeding products");
        await Product.insertMany(productsdatafile);

        console.log(`✅ ${productData.length} products seeded successfully!`);
        // Disconnect and exit
    await mongoose.disconnect();
        process.exit(0);
        
    }catch(err){
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

// Run if executed directly
if (require.main === module) {
    seedProducts();
  }
  
  module.exports = seedProducts;


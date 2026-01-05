const express = require('express');
// const mongoose = require('mongoose')
const cors = require('cors');
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');
const connectDB  = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');


dotenv.config();
connectDB();


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

const corsOption = {
    origin : process.env.FRONTEND_URL || 'https://localhost:5173',
    credentials: true,
};

app.use(cors(corsOption));



app.get('/',(req,res)=>{
    res.json('API is running')
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log("Server is running")
});
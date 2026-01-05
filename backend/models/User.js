const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
    {
    fullName:{
        type:String,
        required:[true,'Please provide name'],
        trim:true
    },
    email:{
        type:String,
        required :[true,'Please provide email'],
        trim:true,
        unique:true,
        lowercase:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',],
    },
    password:{
        type:String,
        required:[true,'Please provide password'],
        minlength:6,
        select:false
    },
    phoneNumber:{
        type:String,
        required:[true,'Please provide phone number'],
        match:[/^[\d\s\-\+\(\)]+$/,'Please provide a valid 10 digit number']
    },
    address:{
        type:String,
        required:[true,'Please provide address'],
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    wishlist:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }]
},{
    timestamps:true,
}

)

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });
  
  // Method to compare password
  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
module.exports = mongoose.model('User',userSchema)
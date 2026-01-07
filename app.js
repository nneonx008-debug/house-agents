
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const Freinds = require('./models/freinds');
const path = require('path');
const fs = require('fs');
const Feedback = require('./models/feed') ;
const Payment =require('./models/payment');
const ADS = require('./models/Ads');
const report = require('./models/admin');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt');
const Organ = require('./models/services');

const AllListing= require('./models/allListing');
const User = require('./user');
const Comment = require('./models/comments')
const Message = require('./models/message');
const axios =require('axios');
const app = express();

// server.js (or your main file)
const http = require('http');
const { Server } = require('socket.io');

// --- your existing middlewares, e.g. bodyParser, static, view engine, session, routes ---
app.set('view engine', 'ejs');
// example session (you might already have one)
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'replace-me',
  resave: false,
  saveUninitialized: false
});
app.use(sessionMiddleware);
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

// Create multer upload middleware
const upload = multer({ storage });

// create HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server);

// Share express-session with socket.io
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Track online users
const onlineUsers = new Set();

io.on("connection", (socket) => {
  console.log("✅ socket connected:", socket.id);

  // ---- SESSION-BASED AUTH ----
  const sessionUserId = socket.request?.session?.userId;

  if (sessionUserId) {
    socket.userId = sessionUserId.toString();
    socket.join(socket.userId);

    onlineUsers.add(socket.userId);
    io.emit("online-users", Array.from(onlineUsers));

    console.log("👤 user joined via session:", socket.userId);
  }

  // ---- FALLBACK JOIN ----
  socket.on("join", ({ userId }) => {
    if (!userId) return;

    socket.userId = userId.toString();
    socket.join(socket.userId);

    onlineUsers.add(socket.userId);
    io.emit("online-users", Array.from(onlineUsers));

    console.log(`👤 socket ${socket.id} joined room ${socket.userId}`);
  });

  // ---- TYPING INDICATOR ----
  socket.on("typing", ({ receiverId }) => {
    if (!socket.userId) return;

    io.to(receiverId).emit("userTyping", {
      userId: socket.userId,
    });
  });

  socket.on("stopTyping", ({ receiverId }) => {
    if (!socket.userId) return;

    io.to(receiverId).emit("userStopTyping", {
      userId: socket.userId,
    });
  });

  // ---- CHAT MESSAGE ----
  socket.on("chatMessage", async ({ receiverId, content }) => {
    try {
      if (!socket.userId) {
        return socket.emit("errorMessage", { msg: "Not authenticated" });
      }

      const message = new Message({
        sender: socket.userId,
        receiver: receiverId,
        content,
        isRead: false,
      });

      await message.save();

      const payload = {
        _id: message._id,
        sender: { _id: socket.userId },
        receiver: receiverId,
        content: message.content,
        createdAt: message.createdAt,
      };

      io.to(receiverId).emit("newMessage", payload);
      io.to(socket.userId).emit("newMessage", payload);
    } catch (err) {
      console.error("❌ chatMessage error:", err);
      socket.emit("errorMessage", { msg: "Message failed" });
    }
  });

  // ---- DISCONNECT ----
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("online-users", Array.from(onlineUsers));
    }

    console.log("❌ socket disconnected:", socket.id, socket.userId);
  });
});


// export io if you want in other modules: module.exports = { io };
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));

function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false
}));

// Static + views
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));

// server.js (or app.js)

// MongoDB
mongoose.connect('mongodb+srv://test:test1234@cluster0.sj0rfog.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log(err));
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads'); // ✅ relative path
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
function calculateRating(adCount) {
  if (adCount <= 2) return 1;
  if (adCount <= 5) return 2;
  if (adCount <= 10) return 3;
  if (adCount <= 20) return 4;
  return 5;
}
app.get('/fashion' , isAuthenticated , async(req,res) => {
  const user = await User.findById(req.session.userId);
  res.render('fashion' ,{
        country: user.country.toLowerCase(),
    user
  });
})

// helpers/listings.js
const Appliances = require('./models/appliance');
const Fashion  = require('./models/fashion');
const Vehicle  = require('./models/vehicle');
const Devices = require('./models/device');
const Furnitures = require('./models/furniture');
const Houses =require('./models/house');
const { devNull } = require('os');
const { title } = require('process');
const message = require('./models/message');
const freinds = require('./models/freinds');
const { asyncWrapProviders } = require('async_hooks');
const payment = require('./models/payment');
const services = require('./models/services');


app.get('/sell' , isAuthenticated , async(req,res) => {
  const user = await User.findById(req.session.userId) ; 
  res.render('payment' ,{user})

})
app.get('/free' , isAuthenticated , async(req,res) => {
  const user  =await User.findById(req.session.userId) ;
    const message = `${user.credit} VIP post remaining` ; 
        res.render('options' , {user})

})
app.get('/houses'  ,isAuthenticated , async(req,res) => {
  const user = await User.findById(req.session.userId)  ;
  res.render('sell' ,{
        country: user.country.toLowerCase(),
    user
  })
})
app.get('/' , (req,res) => {
  res.render('land')
})

app.get('/home/:category/:id' , async (req, res) => {
  try {
    const { category, id } = req.params;
   
    let data = null;
    let moreFunc = null;

    // Get logged-in user

    // Load listing based on category
    switch (category) {
      case "Houses":
        data = await Houses.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Houses.find().sort({ boosting: -1 });
        break;
      case "Vehicle":
        data = await Vehicle.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Vehicle.find().sort({ boosting: -1 });
        break;
      case "Devices":
        data = await Devices.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Devices.find().sort({ boosting: -1 });
        break;
      case "Furnitures":
        data = await Furnitures.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Furnitures.find().sort({ boosting: -1 });
        break;
      case "Appliances":
        data = await Appliances.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Appliances.find().sort({ boosting: -1 });
        break;
      case "Fashion":
        data = await Fashion.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Fashion.find().sort({ boosting: -1 });
        break;
      default:
        return res.status(400).send("Invalid category");
    }

    if (!data) {
      return res.status(404).send("Listing not found");
    }



    res.render("ghanaone", { home: data,  more: moreFunc});

  }catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});
app.get('/nig/:category/:id' , async (req, res) => {
  try {
    const { category, id } = req.params;
   
    let data = null;
    let moreFunc = null;

    // Get logged-in user

    // Load listing based on category
    switch (category) {
      case "Houses":
        data = await Houses.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Houses.find().sort({ boosting: -1 });
        break;
      case "Vehicle":
        data = await Vehicle.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Vehicle.find().sort({ boosting: -1 });
        break;
      case "Devices":
        data = await Devices.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Devices.find().sort({ boosting: -1 });
        break;
      case "Furnitures":
        data = await Furnitures.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Furnitures.find().sort({ boosting: -1 });
        break;
      case "Appliances":
        data = await Appliances.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Appliances.find().sort({ boosting: -1 });
        break;
      case "Fashion":
        data = await Fashion.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Fashion.find().sort({ boosting: -1 });
        break;
      default:
        return res.status(400).send("Invalid category");
    }

    if (!data) {
      return res.status(404).send("Listing not found");
    }

    // ✅ Now that we have data, we can fetch feedback
    const feedbacks = await Feedback.find({ sellerId: data.userId._id })
      .populate("buyerId", "username email")
      .sort({ createdAt: -1 });

    res.render("nigeriaone", { home: data,  more: moreFunc});

  }catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});
app.get('/property/:category/:id', isAuthenticated , async (req, res) => {
  try {
    const group = await Freinds.find({userId:req.session.userId}).populate('email')
    
    const { category, id } = req.params;
    let data = null;
    let moreFunc = null;
        const notifications = await Message.find({
      receiver: req.session.userId,
      isRead: false
    }).populate("sender", "username");
    // Fetch comments
    const comments = await Comment.find({
      category,
      itemId: id
    }).sort({ createdAt: -1 });

    // Get logged-in user
    const user = await User.findById(req.session.userId);

    // Load listing based on category
    switch (category) {
      case "Houses":
        data = await Houses.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Houses.find().sort({ boosting: -1 });
        break;
      case "Vehicle":
        data = await Vehicle.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Vehicle.find().sort({ boosting: -1 });
        break;
      case "Devices":
        data = await Devices.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Devices.find().sort({ boosting: -1 });
        break;
      case "Furnitures":
        data = await Furnitures.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Furnitures.find().sort({ boosting: -1 });
        break;
      case "Appliances":
        data = await Appliances.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Appliances.find().sort({ boosting: -1 });
        break;
      case "Fashion":
        data = await Fashion.findById(id).populate('userId', 'email rating').lean();
        moreFunc = await Fashion.find().sort({ boosting: -1 });
        break;
      default:
        return res.status(400).send("Invalid category");
    }

    if (!data) {
      return res.status(404).send("Listing not found");
    }

    // ✅ Now that we have data, we can fetch feedback
    const feedbacks = await Feedback.find({ sellerId: data.userId._id })
      .populate("buyerId", "username email")
      .sort({ createdAt: -1 });

    res.render("foreach", { user, home: data, group, comments, more: moreFunc, feedbacks ,notifications});

  }catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});



app.get('/furnitures' , isAuthenticated , async(req,res) => {
  const user = await User.findById(req.session.userId) 
  res.render('furniture',{
        country: user.country.toLowerCase(),
    user
  });
})
app.get('/vehicle/:id' , isAuthenticated , async(req,res)  => {
  const home = await Houses.findById(req.params.id);
  const vehicle = await Vehicle.findById(req.params.id).populate('userId' , 'email' ) ;  
  const user = await User.findById(req.session.userId)  ;
  res.render('foreachvehicle' , {vehicle , user  }) ; 
  console.log('house information:' , vehicle)
})
app.get('/appliances' , isAuthenticated ,async (req,res) => {
  const user  =await User.findById(req.session.userId);
  res.render('appliance' ,{ 
        country: user.country.toLowerCase(),
    user
  });
})
app.post('/add-house', isAuthenticated, upload.fields([
  { name: 'bgimg', maxCount: 1 },
  { name: 'extraimg', maxCount: 1 },
  { name: 'secondimg', maxCount: 1 },
  { name: 'thirdimg', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).send("User not found");
    }

    // Create house normally
    const house = new Houses({
      title: req.body.title,
      specific :req.body.specific ,
      userId: userId,
      description: req.body.description,
      bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null,
      extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null,
      secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null,
      thirdimg: req.files['thirdimg'] ? req.files['thirdimg'][0].path : null,
      baths: req.body.baths,
      beds: req.body.beds,
      country:user.country ,
            typo:req.body.typo  ,

      category:"Houses"  ,
      location: req.body.location,
      phonenumber: req.body.phonenumber,
      price: req.body.price
    });
        // ✅ update user adCount and rating
    user.adCount += 1;
    user.rating = calculateRating(user.adCount);
    await user.save();
    // Check if user has VIP credit
    if (user.credit && user.credit > 0) {
      house.VIP = true;              // make this house VIP
      user.credit -= 1;           // reduce their VIP credit
      await user.save();
    }

    await house.save();
    const all = new AllListing({
      refId: house._id,
            country:user.country ,

      category: "Houses",
        location:house.location ,

      bgimg: house.bgimg , 
      title:house.title , 
      price:house.price , 
      VIP: house.VIP || false   // mirror VIP into AllListing
    });
    await all.save()

    res.redirect('/profile');
  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});

app.post('/sell-vehicle', isAuthenticated, upload.fields([
  { name: 'bgimg', maxCount: 1 },
  { name: 'extraimg', maxCount: 1 },
  { name: 'secondimg', maxCount: 1 },
  { name: 'thirdimg', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    // Create Vehicle document
    const vehicle = new Vehicle({
      title: req.body.title,
      specific :req.body.specific ,
      userId: req.session.userId,
      description: req.body.description,
      bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null,
      extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null,
      secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null,
      thirdimg: req.files['thirdimg'] ? req.files['thirdimg'][0].path : null,
      transmission: req.body.transmission,
      fueltype: req.body.fueltype,
            country:user.country ,

            category:"Vehicle"  ,

      location: req.body.location,
      phonenumber: req.body.phonenumber,
      price: req.body.price,
      mileage: req.body.mileage
    });

    // Handle VIP credit
    if (user.credit && user.credit > 0) {
      vehicle.VIP = true;        // mark vehicle VIP
      user.credit -= 1;     
           // reduce credit
      await user.save();         // save updated user
    }

    // Save vehicle first
    await vehicle.save();

        // ✅ update user adCount and rating
    user.adCount += 1;
    user.rating = calculateRating(user.adCount);
    await user.save();
    // Now create AllListing entry
  const all = new AllListing({
      refId: vehicle._id,
      category: "Vehicle",
      bgimg: vehicle.bgimg , 
      title:vehicle.title , 
        location:vehicle.location ,
      country:user.country ,

      price:vehicle.price , 
      VIP: vehicle.VIP || false   // mirror VIP into AllListing
    });

    await all.save();

    console.log("Vehicle saved:", vehicle);
    console.log("AllListing saved:", all);

    res.redirect('/profile');
  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong . Please try again."
  });
}
});

app.post('/add-fashion' ,isAuthenticated , upload.fields([
  {name: 'bgimg' , maxCount :1} ,
  {name : 'extraimg'  ,maxCount :1} , 
  {name: 'secondimg' , maxCount :1} , 
  {name:'thirdimg' ,maxCount:1}  
]), async(req,res) => {
  const user = await User.findById(req.session.userId);
  const  fashion = new Fashion({
    title : req.body.title , 
    userId : req.session.userId , 
      specific :req.body.specific ,

    description : req.body.description , 
   bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null,
   extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null,
       secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null,
    thirdimg: req.files['thirdimg'] ? req.files['thirdimg'][0].path : null,
          category:"Fashion"  ,

    color:req.body.color , 
          country:user.country ,

    location:req.body.location , 
    phonenumber:req.body.phonenumber ,
    price:req.body.price , 
    gender:req.body.gender
  })

    // ✅ update user adCount and rating
    user.adCount += 1;
    user.rating = calculateRating(user.adCount);
    await user.save();

      if (user.credit && user.credit > 0) {
      fashion.VIP = true;      
      user.credit -= 1;           // reduce their VIP credit
      await user.save();
    }


    fashion.save()
  const all = new AllListing({
      refId: fashion._id,
      category: "Fashion",
      bgimg: fashion.bgimg , 
        location:fashion.location ,
      country:user.country ,

      title:fashion.title , 
      price:fashion.price , 
      VIP: fashion.VIP || false   // mirror VIP into AllListing
    });


    await all.save();
  console.log(fashion) ;
  res.redirect('/profile') ;
} )
app.post('/add-device' ,isAuthenticated , upload.fields([
  {name: 'bgimg' , maxCount :1} ,
  {name : 'extraimg'  ,maxCount :1} , 
  {name: 'secondimg' , maxCount :1} , 
  {name:'thirdimg' ,maxCount:1}  
]), async(req,res) => {
  const user  = await User.findById(req.session.userId);
  const  fashion = new Devices({
    title : req.body.title , 
    userId : req.session.userId , 
      specific :req.body.specific ,

    description : req.body.description , 
   bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null,
   extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null,
       secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null,
    thirdimg: req.files['thirdimg'] ? req.files['thirdimg'][0].path : null,
      category:"Devices"  ,
    manufacturer:req.body.manufacturer  ,
    location:req.body.location , 
          country:user.country ,

    phonenumber:req.body.phonenumber ,
    price:req.body.price , 
    condition:req.body.condition 
  })
      // ✅ update user adCount and rating
    user.adCount += 1;
    user.rating = calculateRating(user.adCount);
    await user.save();
      if (user.credit && user.credit > 0) {
      fashion.VIP = true;     
      user.credit -= 1;           // reduce their VIP credit
      await user.save();
    }

fashion.save()
  const all = new AllListing({
      refId: fashion._id,
      category: "Devices",
      bgimg: fashion.bgimg , 
            location:fashion.location ,
      country:user.country ,

      title:fashion.title , 
      price:fashion.price , 
      VIP: fashion.VIP || false   // mirror VIP into AllListing
    });


    await all.save();
  console.log(fashion) ;
  res.redirect('/profile') ;
} )
app.post('/add-furniture' ,isAuthenticated , upload.fields([
  {name: 'bgimg' , maxCount :1} ,
  {name : 'extraimg'  ,maxCount :1} , 
  {name: 'secondimg' , maxCount :1} , 
  {name:'thirdimg' ,maxCount:1}  
]), async(req,res) => {
  const user = await User.findById(req.session.userId) ;
  const  fashion = new Furnitures({
    title : req.body.title , 
      specific :req.body.specific ,

    userId : req.session.userId , 
    description : req.body.description , 
   bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null,
   extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null,
       secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null,
    thirdimg: req.files['thirdimg'] ? req.files['thirdimg'][0].path : null,
      category:"Furnitures"  ,
    material:req.body.material,
          country:user.country ,

    location:req.body.location , 
    phonenumber:req.body.phonenumber ,
    price:req.body.price , 
    condition:req.body.condition 
  })
      // ✅ update user adCount and rating
    user.adCount += 1;
    user.rating = calculateRating(user.adCount);
    await user.save();
      if (user.credit && user.credit > 0) {
      fashion.VIP = true;               // make this house VIP
      user.credit -= 1;           // reduce their VIP credit
      await user.save();
    }
  await fashion.save() ; 
  const all = new AllListing({
      refId: fashion._id,
      category: "Furnitures",
      bgimg: fashion.bgimg , 
      title:fashion.title ,
            country:user.country ,
 
      price:fashion.price , 
      location:fashion.location ,
      VIP: fashion.VIP || false   // mirror VIP into AllListing
    });


    await all.save();
  console.log(fashion) ;
  res.redirect('/profile') ;
} )
app.post('/add-appliance' ,isAuthenticated , upload.fields([
  {name: 'bgimg' , maxCount :1} ,
  {name : 'extraimg'  ,maxCount :1} , 
  {name: 'secondimg' , maxCount :1} , 
  {name:'thirdimg' ,maxCount:1}  
]), async(req,res) => {
  const user = await User.findById(req.session.userId) ;
  const  fashion = new Appliances({
    title : req.body.title , 
      specific :req.body.specific ,

    userId : req.session.userId , 
    description : req.body.description , 
   bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null,
   extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null,
       secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null,
    thirdimg: req.files['thirdimg'] ? req.files['thirdimg'][0].path : null,
      category:"Appliances"  ,
    location:req.body.location , 
          country:user.country ,

    phonenumber:req.body.phonenumber ,
    price:req.body.price , 
    condition:req.body.condition 
  })
      // ✅ update user adCount and rating
    user.adCount += 1;
    user.rating = calculateRating(user.adCount);
    await user.save();
      if (user.credit && user.credit > 0) {
      fashion.VIP = true;   
      user.credit -= 1;           // reduce their VIP credit
      await user.save();
    }
  await fashion.save() ; 
  const all = new AllListing({
      refId: fashion._id,
      category: "Appliances",
      bgimg: fashion.bgimg , 
      title:fashion.title , 
            location:fashion.location ,
      country:user.country ,

      price:fashion.price , 
      VIP: fashion.VIP || false   // mirror VIP into AllListing
    });


    await all.save();
  console.log(fashion) ;
  res.redirect('/profile') ;
} )

app.get('/edit-listing/:id' , isAuthenticated  ,async(req,res)=> {
 const listings = await Devices.findByIdAndDelete(req.params.id) ; 
    const furniture = await Furnitures.findByIdAndDelete(req.params.id) ; 
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id) ; 
    const fashion = await Fashion.findByIdAndDelete(req.params.id) ; 
    const house = await Houses.findByIdAndDelete(req.params.id) ; 
    res.redirect('/profile');
})

app.get("/profile", isAuthenticated  ,
   async (req, res) => {
  try {
    const Appliances = require('./models/appliance');
const Fashion  = require('./models/fashion');
const Vehicle  = require('./models/vehicle');
const Devices = require('./models/device');
const Furnitures = require('./models/furniture');
const Houses = require('./models/house');
    const userId = req.session.userId;
        const services = await Appliances.find({userId:req.session.userId}).sort({createdAt:-1});

    const listings = await Devices.find({userId:req.session.userId}).sort({createdAt:-1});
    const furniture = await Furnitures.find({userId:req.session.userId}).sort({createdAt:-1});
        const notifications = await Message.find({
      receiver: req.session.userId,
      isRead: false
    }).populate("sender", "username");
    const vehicle = await Vehicle.find({userId:req.session.userId}).sort({createdAt:-1});
    const fashion = await Fashion.find({userId:req.session.userId}).sort({createdAt:-1});
    const house = await Houses.find({userId:req.session.userId}).sort({createdAt:-1});
    const user = await User.findById(req.session.userId);
console.log(      user,
    listings,
    furniture , 
    vehicle , 
    services,
    fashion  ,
  
    house);
    res.render("profile", {
      title: "My Dashboard",
      user,
    listings,
    furniture , 
    services ,
    notifications,
    vehicle , 
    fashion  ,
    house
    });
  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong . Please try again."
  });
}
});


// Dashboard route


// Home

// Email suggestions for login
app.get("/email-suggestions", async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) return res.json([]);

    const users = await User.find({
      email: { $regex: `^${q}`, $options: "i" }
    })
      .limit(6)
      .select("email -_id");

    res.json(users.map(u => u.email));
  } catch (err) {
    console.error("Email suggestion error:", err);
    res.json([]);
  }
});

app.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const { sort, category, search, location } = req.query;

    /* ================= NOTIFICATIONS ================= */
    const notifications = await Message.find({
      receiver: req.session.userId,
      isRead: false,
    }).populate("sender", "username");

    /* ================= USER ================= */
    const user = await User.findById(req.session.userId).lean();

    /* ================= FETCH BASE LISTINGS ================= */
    const baseListings = await AllListing.find()
      .lean()
      .sort({ boosting: -1, createdAt: -1 });

    /* ================= RESOLVE CATEGORY DATA ================= */
    const collections = {
      Vehicle,
      Houses,
      Devices,
      Furnitures,
      Appliances,
      Fashion,
    };

    const resolvedListings = (
      await Promise.all(
        baseListings.map(async (item) => {
          const Model = collections[item.category];
          if (!Model) return null;

          const data = await Model.findById(item.refId).lean();
          return data ? { ...item, ...data } : null;
        })
      )
    ).filter(Boolean);

    /* ================= FILTERING ================= */
    let filteredListings = [...resolvedListings];

    /* --- CATEGORY --- */
    if (category) {
      filteredListings = filteredListings.filter(
        (list) => list.category === category
      );
    }

    /* --- LOCATION --- */
    if (location) {
      const loc = location.toLowerCase();
      filteredListings = filteredListings.filter((list) =>
        (list.location || "").toLowerCase().includes(loc)
      );
    }

    /* --- SMART SEARCH (WORD MATCH) --- */
    if (search) {
      const words = search
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      filteredListings = filteredListings.filter((list) => {
        const searchableText = `
          ${list.title || ""}
          ${list.location || ""}
          ${list.category || ""}
          ${list.specific || ""}
          ${list.transmission || ""}
          ${list.gender || ""}
          ${list.condition || ""}
                    ${list.beds || ""}
          ${list.baths || ""}

          ${list.description || ""}
                    ${list.price || ""}


        `.toLowerCase();

        return words.some(word => searchableText.includes(word));
      });
    }

    /* ================= SORTING ================= */
    if (sort === "low") {
      filteredListings.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "high") {
      filteredListings.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      filteredListings.sort((a, b) => {
        if ((b.boosting || 0) !== (a.boosting || 0)) {
          return (b.boosting || 0) - (a.boosting || 0);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    /* ================= VIP SPLIT ================= */
    const vipListings = filteredListings.filter(list => list.VIP === true);
    const normalListings = filteredListings.filter(list => !list.VIP);

    /* ================= RENDER ================= */
    res.render("dashboard", {
      user,
      notifications,
      vipListings,
      normalListings,
      sort,
      category,
      search,
      location,
    });

  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});

app.get("/ghana", async (req, res) => {
  try {

    const { sort, category, search, location } = req.query;
    
    /* ================= FETCH BASE LISTINGS ================= */
    const baseListings = await AllListing.find()
      .lean()
      .sort({ boosting: -1, createdAt: -1 });

    /* ================= RESOLVE CATEGORY DATA ================= */
    const collections = {
      Vehicle,
      Houses,
      Devices,
      Furnitures,
      Appliances,
      Fashion,
    };
    
    const resolvedListings = (
      await Promise.all(
        baseListings.map(async (item) => {
          const Model = collections[item.category];
          if (!Model) return null;
          
          const data = await Model.findById(item.refId).lean();
          return data ? { ...item, ...data } : null;
        })
      )
    ).filter(Boolean);

    /* ================= FILTERING ================= */
    let filteredListings = [...resolvedListings];

    /* --- CATEGORY --- */
    if (category) {
      filteredListings = filteredListings.filter(
        (list) => list.category === category
      );
    }
    
    /* --- LOCATION --- */
    if (location) {
      const loc = location;
      filteredListings = filteredListings.filter((list) =>
        (list.location || "").includes(loc)
      );
    }

    /* --- SMART SEARCH (WORD MATCH) --- */
    if (search) {
      const words = search
        .trim()
        
        .split(/\s+/)
        .filter(Boolean);

      filteredListings = filteredListings.filter((list) => {
        const searchableText = `
          ${list.title || ""}
          ${list.location || ""}
          ${list.category || ""}
          ${list.specific || ""}
          ${list.transmission || ""}
          ${list.gender || ""}
          ${list.condition || ""}
                    ${list.beds || ""}
          ${list.baths || ""}

                    ${list.price || ""}
       ${list.manufacturer || ""}

                    ${list.fueltype || ""}
                    ${list.mileage || ""}






        `;

        return words.some(word => searchableText.includes(word));
      });
    }

    /* ================= SORTING ================= */
    if (sort === "low") {
      filteredListings.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "high") {
      filteredListings.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      filteredListings.sort((a, b) => {
        if ((b.boosting || 0) !== (a.boosting || 0)) {
          return (b.boosting || 0) - (a.boosting || 0);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    /* ================= VIP SPLIT ================= */
    const vipListings = filteredListings.filter(list => list.VIP === true);
    const normalListings = filteredListings.filter(list => !list.VIP);
    
    /* ================= RENDER ================= */
    res.render("ghanahome", {
      
      vipListings,
      normalListings,
      sort,
      category,
      search,
      location,
    });

  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});
app.get("/nigeria", async (req, res) => {
  try {

    const { sort, category, search, location } = req.query;
    
    /* ================= FETCH BASE LISTINGS ================= */
    const baseListings = await AllListing.find()
      .lean()
      .sort({ boosting: -1, createdAt: -1 });

    /* ================= RESOLVE CATEGORY DATA ================= */
    const collections = {
      Vehicle,
      Houses,
      Devices,
      Furnitures,
      Appliances,
      Fashion,
    };
    
    const resolvedListings = (
      await Promise.all(
        baseListings.map(async (item) => {
          const Model = collections[item.category];
          if (!Model) return null;
          
          const data = await Model.findById(item.refId).lean();
          return data ? { ...item, ...data } : null;
        })
      )
    ).filter(Boolean);

    /* ================= FILTERING ================= */
    let filteredListings = [...resolvedListings];

    /* --- CATEGORY --- */
    if (category) {
      filteredListings = filteredListings.filter(
        (list) => list.category === category
      );
    }
    
    /* --- LOCATION --- */
    if (location) {
      const loc = location;
      filteredListings = filteredListings.filter((list) =>
        (list.location || "").includes(loc)
      );
    }

    /* --- SMART SEARCH (WORD MATCH) --- */
    if (search) {
      const words = search
        .trim()
        
        .split(/\s+/)
        .filter(Boolean);

      filteredListings = filteredListings.filter((list) => {
        const searchableText = `
          ${list.title || ""}
          ${list.location || ""}
          ${list.category || ""}
          ${list.specific || ""}
          ${list.transmission || ""}
          ${list.gender || ""}
          ${list.condition || ""}
                    ${list.beds || ""}
          ${list.baths || ""}

                    ${list.price || ""}
       ${list.manufacturer || ""}

                    ${list.fueltype || ""}
                    ${list.mileage || ""}






        `;

        return words.some(word => searchableText.includes(word));
      });
    }

    /* ================= SORTING ================= */
    if (sort === "low") {
      filteredListings.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "high") {
      filteredListings.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      filteredListings.sort((a, b) => {
        if ((b.boosting || 0) !== (a.boosting || 0)) {
          return (b.boosting || 0) - (a.boosting || 0);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    /* ================= VIP SPLIT ================= */
    const vipListings = filteredListings.filter(list => list.VIP === true);
    const normalListings = filteredListings.filter(list => !list.VIP);
    
    /* ================= RENDER ================= */
    res.render("nigeriahome", {
      
      vipListings,
      normalListings,
      sort,
      category,
      search,
      location,
    });

  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});

app.get('/vehicle', isAuthenticated, async (req, res) => {
  let listings = await Vehicle.find().sort({createdAt:-1}).populate('userId' , 'username');
  const user = await User.findById(req.session.userId)

  // Shuffle (optional)

  res.render('dashboard', { listings ,user });
});
app.get('/device', isAuthenticated, async (req, res) => {
  let listings = await Devices.find().sort({createdAt:-1}).populate('userId' , 'username');
  const user = await User.findById(req.session.userId);

  // Shuffle (optional)

  res.render('dashboard', { country: user.country.toLowerCase()  , listings ,user });
});
app.get('/fashions', isAuthenticated, async (req, res) => {
  let listings = await Fashion.find().sort({createdAt:-1}).populate('userId' , 'username');
  const user = await User.findById(req.session.userId)

  // Shuffle (optional)

  res.render('dashboard', { listings ,user });
});

app.get('/delete-user/:id' , isAuthenticated , async(req,res) => {
  const user = await User.findByIdAndDelete(req.session.userId) ; 
const userId = req.session.userId ; 
await Houses.deleteMany({userId}) ; 
await Vehicle.deleteMany({userId}) ; 
await Furnitures.deleteMany({userId}) ; 
await Devices.deleteMany({userId}) ; 
await Fashion.deleteMany({userId});
await Message.deleteMany({userId});
    await Message.findByIdAndDelete(req.session.userId);

  res.redirect('/login');
})
app.get('/administrators' , async(req,res) => {
  const users = await User.find().sort({createdAt:-1}) ; 
  const listing = await AllListing.find().sort({createdAt : -1}) ; 
  const boostedAds =await AllListing.find().sort({boosting:  -1}); 
  res.render('admin' , {users ,listing , boostedAds  });
})
app.get('/furnituree', isAuthenticated, async (req, res) => {
  let listings = await Furnitures.find().sort({createdAt:-1}).populate('userId' , 'username');
  const user = await User.findById(req.session.userId)

  // Shuffle (optional)

  res.render('dashboard', { listings ,user });
});

app.get('/appliance', isAuthenticated, async (req, res) => {
  let listings = await Appliances.find().sort({createdAt:-1}).populate('userId' , 'username');
  const user = await User.findById(req.session.userId)

  // Shuffle (optional)

  res.render('dashboard', { listings ,user });
});
app.get('/user' , isAuthenticated , async (req,res) => {
  const user = await  User.findById(req.session.userId) ; 
  const listings = await Devices.find({userId:req.session.userId});
    const furniture = await Furnitures.find({userId:req.session.userId});
    const vehicle = await Vehicle.find({userId:req.session.userId});
    const fashion = await Fashion.find({userId:req.session.userId});
    const house = await Houses.find({userId:req.session.userId});

  const listing = [listings.length +furniture.length + vehicle.length + fashion.length + house.length ]
  res.render('user' , {user  ,listing});
})


app.get('/gateway' , isAuthenticated ,  (req,res) => {
  res.render('payment');
})
// Render signup page
app.get('/signup', async(req, res) => {
    const user = await User.find().sort({createdAt:-1}) ; 
  console.log(user)
  res.render('signup', { error: null });
});

// Render login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});
app.get('/isLogging' , (req ,res) => {
  res.render('login' , {error: null})
})

// Signup logic
app.post('/signup', upload.single('profileImage'),  async (req, res) => {
  const { fullname, email, password, confirm_password , country  , state} = req.body;

  // password match check
  if (password !== confirm_password) {
    return res.render('signup', { error: "Passwords do not match." });
  }
  try {
    const  checkUser = await User.findOne({email})
    const  name = await User.findOne({fullname})
 
    if(checkUser) {
      return res.render('signup', { error: "User email already exists" });
    }
        if(checkUser) {
      return res.render('signup', { error: "User email already exists" });
    }
            if(name) {
      return res.render('signup', { error: "User name already exists" });
    }
    const users = await User.find(); 
    const user = new User({
      username: fullname, // save fullname as username
      email,
      country ,
      state,
      password ,
      image: req.file ? req.file.filename : null
    });
      const message = new Message({
      sender: user._id,
      receiver: user._id ,
      lik : `/sell` , 
      isfeedback: true , 
      content: `welcome to neonx, the market place made for you enjoy all our services, build trust and relationshionships and free from scams `

    })

    console.log(message)
    await message.save();
    if(users.length <= 50){ 
      user.credit += 1;
    const message = new Message({
      sender: user._id,
       isfeedback: true ,
       lik: `/sell`,
      receiver: user._id ,
      content: "congrats! you now have a special ADS! posting vip reward for being an early member, thanks for choosing neonx GOD bless you"
    })
    console.log(message)
    await message.save();
      }
    await user.save();
    console.log(user) ;
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    res.render('signup', { error: "Error creating account. Try changing your name." });
  }
});
app.post("/send", isAuthenticated ,  async (req, res) => {
    const { receiver, content } = req.body;
    const msg = new Message({ sender: req.session.userId, receiver, content });
    await msg.save();
    console.log(msg)
    res.redirect("/user");;

});

app.get('/pay/vip' , isAuthenticated  ,async(req,res) => {
  const user = await User.findById(req.session.userId);
  res.render('verified' , {user})
})
app.get('/callback', isAuthenticated , async (req, res) => {
  const { reference } = req.query;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data.data;
    const status = data.status;

    // Update payment in DB
    await Payment.findOneAndUpdate(
      { reference },
      { status },
      { new: true }
    );
    const user = await User.findById(req.session.userId) ; 
const userId = req.session.userId ; 
    if (status === 'success') {
await User.updateOne(
  { _id: userId },
  { $inc: { credit: 1 } } // give 1 VIP credit
);
const msg = new Message({
  sender: req.session.userId, 
  receiver:req.session.userId , 
  isfeedback:true , 
  content:`congrats ${user.username} You have a VIP post. click here to post now!` , 
  lik: `/sell`
})
msg.save(); 
console.log(userId  ,user);
      res.redirect('/free');
    } else {
      res.sendFile(`<a href = "/dashboard">payment verification failed back to homepage</a>`)
    }

  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong . Please try again."
  });
}
});
app.get('/support' , isAuthenticated  , async(req,res) => {
  const user =  await User.findById(req.session.userId) ; 
  res.render('support' ,{user});
})
app.post('/pay', isAuthenticated , async (req, res) => {
  const { email } = await User.findById(req.session.userId); // only email is needed

  // Fixed amount: ₦2000
  const fixedAmount = 700;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: fixedAmount * 100, // Paystack expects amount in kobo
        callback_url: "http://localhost:3000/callback"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { authorization_url, reference } = response.data.data;

    // Save pending payment to DB
    const payment = new Payment({
      email,
      amount: fixedAmount, // save as naira in DB
      reference,
      status: 'pending'
    });
    await payment.save();
    console.log(payment)
    res.redirect(authorization_url);

  }catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});

// Login logic
app.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render('login', { error: 'Invalid email or password.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.render('login', { error: 'Invalid email or password.' });

    req.session.userId = user._id;

    // Extend session lifetime if "Remember Me" is checked
    if (rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 365; // 7 days
    } else {
      req.session.cookie.expires = false; // session ends when browser closes
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    res.render('isLogging', { error: 'Something went wrong during login.' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/login');
  });
});

// Show list of users to chat with
app.get('/inbox', isAuthenticated, async (req, res) => {
  try {
    // Find all messages where the logged-in user is the receiver
    const messages = await Message.find({ receiver: req.session.userId })
      .sort({ createdAt: -1 }) // latest messages first
      .populate('sender', 'email'); // get sender info

    // Get logged-in user info for template
    const user = await User.findById(req.session.userId);

    res.render('inbox', { messages, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
app.get('/chat/each/:id/:prop/:category', isAuthenticated, async (req, res) => {
  const otherUser = await User.findById(req.params.id);
  const prop = req.params.prop    ;
  const id  = req.params.id ;  
   const category  =  req.params.category ; 
  const profileUser = await User.findById(req.session.userId);
  const user = await User.findById(req.session.userId)
  if (!otherUser) return res.status(404).send('User not found');

  const messages = await Message.find({
    $or: [
      { sender: req.session.userId, receiver: req.params.id },
      { sender: req.params.id, receiver: req.session.userId }
    ]
  })
  .sort({ createdAt: 1 })
  .populate('sender', 'username email');
await Message.updateMany(
  { receiver: req.session.userId, isRead: false },
  { $set: { isRead: true  } }
);


  const loggedInUser = await User.findById(req.session.userId);

  res.redirect(`/property/${category}/${prop}`);
});
// Show chat with a specific user
app.get('/chat/:id', isAuthenticated, async (req, res) => {
  const otherUser = await User.findById(req.params.id);
  const profileUser = await User.findById(req.session.userId);
  const user = await User.findById(req.session.userId)
  if (!otherUser) return res.status(404).send('User not found');

  const messages = await Message.find({
    $or: [
      { sender: req.session.userId, receiver: req.params.id },
      { sender: req.params.id, receiver: req.session.userId }
    ]
  })
  .sort({ createdAt: 1 })
  .populate('sender', 'username email');
await Message.updateMany(
  { receiver: req.session.userId, isRead: false },
  { $set: { isRead: true } }
);



  const loggedInUser = await User.findById(req.session.userId);

  res.render('chat', { otherUser, user  ,messages, loggedInUser , profileUser });
});
app.get('/chat/each/:id/:prop/:category', isAuthenticated, async (req, res) => {
  const otherUser = await User.findById(req.params.id);
  const prop = req.params.prop    ;
   const category  =  req.params.category ; 
  const profileUser = await User.findById(req.session.userId);
  const user = await User.findById(req.session.userId)
  if (!otherUser) return res.status(404).send('User not found');

  const messages = await Message.find({
    $or: [
      { sender: req.session.userId, receiver: req.params.id },
      { sender: req.params.id, receiver: req.session.userId }
    ]
  })
  .sort({ createdAt: 1 })
  .populate('sender', 'username email');
await Message.updateMany(
  { receiver: req.session.userId, isRead: false },
  { $set: { isRead: true  } }
);


  const loggedInUser = await User.findById(req.session.userId);

  res.redirect(`/property/${category}/${id}`);
});
app.get('/chat/feedback/:id', isAuthenticated, async (req, res) => {
  const otherUser = await User.findById(req.params.id);
  const profileUser = await User.findById(req.session.userId);
  const user = await User.findById(req.session.userId)
  if (!otherUser) return res.status(404).send('User not found');

  const messages = await Message.find({
    $or: [
      { sender: req.session.userId, receiver: req.params.id },
      { sender: req.params.id, receiver: req.session.userId }
    ]
  })
  .sort({ createdAt: 1 })
  .populate('sender', 'username email');
await Message.updateMany(
  { receiver: req.session.userId, isRead: false },
  { $set: { isRead: true  } }
);


  const loggedInUser = await User.findById(req.session.userId);

  res.redirect('/dashboard');
});
app.post('/chat/:id/:list/:title/unavailable', isAuthenticated, async (req, res) => {
  try {      
    const title = req.params.title
    const id   = req.params.id ; 
    const user = await User.findById(req.session.userId);
    const list = req.params.list
    const message = new Message({
      lik:`/seller/${user.email}/${user.id}/listings` , 
      sender: req.session.userId,
      receiver: req.params.id,
      isfeedback:true , 
      content: `your property ${title} has been marked unavailable by ${user.username} click here to view user `
    })
  

    await message.save();

    res.redirect('/chat/' + req.params.id);
  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong . Please try again."
  });
}
});
// Step 1: Show payment page
function getModel(category) {
  switch (category) {
    case "Houses":     return Houses;
    case "Vehicle":    return Vehicle;   // ✅ not Vehicles
    case "Fashion":    return Fashion;
    case "Devices":    return Devices;
    case "Appliances": return Appliances;
    case "Furnitures": return Furnitures;
    default:           return null;
  }
}


// GET boost page
app.get("/boost/:category/:id",isAuthenticated , async (req, res) => {
  const { category, id } = req.params;
  const user = await User.findById(req.session.userId);
  const Model = getModel(category);
  if (!Model) return res.status(400).send("Invalid category");

  try {
    const listing = await Model.findById(id);
    if (!listing) return res.status(404).send("Listing not found");

    res.render("boost", { user ,listing  }); // 👈 boost.ejs page
  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong . Please try again."
  });
}
});

// STEP 1: initialize payment
app.post("/boost/:category/:id/pay", isAuthenticated, async (req, res) => {
  const { category, id } = req.params;
  const userId = req.session.userId;

  try {
    // ✅ get user email properly
    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found");

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: 500 * 100, // ₦500 in kobo
        callback_url: `${req.protocol}://${req.get("host")}/boost/${category}/${id}/verify`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // ✅ fixed
          "Content-Type": "application/json"
        }
      }
    );

    // ✅ redirect user to Paystack checkout
    res.redirect(response.data.data.authorization_url);
  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong . Please try again."
  });
}
});


app.get("/boost/:category/:id/verify", isAuthenticated, async (req, res) => {
  const { category, id } = req.params;
  const reference = req.query.reference;
  const user = await User.findById(req.session.userId)

  const Model = getModel(category);
  if (!Model) return res.status(400).send("Invalid category");

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.data.status === "success") {
      // ✅ update main category model
      await Model.findByIdAndUpdate(
        id,
        { $inc: { boosting: 1 } },
        { new: true }
      );

      // ✅ also update AllListing mirror
      await AllListing.findOneAndUpdate(
        { refId: id, category },
        { $inc: { boosting: 1 } },
        { new: true }
      );

      const msg = new Message({
        sender : req.session.userId , 
        receiver: req.session.userId , 
        isfeedback:true , 
        lik:`/property/${category}/${id}` , 
        content: `${user.username} you have sucessfully boosted your ad ${id}, Which increases your chances of being seen by buyers`
      })

      return res.redirect(`/property/${category}/${id}`);
    }

    res.send("❌ Boost payment failed.");
  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});




// Handle payment success (mock for now)

app.post('/property/:category/:id/comments', isAuthenticated , async (req, res) => {
  try {
    const {  text } = req.body;
    const { category, id } = req.params;
    const user = await User.findById(req.session.userId).populate('username') ;

    // create a new comment linked to that item
    const comment = new Comment({
      username : user.username ,
      messageMe : req.session.userId , 
      text,
      category,
      itemId: id,
      categoryModel: category
    });
    console.log(comment)
    await comment.save();
    console.log(comment.text , comment.username) ;

    res.redirect(`/property/${category}/${id}`);
  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong . Please try again."
  });
}
});
app.get('/freinds/remove/:id' , isAuthenticated , async(req,res) => {
  const id = req.params.id ;  
  await Freinds.findByIdAndDelete(id) ; 
  res.redirect('/freinds')
})
// Show all listings by a seller
app.get("/seller/:email/:id/listings", isAuthenticated, async (req, res) => {
  try {
    const sellerId = req.params.id;
    const email= req.params.email ; 
    let isYourfreind = false ; 
    // fetch seller
    const seller = await User.findById(sellerId).lean();
    if (!seller) return res.status(404).send("Seller not found");
    const frenzy = await Freinds.find({userId : req.session.userId}) ; 
    frenzy.forEach(f => {
      if(f.email == email){
        isYourfreind === true ;
        
      }
    })
    console.log(isYourfreind);

    // fetch all listings across categories
    const houses = await Houses.find({ userId: sellerId }).lean();
    const vehicles = await Vehicle.find({ userId: sellerId }).lean();
    const devices = await Devices.find({ userId: sellerId }).lean();
    const furnitures = await Furnitures.find({ userId: sellerId }).lean();
    const appliances = await Appliances.find({ userId: sellerId }).lean();
    const fashions = await Fashion.find({ userId: sellerId }).lean();

    // combine into one array
    const listings = [
      ...houses,
      ...vehicles,
      ...devices,
      ...furnitures,
      ...appliances,
      ...fashions,
    ];

    // logged in user (viewer)
    const user = await User.findById(req.session.userId).lean();

    res.render("sellerListings", { listings, seller, sellerId , isYourfreind ,  frenzy , email,  user });
  } catch (err) {
    console.error("🚨 Error loading seller listings:", err);
    res.status(500).send("Error loading seller listings");
  }
});
// VERIFY PAYMENT CALLBACK
app.get("/vips/callback", async (req, res) => {
  const { reference } = req.query;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = response.data.data;
    const status = data.status;

    // Update payment status in DB
    const payment = await Payment.findOneAndUpdate(
      { reference },
      { status },
      { new: true }
    );

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.send("User not found.");
    }

    if (status === "success") {
      // Amount comes from Paystack in kobo
      const amountPaid = data.amount; // e.g. 400000 for ₦4000

      if (amountPaid === 100000) {
        user.credit += 1; // ₦1000 → 1 VIP
      } else if (amountPaid === 200000) {
        user.credit += 2; // ₦2000 → 2 VIPs
      } else if (amountPaid === 400000) {
        user.credit += 5; // ₦4000 → 5 VIPs
      }

      await user.save();
      console.log("VIP credits added:", user.credit);

      res.redirect("/free"); // redirect after success
    } else {
      res.send(`<a href="/dashboard">Payment verification failed, back to homepage</a>`);
    }

  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});


// INITIALIZE PAYMENT
app.post("/vips/pays", isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.send("User not found.");
  }

  const { email } = user;

  // Fixed amount (you can change dynamically later)
  const fixedAmount = 4000; // ₦4000

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: fixedAmount * 100, // Paystack expects kobo
        callback_url: "http://localhost:3000/vips/callback" // ✅ must match your callback route
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const { authorization_url, reference } = response.data.data;

    // Save pending payment in DB
    const payment = new Payment({
      email,
      amount: fixedAmount,
      reference,
      status: "pending"
    });
    await payment.save();

    console.log("Payment initialized:", payment);
    res.redirect(authorization_url);

  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong . Please try again."
  });
}
});


app.get('/freinds/:email/:id/:username' , isAuthenticated , async(req,res) => {
  const id  = req.params.id ; 
  const username  =req.params.email ; 
  const dname   = req.params.username ; 
  const userId = req.session.userId ; 
  await User.findByIdAndUpdate(id ,{$inc :{frenzy: 1}})

  const freind = new Freinds ({
    email : username  , 
    userId : userId , 
    link : id 
  })
  const user = await User.findById(req.session.userId) ; 
  freind.save() ;
  const msg   = new Message({
    sender: userId , 
    isfeedback:true,
    receiver:req.params.id ,  
    lik:`/seller/${user.username}/${user._id}/listings`,
    content: `${dname} added you as a freind see more`
  }) 
  msg.save();
  console.log(freind)
  res.redirect(`/seller/${username}/${id}/listings`)
})
app.get('/freinds' , isAuthenticated , async(req,res) => {
  const user = await User.findById(req.session.userId) ; 
  const freinds = await Freinds.find({userId : req.session.userId}) ; 
  res.render('freind' , {user , freinds})
})

// Send message
app.post('/chat/:id', isAuthenticated, async (req, res) => {
  const otherUserId = req.params.id;
  const content = req.body.content;


  const message = new Message({
    sender: req.session.userId,
    receiver: otherUserId,
    content , 
    isChat:true 
  });
  await Message.updateMany(
  { receiver: req.session.userId, isRead: false },
  { $set: { isRead: true } }
);
  await message.save();
  console.log(message)  ;
  res.redirect(`/chat/${otherUserId}`);
});
app.get('/delete-chat/:id' , isAuthenticated , async(req,res) => {
  const id = req.params.id;
  const message = await Message.findByIdAndDelete(id); 
  res.redirect('/inbox');
})
app.get('/devices' ,isAuthenticated ,async (req,res) => {
  const user = await User.findById(req.session.userId) ; 
  res.render('devices' , {

    country: user.country.toLowerCase(),
    user
  })
})
// POST feedback
app.post("/feedback/:sellerId/:sellerName", isAuthenticated, async (req, res) => {
  try {
    const { sellerId ,  sellerName } = req.params;
    const user = await User.findById(req.session.userId) ; 
    const feedback = new Feedback({
      sellerId,
      buyerId: req.session.userId,
      text: req.body.text
    });

    await feedback.save();
      const msg = new Message({
      sender :req.session.userId, 
      isfeedback : true , 
      lik: `/feedback/${sellerId}` , 
      receiver :sellerId , 
      content : ` You have a new feedback from  ${sellerName}. click here to view it`
    })
    await msg.save() ; 
    res.redirect(`/feedback/${sellerId}`); // redirect back to seller's feedback page
  }catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});
app.get('/vehicles' , isAuthenticated ,async(req,res) => {
  const user= await User.findById(req.session.userId)
  res.render('vehicle' ,{
        country: user.country.toLowerCase(),
    user
  })
})
// GET feedback page
app.get('/feedback/:sellerId', isAuthenticated, async (req, res) => {
  try {
    const { sellerId } = req.params;

    const user = await User.findById(req.session.userId);
    const seller = await User.findById(sellerId); // get seller details
    const feeds = await Feedback.find({ sellerId })
      .populate('buyerId', 'username').sort({createdAt : -1})

    res.render('feedback', { feeds, user, seller });
  } catch (err) {
    console.error("🚨 Error loading feedback page:", err);
    res.status(500).send("Something went wrong loading feedback.");
  }
});
app.get('/save-ads/:category/:id/:title/:price/:location/:specific', isAuthenticated, async (req, res) => {
  try {
    const { id, category, title, price, location, specific } = req.params;
    await User.findByIdAndUpdate(
      req.session.userId,
      {
        $addToSet: {
          savedAds: {
            adId: id,
            category,
            title,
            price,
            location,
            specific
          }
        }
      }
    );
    
    res.redirect(`/property/${category}/${id}`);
  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});


app.get('/report/:seller/:reporter' ,isAuthenticated  ,async(req,res) => {
  const {seller ,reporter} = req.params ; 
  const newReports =  new report({
    userId : reporter , 
    victim : seller
  })
  await newReports.save() ;
  res.redirect('/');
})
app.get("/saved", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const savedAds = user?.savedAds || [];
    res.render("savedAds", { savedAds , user });
  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});


// --- VIP subscription page ---
app.get("/vips", isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render("vip", { user });
});

// --- Success page ---
app.get("/vip/success", isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render("vip-success", { user });
});
app.get('/find-freind', isAuthenticated, async (req, res) => {
  try {
    const notifications = await Message.find({
      receiver: req.session.userId,
      isRead: false
    }).populate("sender", "username");

    const user = await User.findById(req.session.userId).lean();

    const freinds = await User.find({
      _id: { $ne: req.session.userId },
      isDeleted: { $ne: true }
    })
    .sort({ createdAt: -1 })
    .lean();

    res.render('allfriend', {
      freinds,
      user,
      notifications,
      searchTerm: ""
    });

  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});
app.get('/best-sellers' , isAuthenticated , async(req,res) => {
    try {
    const notifications = await Message.find({
      receiver: req.session.userId,
      isRead: false
    }).populate("sender", "username");

    const user = await User.findById(req.session.userId).lean();

    const freinds = await User.find({
      _id: { $ne: req.session.userId },
      isDeleted: { $ne: true }
    })
    .sort({adCount:-1})
    .lean();

    res.render('allfriend', {
      freinds,
      user,
      notifications,
      searchTerm: ""
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load friends");
  }
})

app.get('/best-buyers' , isAuthenticated , async(req,res) => {
    try {
    const notifications = await Message.find({
      receiver: req.session.userId,
      isRead: false
    }).populate("sender", "username");

    const user = await User.findById(req.session.userId).lean();

    const freinds = await User.find({
      _id: { $ne: req.session.userId },
      isDeleted: { $ne: true }
    })
    .sort({adCount:1})
    .lean();

    res.render('allfriend', {
      freinds,
      user,
      notifications,
      searchTerm: ""
    });

  }catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
})
app.get('/popular' , isAuthenticated , async(req,res) => {
    try {
    const notifications = await Message.find({
      receiver: req.session.userId,
      isRead: false
    }).populate("sender", "username");

    const user = await User.findById(req.session.userId).lean();

    const freinds = await User.find({
      _id: { $ne: req.session.userId },
      isDeleted: { $ne: true }
    })
    .sort({frenzy:-1})
    .lean();

    res.render('allfriend', {
      freinds,
      user,
      notifications,
      searchTerm: ""
    });

  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
})


// GET Friends Page + Search Feature
app.get('/search', isAuthenticated, async (req, res) => {
  try {
    const searchTerm = req.query.search?.trim() || "";
    

    // 🔔 Notifications
    const notifications = await Message.find({
      receiver: req.session.userId,
      isRead: false
    }).populate("sender", "username");

    // 👤 Logged-in user
    const user = await User.findById(req.session.userId).lean();

    // 🔍 Build dynamic search query
    const query = {
      _id: { $ne: req.session.userId }, // ❌ don't show yourself
      isDeleted: { $ne: true }          // ❌ don't show deleted users
    };
if (searchTerm) {
  const words = searchTerm.split(/\s+/); // split by spaces

  query.$or = words.flatMap(word => ([
    { username: { $regex: word, $options: "i" } },
    { email: { $regex: word, $options: "i" } }
  ]));
}


  
    // 🆕 Newest users first (same as homepage logic)
    const freinds = await User.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.render("allfriend", {
      freinds,
      user,
      notifications,
      searchTerm
    });

  } catch (err) {
  console.error(err);
  res.status(500).render("error", {
    message: "Something went wrong. Please try again."
  });
}
});
app.get("/search-suggestions", async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) return res.json([]);

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const results = await Listing.find({
      $or: [
        { title: { $regex: regex } },
        { location: { $regex: regex } },
        { specific: { $regex: regex } }
      ]
    })
      .limit(8)
      .select("title location specific");

    const suggestions = new Set();

    results.forEach(r => {
      if (typeof r.title === "string") suggestions.add(r.title);
      if (typeof r.location === "string") suggestions.add(r.location);
      if (typeof r.specific === "string") suggestions.add(r.specific);
    });

    res.json([...suggestions]);
  } catch (err) {
    console.error("Suggestion error:", err);
    res.json([]); // NEVER return HTML
  }
});
app.post('/saved/delete', isAuthenticated, async (req, res) => {
  try {
    const { adId } = req.body;

    await User.findByIdAndUpdate(
      req.session.userId,
      {
        $pull: {
          savedAds: { adId }
        }
      }
    );

    res.redirect('/saved');
  } catch (err) {
    console.error('Delete saved ad error:', err);
    res.redirect('/saved');
  }
});

app.get("/find-suggestions", async (req, res) => {
  try {
    const q = req.query.search?.trim();
    if (!q || q.length < 2) return res.json([]);

    const users = await AllListing.find({
      title: { $regex: `^${q}`, $options: "i" }
    })
      .limit(6)
      .select("email -_id");

    res.json(users.map(u => u.title));
  } catch (err) {
    console.error("Email suggestion error:", err);
    res.json([]);
  }
});
app.get('/1.2.3.4.5.6-admin' , async(req,res) => {
const user = await User.find() ; 

const org = await Organ.find(); 
const list  =await AllListing.find();
const payment = await Payment.find() ;

res.render('empty' , {
  user,org,list,payment
})
})
app.post('/supports/:id/:name/:email' , isAuthenticated , async(req,res) => {
  const { nin,name ,email } = req.params ;
  const id = req.params.id ;  
  const message = req.body.message ; 
  const msg = new Organ({
      message , 
      email,
    nin:id
  })
  await msg.save() ; 
  console.log(msg)
  
  res.redirect('/user')
})
// ------------------ SERVER ------------------
app.post('/propose/:sellerid/:category/:id/:title' , isAuthenticated , async(req,res) => {
  const user = await User.findById(req.session.userId) ; 
  const sellerid = req.params.sellerid ; 
  const category = req.params.category ; 
  const  title =  req.params.title ; 
  const id = req.params.id ; 
  const phonenumber = req.body.phonenumber ; 
  const msg = new Message ({
 sender:req.session.userId ,
 receiver: sellerid ,  
 isfeedback:true , 
 content : `call ${phonenumber}, ${user.username} is interested in your property "${title}"`,
 lik:`/seller/${user.email}/${user._id}/listings`

  })
  await msg.save();
  res.redirect(`/property/${category}/${id}`)
})
app.get('/edit/:category/:id' , isAuthenticated , async(req,res) => {
  const {category  , id  }  =req.params ; 
  let edit;
  const user = await User.findById(req.session.userId) ;
  if(category == 'Houses'){
    edit = await Houses.findById(id) ; 
  }
   if(category == 'Vehicle'){
    edit =  await Vehicle.findById(id)
  }
   if(category == 'Devices'){
    edit = await Devices.findById(id)
  }
  if(category == 'Furnitures'){
    edit = await Furnitures.findById(id)
  }
  if(category == 'Appliances'){
    edit = await Appliances.findById(id) ; 
  }
  if(category == 'Fashion'){
    edit = await Fashion.findById(id) ; 
  }
  res.render('edit' ,{ home : edit  , user})
})
app.post('/edited/:category/:id' , isAuthenticated , 
  upload.fields([
  {name: 'bgimg' , maxCount :1} ,
  {name : 'extraimg'  ,maxCount :1} , 
  {name: 'secondimg' , maxCount :1} , 
  {name:'thirdimg' ,maxCount:1}  
]),
  async(req,res) => {
  const {category , id} = req.params ; 
  const {title , price , specific  ,location ,description } = req.body  ;
         const h=await Houses.findById(id)
       const v=await Vehicle.findById(id)
      const d=await Devices.findById(id)
      const f=await Furnitures.findById(id)
      const a=await Appliances.findById(id) ; 
      const fa=await Fashion.findById(id) ; 

  let data;
     if(category == 'Houses'){
       await Houses.findById(id)
  }
     if(category == 'Vehicle'){
       await Vehicle.findById(id)
  }
   if(category == 'Devices'){
      await Devices.findById(id)
  }
  if(category == 'Furnitures'){
      await Furnitures.findById(id)
  }
  if(category == 'Appliances'){
      await Appliances.findById(id) ; 
  }
  if(category == 'Fashion'){
      await Fashion.findById(id) ; 
  }

  if(category == 'Houses'){
     await Houses.findByIdAndUpdate(id , {$set : {
      title:title || h.title, 
      price:price || h.price, 
      description:description || h.description , 
      location: location  || h.location, 
      specific:specific || h.specific , 
   bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null || h.bgimg,
      secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null || h.secondimg,
   extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null || h.extraimg

 

     }}) ; 
  }
   if(category == 'Vehicle'){
      await Vehicle.findByIdAndUpdate(id , {$set : {
      title:title || v.title, 
      price:price || v.price, 
      description:description || v.description , 
      location: location  || v.location, 
      specific:specific || v.specific , 
   bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null || v.bgimg,
      secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null || v.secondimg,
   extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null || v.extraimg

 

     }})
  }
   if(category == 'Devices'){
     await Devices.findByIdAndUpdate(id , {$set : {
      title:title || d.title, 
      price:price || d.price, 
      description:description || d.description , 
      location: location  || d.location, 
      specific:specific || d.specific , 
   bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null || d.bgimg,
      secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null || d.secondimg,
   extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null || d.extraimg

 

     }})
  }
  if(category == 'Furnitures'){
await Furnitures.findByIdAndUpdate(id , {$set : {
      title:title || f.title, 
      price:price || f.price, 
      description:description || f.description , 
      location: location  || f.location, 
      specific:specific || f.specific , 
   bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null || f.bgimg,
      secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null || f.secondimg,
   extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null || f.extraimg

 

     }})
  }
  if(category == 'Appliances'){
     await Appliances.findByIdAndUpdate(id , {$set : {
      title:title || a.title, 
      price:price || a.price, 
      description:description || a.description , 
      location: location  || a.location, 
      specific:specific || a.specific , 
   bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null || a.bgimg,
      secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null || a.secondimg,
   extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null || a.extraimg

 

     }}) ; 
  }
  if(category == 'Fashion'){
     await Fashion.findByIdAndUpdate(id , {$set : {
      title:title || fa.title, 
      price:price || fa.price, 
      description:description || fa.description , 
      location: location  || fa.location, 
      specific:specific || fa.specific , 
   bgimg: req.files['bgimg'] ? req.files['bgimg'][0].path : null || fa.bgimg,
      secondimg: req.files['secondimg'] ? req.files['secondimg'][0].path : null || fa.secondimg,
   extraimg: req.files['extraimg'] ? req.files['extraimg'][0].path : null || fa.extraimg

 

     }}) ; 
  }
  res.redirect(`/edit/${category}/${id}`)
});
app.get('/opt' , async(req,res) => {
  res.render('demo')
})

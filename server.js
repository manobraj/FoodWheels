require('dotenv').config()
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const ejs = require('ejs');
// it is help us to stop the repetiton of code
const expressLayout = require("express-ejs-layouts");
const path = require('path');
const mongoose = require("mongoose");
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport');
const Emitter = require('events')

//data base connection with mongodb
const url = 'mongodb://localhost/pizza';
mongoose.connect(url, { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify : true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connection failed...')
});

//store the session
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

// event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)


//session config it works as a middlwware to stre the functionality like store items in card
app.use(session({
    secret: process.env.COOKIE_SCERET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour
}))

//passwort config
const passportInit = require('./app/config/passport');
const { Server } = require('http');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

//use flash as a midddleware
app.use(flash());

//assests
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// global middleware
app.use((req,res,next)=> {
     res.locals.session = req.session
     res.locals.user = req.user
     next()
})

//set template engine
app.use(expressLayout);
//now we have to tell the express where our html,css file located
app.set('views',path.join(__dirname, '/resources/views'));
app.set('view engine','ejs');

require('./routes/web')(app)

// route for cart page
app.get('/cart',(req,res)=> {
    res.render('customers/cart')
});


const server = app.listen(PORT,()=> {
console.log(`listening to the server ${PORT}`);
});

//socket connection 
const io = require('socket.io')(server)
io.on('connection',(socket)=> {
     console.log(socket.id);
     socket.on('join',(orderId)=> {
     socket.join(orderId)
     console.log(orderId);
     })
})

eventEmitter.on('orderUpdated',(data)=> {
     io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data)=> {
    io.to('adminRoom').emit('orderPlaced', data)
})














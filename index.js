const mongoose=require('mongoose');

var bodyParser = require('body-parser');
const cool = require('cool-ascii-faces');
const express = require('express');
const path = require('path');
require('dotenv').config();

var cors = require ('cors');

const PORT = process.env.PORT || 8080;


  // DB Connection____________________________________________
const uri =  process.env.ATLAS_URI;
var options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    promiseLibrary: global.Promise
};
 mongoose.connect(uri, options);
  const connection =mongoose.connection;  
 
connection.once('connected', ()=>{
    console.log('MongoDB database connection established successfully');
})  

//__________________________________________________________________________
/* ---------- Routers ---------- */
const book_router   = require('./src/routers/Book.router')
const user_router = require('./src/routers/User.router');
const userLogin_router = require('./src/routers/UserLogin.router');



express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .engine('html', require('ejs').renderFile)
  .set('view engine', 'html')
  /* .set('view engine', 'ejs') */
  .get('/', (req, res) => res.render('pages/index'))

  .use(cors())

.use(function (req, res, next) {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
})
  .use(bodyParser.json())
  .use('/books',book_router)
  .use('/users',user_router)
  .use('/userLogin',userLogin_router)

  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

  
  /* 
  .get('/AllServants', (req, res) => res.render('pages/AllServants'))
  .get('/AddServants', (req, res) => res.render('pages/AddServants'))
  .get('/home', (req, res) => res.render('pages/homecomp'))
  */
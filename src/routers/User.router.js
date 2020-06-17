const router=require('express').Router();
let User =require('../models/User');
let auth = require('../middleware/auth');
let UserLoginRouter = require('../routers/UserLogin.router');
let UserLogin  =require('../models/UserLogin');

//  -------------------------------- Middle ware --------------------------------------
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');
    // grab the _id from the request header
    let _id = req.header('_id');
    UserLogin.findByIdAndToken(_id, refreshToken).then((userLogin) => {
        if (!userLogin) {
            // userLogin couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }
        /* if the code reaches here - the user was found
         therefore the refresh token exists in the database 
         but we still have to check if it has expired or not */
         
         
         req.userLogin_id = userLogin._id;
        req.userLoginObject = userLogin;
        req.refreshToken = refreshToken;

        let isSessionValid = false;
        userLogin.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (UserLogin.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });
        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

// User Router ----------------------------------------------------------------------
// GET All User ___________________________________
router.get('/',auth,(req,res)=>{
    User.find()
     .then(users=>res.json(users))
     .catch(err => res.status(400).json('Error : '+err));
});

// Get User By id ____________________________________
router.get('/:id',auth,(req,res)=>{
    User.findById(req.params.id)
     .then(user=>res.json( user ))
     .catch(err => res.status(400).json('Error : '+err));
});

// Delete User By id -----------------------------------------
router.delete('/:id',auth,(req,res)=>{

    User.findOneAndDelete(req.params.id)
     .then(()=>res.json('User deleted'))
     .catch(err => res.status(400).json('Error : '+err));
});



// Add New User _________________________
router.post('/add',(req,res)=>{

 let LoginID; 

/* --------- create Login --------- */
    const email = req.body.email;
    const password = req.body.password;
    let newUserLogin = new UserLogin({
        email,
        password
    });

   newUserLogin.save()
    
    .then( async ()=>{
        return newUserLogin.createSession();
    }).then((refreshToken) =>{
         /* Session created successfully - refreshToken returned.
             => now we geneate an access auth token for the userLogin  */
        return newUserLogin.generateAccessAuthToken().then((accessToken)=>{
         /* access auth token generated successfully
            => now we return an object containing the auth tokens  */
          return {accessToken, refreshToken}
        });
    }).then((authTokens)=>{
          /* Now we construct and send the response to the userLogin
              with their auth tokens in the header and the userLogin object in the body */
         res
         .header('x-refresh-token', authTokens.refreshToken)
         .header('x-access-token', authTokens.accessToken)
         .send(newUserLogin);

         const LoginID = newUserLogin._id;
         /* ------------------------------- */
         const Firstname=req.body.Firstname;
         const LastName=req.body.LastName;
         const MyBooks=req.body.MyBooks;
         
         const NewUser = new User({
             Firstname,
             LastName,
             MyBooks,
             LoginID
         });
         NewUser.save()
         
         .then(async()=>res.json('User Added! '))
         .catch(err=> res.status(400).send('Error :'+err));

         /* ------------------------------- */
    }).catch((e) => {
        res.status(400).send(e);
    })
   
   /* --------------------------------- */

    
});

// Update User--------------------------------------

router.patch('/update/:id',auth,(req,res)=>{
   
    User.findById(req.params.id)
    .then(user =>{
        
        user.Firstname=req.body.Firstname;
        user.LastName=req.body.gender;
        user.MyBooks=req.body.MyBooks;
        user.LoginID=  req.body.LoginID;

      

        user.save()
    .then(()=>res.json('user Updated'))
    .catch(err=>res.status(400).json('Error: '+err))
    })

    .catch(err=>res.status(400).json('Error : '+err));
});
//---------------------------------------------------------------------------------------------   

module.exports=router;
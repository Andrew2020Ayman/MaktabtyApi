const router=require('express').Router();
let UserLogin =require('../models/UserLogin');
let auth = require('../middleware/auth');

const lodash = require('lodash');


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

//  -------------------------------- UserLogin Router --------------------------------------

// ** Post New UserLogin => Add New userLogin 
router.post('/add',(req,res)=>{

    const email = req.body.email;
    const password = req.body.password;

    let newUserLogin = new UserLogin({
        email,
        password
    });

    newUserLogin.save()
    
    .then(()=>{
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
    }).catch((e) => {
        res.status(400).send(e);
    })
})

// ** Post UserLogin => Login userLogin { userLogin role }
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    UserLogin.findByCredentials(email, password).then((userLogin) => {
        return userLogin.createSession().then((refreshToken) => {
            /* Session created successfully - refreshToken returned.
              now we geneate an access auth token for the userLogin  */

            return userLogin.generateAccessAuthToken().then((accessToken) => {
                /* access auth token generated successfully
                 now we return an object containing the auth tokens  */
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            /* Now we construct and send the response to the userLogin
              with their auth tokens in the header and the userLogin object in the body */
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(userLogin);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})


router.get('/',auth,(req,res)=>{
    UserLogin.find()
     .then( (userLogins)=>{
         res.json(userLogins);
        })
     .catch(err => res.status(400).json('Error : '+err));
});

router.get('/:id',auth,(req,res)=>{
    UserLogin.findById(req.params.id)
     .then( (userLogins)=>{
         res.json(userLogins);
        })
     .catch(err => res.status(400).json('Error : '+err));
});

// Delete UserLogin By id -----------------------------------------
router.delete('/:id',auth,(req,res)=>{

     UserLogin.findByIdAndRemove(req.params.id)
     .then(()=>res.json('UserLogin deleted'))
     .catch(err => res.status(400).json('Error : '+err)); 
     
});

/*   Access-token  */
router.get('/me/access-token',verifySession,(req,res)=>{
    req.userLoginObject.generateAccessAuthToken().then((accessToken)=>{
        res.header('x-access-token',accessToken).send({accessToken});
    }).catch((e)=>{
          res.status(400).send(e);
    });
})

// ---------------------------------------------------------------------------------------
module.exports=router;
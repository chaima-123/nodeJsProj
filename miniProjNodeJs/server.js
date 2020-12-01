
var express = require("express");
var nodemailer = require("nodemailer");
var express = require("express");
var bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
var crypto = require("crypto");
const multer = require('multer');
const upload = multer({dest: 'uploads/'})

var app = express();
var port = 3000;

var users = require("./Models/User")
var tokenss = require("./Models/Tokenn")
var token = require("./Models/Test")


require('./Models/counterModel')


var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Import the mongoose module
var mongoose = require('mongoose')
var path = require('path');
const { ObjectId } = require("bson");
//Set up detfault mongoose connection
var mongoDb = 'mongodb://localhost:27017/jobber';
mongoose.connect(mongoDb, { useNewUrlParser: true });
//Get Mongoose to use the global promise library

mongoose.Promise = global.Promise;
// Get the default connection
var db = mongoose.connection;

//bind connection to error event ( to get notification of connection errors
db.on('error', console.error.bind(console, 'mongoDb connection error:'));


app.use(express.static(path.join(__dirname, 'public')));
app.listen(3000, function () {
  console.log("Connected okkk!!")
})

app.get('/', function (req, res) {
  res.send('<p> Welcome </p>')
})

//Affichage de tous les utilisateurs
app.get('/showAll', function (req, res) {
  users.find()
    .exec(function (err, result) {
      if (err) res.send(err)
      else res.json(result)
    })
});


//Connexion User avec email et mdp
app.get('/login', function (req, res) {
  users.findOne({ email: req.query.email }, function (err, result) {
    res.send(result[0])
    console.log(result[0])

  })
});

//Ajout Utilisateur
app.get("/register", (req, res) => {
  var userNew = new users({
    firstName: req.query.firstName,
    lastName: req.query.lasttName,
    date_birth: req.query.date_birth,
    adress: req.query.adress,
    city: req.query.city,
    tel: req.query.tel,
    email: req.query.email,
    password: req.query.password,
    role: req.query.role,
    staus: "disponible"
  }
  );
  userNew.save(function (err, result) {
    res.send(result);
  });
});




/*
app.get('/reg',function (req,res) {
  
  userNew.save( function (err) {
    if (err) {
        console.log(err)
        res.send("error")
    }
  });
});*/

app.get("/signIn", (req, res) => {
  /*  user = new user({ firstName: req.body.firstName, email: req.body.email, password: req.body.password });
    user.save(function (err) {
        if (err) { 
          return res.status(500).send({msg:err.message});
        }
  
        // create and save user
     
            // generate token and save
            
                // Send email (use credintials of SendGrid)
                var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
                var mailOptions = { from: 'chaima.besbes2@gmail.com', to: 'chaima.besbes@esprit.tn', subject: 'Account Verification Link', text: 'Hello '+ req.body.firstName +',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + '\n\nThank You!\n' };
                transporter.sendMail(mailOptions, function (err) {
                    if (err) { 
                        return res.status(500).send({msg:'Technical Issue!, Please click on resend for verify your Email.'});
                     }
                    return res.status(200).send('A verification email has been sent to ' + user.email + '. It will be expire after one day. If you not get verification Email click on resend token.');
                });
            });*/
});


app.get("/signIn", (req, res, next) => {
  user.findOne({ email: 'chaima.besbes@esprit.tn' }, function (err, user) {
    // error occur
    if (err) {
      return res.status(500).send({ msg: err.message });
    }
    // if email is exist into database i.e. email is associated with another user.
    else if (user) {
      return res.status(400).send({ msg: 'This email address is already associated with another account.' });
    }
    // if user is not exist into database then save the user into database for register account
    else {
      // password hashing for save into databse
      req.body.password = bcrypt.hashSync(req.body.password, 10);
      // create and save user
      user = new user({ firstName: req.body.firstName, email: req.body.email, password: req.body.password });
      user.save(function (err) {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }

        // generate token and save

        /* var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
         token.save(function (err) {
           if(err){
             return res.status(500).send({msg:err.message});
           }*/
        // Send email (use credintials of SendGrid)
        var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
        var mailOptions = {
          from: 'chaima.besbes2@gmail.com', to: user.email, subject: 'Account Verification Link', text: 'Hello ' + req.body.name + ',\n\n' +
            'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + '\/' + token.token + + '\n\nThank You!\n'
        };
        transporter.sendMail(mailOptions, function (err) {
          if (err) {
            return res.status(500).send({ msg: 'Technical Issue!, Please click on resend for verify your Email.' });
          }
          return res.status(200).send('A verification email has been sent to ' + user.email + '. It will be expire after one day. If you not get verification Email click on resend token.');
        });
      });
    }

  });
});


var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "chammoo.bes@gmail.com",
    pass: "chahrazed"
  }
});

/*userNew = new usera ( {     
   firstName: "haha",
   email: "haha",
   password:"aaa"
   
 });
 */
app.get('/usercheck', function (req, res) {
  users.findOne({ email: req.query.email }, function (err, user) {
    if (err) {
      console.log(err);
    }
    var message;
    if (user) {
      console.log(user)
     // message = "This email address is already associated with another account.";
      user.message= "This email address is already associated with another account."
      console.log(message)
    } else {
      message = "user doesn't exist";
      // create and save user
      userNew = new users({
        firstName: req.query.firstName,
        lastName:req.query.lastName,
        email: req.query.email,
        password: req.query.password,
        tel:req.query.tel,
        city :req.query.city


      });
      userNew.password = bcrypt.hashSync(req.query.password, 10);

      // user = new user({ firstName: req.query.firstName, email: req.query.email, password: req.query.password });
      userNew.save(function (err) {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }
        tt = new token({ _userId: userNew._id, token: crypto.randomBytes(16).toString('hex') });
        tt.save(function (err) {
          if (err) {
            return res.status(500).send({ msg: err.message });
          }
          console.log(tt.token);

          var mailOptions = {
            to: userNew.email,
            subject: 'Account Verification Link',
            text: 'Hello ' +
              userNew.firstName + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/'
              + req.headers.host + '\/confirmation\/' + userNew.email + '\/' + tt.token + '\n\nThank You!\n'

          }
          console.log(mailOptions);
          smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
              console.log(error);
              // res.end("error");
            }
          });
        });
      });

    }
    res.send(user)
  });
});


// It is GET method, you have to write like that
//    app.get('/confirmation/:email/:token',confirmEmail)

app.get('/confirmation/:email/:token', function (req, res, next) {
  token.findOne({ token: req.params.token }, function (err, token) {
    // token is not found into database i.e. token may have expired 
    if (!token) {
      return res.status(400).send({ msg: 'Your verification link may have expired. Please click on resend for verify your Email.' });
    }
    // if token is found then check valid user 
    else {
      users.findOne({ _id: token._userId, email: req.params.email }, function (err, user) {
        // not valid user
        if (!user) {
          return res.status(401).send({ msg: 'We were unable to find a user for this verification. Please SignUp!' });
        }
        // user is already verified
        else if (user.isVerified) {
          return res.status(200).send('User has been already verified. Please Login');
        }
        // verify user
        else {
          // change isVerified to true
          user.isVerified = true;
          user.save(function (err) {
            // error occur
            if (err) {
              return res.status(500).send({ msg: err.message });
            }
            // account successfully verified
            else {
              return res.status(200).send('Your account has been successfully verified');
            }
          });
        }
      });
    }

  });
});




app.post('/loginn', function (req, res, next) {
  users.findOne({ email: req.query.email }, function (err, result) {

    if (err) {
      return res.status(500).send({ msg: err.message });
    }
    //var passwordIsValid = bcrypt.compareSync(req.query.password, result.password);

    else if (!result) {
      return res.json({ msg: 'The email address is not associated with any account. please check and try again!' });
    }
    else if (!bcrypt.compareSync(req.query.password, result.password)) {
      
    result.message ="wrong password";

    }
    else if (!result.isVerified)
     {
      result.message = "Your Email has not been verified. Please click on resend" ;
     }

    // user successfully logged in
    else
    {
      result.message ="succed";
    }
    res.send(result)

  });

});

var GoogleTokenStrategy = require('passport-google-id-token');
var passport = require('passport');


     app.use(passport.initialize());
     app.use(passport.session());

     passport.use(new GoogleTokenStrategy({
        clientID: "555833312271-ra8etfdg9pamnu9pjmpbjv72mkussu7t.apps.googleusercontent.com"
     }, function(parsedToken, googleId, done) {
        // logic for finding user in db
     }
     ));

  

app.post('/auth/google',
passport.authenticate('google-id-token'),
function (req, res) {
res.send(req.user? 200 : 401);
}
);


app.get('/update',function(req,res){
  users.findOneAndUpdate({id:req.query.id},{$set:{email:req.query.email , tel:req.query.tel}},{new:true},function(err,result){
       if(err) console.log(err.message) ;
     res.send(result);
   
   })
});


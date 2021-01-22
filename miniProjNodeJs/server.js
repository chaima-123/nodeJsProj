
var express = require("express");
var nodemailer = require("nodemailer");
var express = require("express");
var bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
var crypto = require("crypto");
const multer = require('multer');


var app = express();
var port = 3000;
var service = require("./Models/Service")

var users = require("./Models/User")
var commentaire = require("./Models/comment-model")
var chat= require("./Models/Chat")

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





app.get('/reg',function (req,res) {
  
  userNew.save( function (err) {
    if (err) {
        console.log(err)
        res.send("error")
    }
  });
});



var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "jobber.esprit@gmail.com",
    pass: "jobber123"
  }
});


function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

console.log(makeid(5))
app.get('/authentification',function (req,res) {
    
  users.findOneAndUpdate({email:req.query.email},{$set:{ resetPasswordToken:makeid(5)}},{new:true},
  (function (err, result) {
        
    if(result) { 
        var mailOptions={
            to : result.email,
            subject : "Changement de mot de passe",
            text : "Vous trouvez ci-joint votre code d'authentification  "+ result.resetPasswordToken,
        }
        console.log(mailOptions);
        smtpTransport.sendMail(mailOptions, function(error, response){
         if(error){
                console.log(error);
           // res.end("error");
         }
    });
    res.send(result);
   }
   else{
    console.log(err)
 } 
   
  })    
  )
  })
  

  app.post('/verifyCode',function (req,res) 
  {
    users.findOneAndUpdate({resetPasswordToken:req.query.resetPasswordToken},{$set:{resetPasswordToken:""}},{new:true},
    function(err, result) { 
    if(err)
     { 
       console.log(result.resetPasswordToken);
       res.send(err);
        } 
   else
   { 
  res.send(result) 
   }
}) ; 
})
  



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

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null,file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});



var fs = require('fs');



// Post files
app.post(
  "/upload",
  multer({
    storage: storage
  }).single('upload'), function(req, res) {
   // console.log(req.file);
   // console.log(req.body);
    //res.redirect("/uploads/" + req.file.filename);
    console.log(req.file.filename);
    return res.status(200).end();
  });

app.get('/uploads/:upload', function (req, res){
  file = req.params.upload;
  console.log(req.params.upload);
  var img = fs.readFileSync(__dirname + "/uploads/" + file);
  res.writeHead(200, {'Content-Type': 'image/png' });
  res.end(img, 'binary');

});


app.get('/send', function(err,res){
  if (err) {
    return res.status(500).send({ msg: err.message });
  }
 
  res.writeHead(200, {'Content-Type': 'image/jpeg'});

      res.sendFile('./uploads/image.png');
  
});


app.use('/uploads', express.static('uploads'));


//Affichage de tous les utilisateurs
app.get('/showPrestataire', function (req, res) {
  users.find({ role:"prestataire" }).exec(function (err, result) {
    if (err) res.send(err)
    else res.json(result)
  })
  
});

//Affichage de tous les utilisateurs
app.get('/showPlomb', function (req, res) {
  users.find({ role:"prestataire", profession:"Plombier",  adress :req.query.adress }).exec(function (err, result) {
    if (err) res.send(err)
    else res.json(result)
  })
  
});

app.get('/showMenuisier', function (req, res) {
  users.find({ role:"prestataire", profession:"Menuisier",  adress :req.query.adress }).exec(function (err, result) {
    if (err) res.send(err)
    else res.json(result)
  })
  
});

app.get('/showElect', function (req, res) {
  users.find({ role:"prestataire", profession:"Electricien" , adress :req.query.adress }).exec(function (err, result) {
    if (err) res.send(err)
    else res.json(result)
  })
  
});


app.get('/updateRole',function(req,res){
  users.findOneAndUpdate({id:req.query.id},{$set:{role:"prestataire" ,profession:req.query.profession , description:req.query.description}},{new:true},function(err,result){
       if(err) console.log(err.message) ;
     res.send(result);
   })
   });

   app.get('/lastRecord',function(req,res){
    users.find().limit(1).sort({$natural:-1}).exec(function (err, result)
    {   // console.log(result) 
    users.findOneAndUpdate({id:req.query.id},{$set:{image:"/uploads/"+result[0]._id +".jpeg"}},{new:true},function(err,ress){
         if(err) 
         console.log(err.message) ;
       res.send(ress);
     //console.log(ress+"kkkkkkkk")
     })
     });
    });


    app.get('/updateUser',function(req,res){
      users.findOneAndUpdate({id:req.query.id},{$set:{firstName:req.query.firstName , lastName:req.query.lastName , 
        email:req.query.email , tel:req.query.tel , image:"/uploads/"+req.query.id +".jpeg"}},{new:true},function(err,result){
           if(err) console.log(err.message) ;
         res.send(result);
       })
       });

       app.get('/updatePassword',function(req,res){
        users.findOneAndUpdate({id:req.query.id},{$set:{password:bcrypt.hashSync(req.query.password, 10)}},{new:true},function(err,result){
             if(err) console.log(err.message) ;
           res.send(result);
         })
         });


app.post('/checkPass', function (req, res, next) {
  users.findOne({ id: req.query.id }, function (err, result) {
    if (err) {
      return res.status(500).send({ msg: err.message });
    }
    //var passwordIsValid = bcrypt.compareSync(req.query.password, result.password);
    else if (!bcrypt.compareSync(req.query.password, result.password)) {
      result.message ="Mot de passe érroné"
    }
    // user successfully logged in
    else {
      result.message = 'succed' ;
    }
    res.send(result)

  });

});


app.get('/rate',function (req,res) {  
  users.findOne( {id:req.query.id}),(function (err, user) {      
    if(user) 
       {
        users.findOneAndUpdate({id:user.id},
         function(err, result) { 
          result.rate = (req.query.rate + result.rate)/2

            if(err) { throw err; } 
            else
              console.log("okkkkkkkkkk") 
          }) ;
       }
    else {   console.log("okkkkkkkkkk") }
    res.send(user);
   
})  
})



app.get('/aa',function(req,res){
  users.findOne({id:req.query.id},function(err,user){
       if(err) console.log(err.message) ;
     //res.send(result);
    else {
      users.findOneAndUpdate({id:user.id},{rate : (req.query.rate+ user.rate)/2},{new:true},
       function(err, result) 
       { 
          if(err) { throw err; } 
          else
            console.log("up") 
        }) ;
     }
     res.send(user);
   })
   });


   
app.post("/addComment", (req, res) => {
  var commentaireNew = new commentaire({
    idPrestataire: req.query.idPrestataire,
    idUser: req.query.idUser,
    userName:req.query.userName,
    dateCommentaire:req.query.dateCommentaire,
    contenu:req.query.contenu,
  image: req.query.image}
  );
  commentaireNew.save(function (err, result) {
    res.send(result);
  });
});


app.get('/rating',function(req,res){
  users.findOneAndUpdate({id:req.query.id},{$set:{rate:req.query.rate}},{new:true},function(err,result){
       if(err) console.log(err.message) ;
     res.send(result);
   })
   });
   
   app.get('/showComment', function (req, res) 
   {
    commentaire.find({ idPrestataire: req.query.idPrestataire }).sort({'_id' : -1}).exec(function (err, result) {
      if (err) res.send(err)
      else res.json(result)
    })  
  });


  app.get('/deleteComment', function (req, res) {
    commentaire.findOneAndDelete({ id: req.query.id }).exec(function (err, result) {
      if (err) res.send(err)
      else res.send(result)
    })
  });

  app.get('/updateComment', function (req, res)
  {
    commentaire.findOneAndUpdate({id:req.query.id},{$set:{contenu:req.query.contenu}},{new:true},function(err,result){
      if (err) res.send(err)
      else res.send(result)
    })
  });


  app.delete('/deleteComment', function (req, res)
  {
    commentaire.findOneAndDelete({id:req.query.id},function(err,result){
      if (err) res.send(err)
      else res.send(200)
   
    })
  });
  
app.get('/addChat', function (req, res) 
  {
    var chatNew = new chat({
      user_name: req.query.user_name,
      rec: req.query.rec,
      text: req.query.text,
     }
    );
    chatNew.save(function (err, result) {
      if (err) res.send(err)
      else     res.send(result);
       })   
  });

  app.get('/findChat', function (req, res) {
   // { user_name: { $in: [ "chaima", "oumaima" ] } }  
  chat.find(   { $and: [ { user_name: { $in: [ req.query.user_name, req.query.rec ] } } ,
   { rec: { $in: [  req.query.rec, req.query.user_name, ] } }   ] }
    ).exec(function (err, result) {
    if (err) res.send(err)
    else res.json(result)
  })
})


app.get('/updateStatus', function (req, res) {
  chat.find({user_name:req.query.user_name},function(err,result){
    for(var i = 0; i < result.length;i++)
          {
      chat.findOneAndUpdate({user_name:result[i].user_name},{$set:{is_sent_by_me:true}},{new:true},function(err,resultt){
        if (err) res.send(err)
         console.log(resultt)
      })

    }
    if (err) res.send(err)
    else res.send(result)
  })
});

app.get('/updateCity', function (req, res)
{
  users.findOneAndUpdate({id:req.query.id},{$set:{city:req.query.city}},{new:true},function(err,result){
    if (err) res.send(err)
    else res.send(result)
  })
});

app.get("/demandeService", (req, res) => {
  var serviceNew = new service({
    client_id: req.query.client_id,
    client_name: req.query.client_name,
    prestatire_id:req.query.prestatire_id,
    prestatire_name:req.query.prestatire_name,
    type:req.query.type,
    description:req.query.description,
    etat:"En attente"
  }
  );
  serviceNew.save(function (err, result) {
    res.send(result);
  });
});



app.get('/showServiceClient', function (req, res) {
  service.find({ client_id: req.query.client_id}).exec(function (err, result) {
    if (err) res.send(err)
    else res.json(result)
  })
  
});


app.get('/showServicePro', function (req, res) {
  service.find({ prestatire_id: req.query.prestatire_id}).exec(function (err, result) {
    if (err) res.send(err)
    else res.json(result)
  })
  
});



app.get('/updateEtatService',function(req,res){
  service.findOneAndUpdate({id:req.query.id},{$set:{etat:req.query.etat}},{new:true},function(err,result){
       if(err) console.log(err.message) ;
     res.send(result);
   })
   });

   app.get('/ConfirmerDemande',function (req,res) {
    
    service.findOneAndUpdate({id:req.query.id},{$set:{ etat:"accepté"}},{new:true},
    (function (err, result) {
      users.findOne({ id: result.client_id }, function (err, user) {
          
      if(result) { 
          var mailOptions={
              to : user.email,
              subject : "Confirmation de votre demande",
              text : "Bonjour Mr/Madame, votre demande a été bien accéptée.Merci pour votre confiance.  "
          }
          console.log(mailOptions);
          smtpTransport.sendMail(mailOptions, function(error, response){
           if(error){
                  console.log(error);
             // res.end("error");
           }
      });
      res.send(result);
     }
     else{
      console.log(err)
   } 
  })
    })    
    )
    })
    
  
    app.get('/RefuserDemande',function (req,res) {
      
      service.findOneAndUpdate({id:req.query.id},{$set:{ etat:"refusé"}},{new:true},
      (function (err, result) {
        users.findOne({ id: result.client_id }, function (err, user) {
            
        if(result) { 
            var mailOptions={
                to : user.email,
                subject : "Annulation de votre demande",
                text : "Bonjour Mr/Mme, Je vous prie de bien vouloir accepter toutes mes excuses pour cette indisponibilité. J’espère que nous pourrons nous rencontrer à une autre date.   "
            }
            console.log(mailOptions);
            smtpTransport.sendMail(mailOptions, function(error, response){
             if(error){
                    console.log(error);
               // res.end("error");
             }
        });
        res.send(result);
       }
       else{
        console.log(err)
     } 
    })
      })    
      )
      })


      app.get('/findUser', function (req, res) {
        users.findOne({ id:req.query.id}).exec(function (err, result) {
          if (err) res.send(err)
          else res.send(result)
        })
        
      });
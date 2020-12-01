var mongoose = require('mongoose');
var Schema= mongoose.Schema;
const autoIncrementModelID = require('./counterModel');

var userSchema= new Schema({

    id: { type: Number, unique: true, min: 1 },
    firstName:{ type: String, default:""},
    lastName:{ type: String, default:""},
    dateBirth:{ type: String, default:""},
    adress:{ type: String, default:""},
    city:{ type: String, default:""},
    tel: { type: String, default:""},
    email: { type: String, unique: true },
    isVerified: { type: Boolean, default: false },  
    password: { type: String, default:""},
    role:{ type: String, default:""},
    staus:{ type: String, default:""},
    message:{ type: String, default:""}
    
  })

  userSchema.pre('save', function (next) {
    if (!this.isNew) {
      next();
      return;
    }
   autoIncrementModelID('counterUser', this, next);
  });
  
  var user = mongoose.model('User', userSchema);
  module.exports= user ;
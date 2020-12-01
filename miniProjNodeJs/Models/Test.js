var mongoose = require('mongoose');
var Schema= mongoose.Schema;
const autoIncrementModelID = require('./counterModel');

var TokenTestSchema= new Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    expireAt: { type: Date, default: Date.now, index: { expires: 86400000 }}
    
    
  })

  TokenTestSchema.pre('save', function (next) {
    if (!this.isNew) {
      next();
      return;
    }
   autoIncrementModelID('counterUser', this, next);
  });
  
  var token = mongoose.model('tokenTest', TokenTestSchema);
  module.exports= token ;
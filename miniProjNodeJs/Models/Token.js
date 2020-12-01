var mongoose = require('mongoose');
var Schema= mongoose.Schema;

var tokenSchema =  new mongoose.Schema({
    userId: { type:String, required: true },
    token: { type: String, required: true },
    expireAt: { type: Date, default: Date.now, index: { expires: 86400000 } }
});


tokenSchema.pre('save', function (next) {
    if (!this.isNew) {
      next();
      return;
    }
  });
  
  var tokens = mongoose.model('tokens',tokenSchema);
  module.exports= tokens ;
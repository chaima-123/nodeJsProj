var mongoose = require('mongoose');
var Schema= mongoose.Schema;

var tokensSchema =  new mongoose.Schema({
    expireAt: { type: Date, default: Date.now, index: { expires: 86400000 } },
    token: { type: String }

});



tokensSchema.pre('save', function (next) {
    if (!this.isNew) {
      next();
      return;
    }
  });
  
  var tokenn = mongoose.model('tokenn',tokensSchema);
  module.exports= tokenn ;
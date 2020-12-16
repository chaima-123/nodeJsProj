var mongoose = require('mongoose');
var Schema= mongoose.Schema;
const autoIncrementModelID = require('./counterModel');

var chatSchema= new Schema({

    id: { type: Number, unique: true, min: 1 },
  
    user_name:{ type: String, default:""},
    user_image_url:{ type: String, default:""},
    is_sent_by_me : { type: Boolean, default: false },
    text:{ type: String, default:""},
    rec :{ type: String, default:""}

  })

  chatSchema.pre('save', function (next) {
    if (!this.isNew) {
      next();
      return;
    }
   autoIncrementModelID('counterChat', this, next);
  });
   
  var chat = mongoose.model('chat', chatSchema);
  module.exports= chat ;
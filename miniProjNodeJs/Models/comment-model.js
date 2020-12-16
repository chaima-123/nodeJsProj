var mongoose = require('mongoose');
var Schema= mongoose.Schema;
const autoIncrementModelID = require('./counterModel');

var commentaireSchema= new Schema({

    id: { type: Number, unique: true, min: 1 },
    idPrestataire:{ type: Number,default:"" },
    idUser:{ type: Number,default:"" },
    dateCommentaire:{ type: Date, default: Date.now },
    contenu:{ type: String, default:""},
    userName:{ type: String, default:""},
    image:{ type: String, default:""}

    
  })

  commentaireSchema.pre('save', function (next) {
    if (!this.isNew) {
      next();
      return;
    }
   autoIncrementModelID('counterCommentaire', this, next);
  });
   
  var commentaire = mongoose.model('commentaire', commentaireSchema);
  module.exports= commentaire ;
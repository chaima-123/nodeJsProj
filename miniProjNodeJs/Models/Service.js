
var mongoose = require('mongoose');
var Schema= mongoose.Schema;
const autoIncrementModelID = require('./counterModel');

var serviceSchema= new Schema({

    id: { type: Number, unique: true, min: 1 },
    client_id:{ type: Number, default:""},
    client_name:{ type: String, default:""},

    prestatire_id:{ type: Number, default:""},
    prestatire_name:{ type: String, default:""},

    type:{ type: String, default:""},
    description:{ type: String, default:""},
    etat:{ type: String, default:"En attente"},
    date_service:{ type: Date, default: Date.now}

  })

  serviceSchema.pre('save', function (next) {
    if (!this.isNew) {
      next();
      return;
    }
   autoIncrementModelID('counterService', this, next);
  });
   

  var service = mongoose.model('Service', serviceSchema);
  module.exports= service ;


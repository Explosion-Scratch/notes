const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const NoteSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
	views: {
		type: Number,
		required: false,
		default: 0,
	},
  body: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
	isPublic: {
		type: Boolean,
		default: false,
	},
  user : {
    type: Schema.Types.ObjectId,
    ref : 'User'
  }
});

module.exports = mongoose.model('Note', NoteSchema);
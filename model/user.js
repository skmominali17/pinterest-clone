const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb+srv://skmominali17:ES0uYbJOjwqWLCTf@pinspiration-dev.ul48jzu.mongodb.net/').then(() => {
  console.log('Connected to MongoDB');
})

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  name: String,
  profileImage: String,
  contact: Number,
  boards: {
    type: Array,
    default: []
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }
  ], 
  followers: {
    type: Number,
    default: 0
  }
})

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
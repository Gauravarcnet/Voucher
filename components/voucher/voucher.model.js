const mongoose = require('mongoose')
const Schema = mongoose.Schema
const voucherSchema = new Schema({
  code: {
    type: String,
    require: true,
    unique: true
  },
  pin: {
    type: String,
    require: true,
    unique: true
  },
  email: {
    type: String,
    default: '',
    lowercase: true,
    required: true

  },
  amount: {
    type: Number,
    required: true
  },
  generationTime: {
    type: Number,
    require: true,
    default: ''
  },

  attemptTime: {
    type: Number,
    require: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['redeemed', 'partiallyRedeemed', 'active'],
    default: 'active'
  },
  usageActivity: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Voucher', voucherSchema)
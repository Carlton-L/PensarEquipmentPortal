const mongoose = require("mongoose");

const RecordSchema = mongoose.Schema({
  equipment: {
    type: mongoose.ObjectId,
    required: true,
  },
  user: {
    type: mongoose.Schema({
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    }),
    required: true,
  },
  project: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: function () {
      return !this.checkOut;
    },
  },
  end: {
    type: Date,
    required: function () {
      return !this.checkOut;
    },
  },
  checkOut: {
    type: Date,
    required: function () {
      return !this.start || !this.end;
    },
  },
  checkIn: {
    type: Date,
    required: false,
  },
  created: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema({
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    }),
    required: true,
  },
  modified: {
    type: Date,
    required: false,
  },
  modifiedBy: {
    type: mongoose.Schema({
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    }),
    required: false,
  },
});

module.exports = mongoose.model("record", RecordSchema);

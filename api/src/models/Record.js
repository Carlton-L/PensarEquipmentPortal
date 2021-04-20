const mongoose = require("mongoose");

const RecordSchema = mongoose.Schema({
  equipment: {
    type: ObjectId,
    required: true,
  },
  user: {
    type: {
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
    },
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
    user: {
      type: {
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
      },
      required: true,
    },
  },
  modified: {
    type: Date,
    required: false,
  },
  modifiedBy: {
    user: {
      type: {
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
      },
      required: false,
    },
  },
});

module.exports = mongoose.model("record", RecordSchema);

const mongoose = require("mongoose");

const EquipmentSchema = mongoose.Schema({
  qr: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  mfg: {
    type: String,
    required: true,
  },
  mfgPn: {
    type: String,
    required: true,
  },
  mfgSn: {
    type: String,
    required: true,
  },
  calibrations: [
    {
      type: {
        id: {
          type: String,
          required: true,
        },
        file: {
          type: String,
          required: true,
        },
        calibrated: {
          type: Date,
          required: true,
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
      },
      required: false,
    },
  ],
  receipts: [
    {
      type: {
        id: {
          type: String,
          required: true,
        },
        file: {
          type: String,
          required: true,
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
      },
      required: false,
    },
  ],
  comments: [
    {
      type: {
        id: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
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
      },
      required: false,
    },
  ],
  image: {
    type: {
      id: {
        type: String,
        required: true,
      },
      deleteHash: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    required: false,
  },
  isActive: {
    type: Boolean,
    required: true,
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

module.exports = mongoose.model("equipment", EquipmentSchema);

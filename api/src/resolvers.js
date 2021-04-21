const { nanoid } = require("nanoid");

module.exports = {
  Query: {
    equipmentById(_, { _id }, { models: { Equipment } }) {
      return Equipment.findOne({ _id: _id }).then((equipment) => {
        return {
          ...equipment,
          status,
          calStatus,
          log,
          schedule,
        };
      });
    },
  },
  Mutation: {
    addEquipment(
      _,
      { input: { user, description, mfg, mfgPn, mfgSn } },
      { models: { Equipment } }
    ) {
      // user is a user object
      // mfg, mfgPn, mfgSn, and description are Strings
      return Equipment.create({
        qr: nanoid(9),
        description: description,
        mfg: mfg,
        mfgPn: mfgPn,
        mfgSn: mfgSn,
        calibrations: [],
        receipts: [],
        comments: [],
        image: null,
        isActive: true,
        created: Date.now(),
        createdBy: user,
      });
    },
    uploadImage(_, { input: { url } }, { dataSources: { imgurAPI } }) {
      // url is a string
      return imgurAPI.uploadImageFromUrl(url).then(({ data }) => {
        return {
          id: data.id,
          deleteHash: data.deletehash,
          type: data.type,
          url: data.link,
        };
      });
    },
    changeImage(_, { input: { equipment, image } }, { models: { Equipment } }) {
      // FIX: Make sure this mutation returns the correct object type
      // equipment is an ObjectId
      // image is an image object
      Equipment.findById(equipment)
        .exec()
        .then((item) => {
          item.image = image;
          return item.save();
        });
    },
    checkOut(
      _,
      { input: { user, equipment, project } },
      { models: { Record } }
    ) {
      // user is a user object
      // equipment is an ObjectId
      // project is a String
      return Record.create({
        equipment: equipment,
        user: user,
        project: project,
        checkOut: Date.now(),
        checkIn: null,
        created: Date.now(),
        createdBy: user,
      });
    },
    checkIn(_, { input: { user, equipment } }, { models: { Record } }) {
      // TODO: Add logic to look for current reservation for user and delete
      // user is a user object
      // equipment is an ObjectId
      return Record.find({
        equipment: equipment,
        checkIn: null,
      })
        .exec()
        .then((item) => {
          item.checkIn = Date.now();
          item.modified = Date.now();
          item.modifiedBy = user;
          return item.save();
        });
    },
  },
  Equipment: {
    status({ id }, __, { models: { Record } }) {
      // Look for current log (checkOut date but no checkIn date)
      const log = Record.findOne({
        _id: id,
        checkIn: null,
        checkOut: { $exists: true },
      });
      if (log) {
        return "UNAVAILABLE";
      }

      // Look for current reservation
      const reservation = Record.findOne({
        _id: id,
        start: { $lte: Date.now() },
        end: { $gte: Date.now() },
      });
      if (reservation) {
        return "RESERVED";
      }

      return "AVAILABLE";
    },
    calStatus({ id }, __, { models: Equipment }) {
      // TODO: Compute cal status
    },
    log() {
      // TODO: Fetch logs
    },
    schedule() {
      // TODO: Fetch schedule
    },
  },
  User: {
    // TODO: Resolve at least logs and reservations fields
  },
  Log: {
    // TODO: Resolve at least equipment field
  },
  Reservation: {
    // TODO: Rsolve at least equipment field
  },
  Comment: {
    // TODO: Resolve at least equipment field
  },
  Receipt: {
    // TODO: Resolve at least equipment field and file field
  },
  Calibration: {
    // TODO: Resolve at least equipment field and file field
  },
  File: {
    __resolveType(file) {
      if (file.calibrated) return "Calibration";
      return "Receipt";
    },
  },
};

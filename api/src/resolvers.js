const { getDescription } = require("graphql");

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
    uploadImage(_, { url }, context) {},
  },
  Equipment: {
    status({ id }) {
      // Look for current log (checkOut date but no checkIn date)
      // const log = Record.findOne({ _id: id, checkIn: null, checkOut: { $exists: true }})
      const log = true;
      if (log) {
        return "UNAVAILABLE";
      }

      // Look for current reservation
      // const reservation = Record.findOne({ _id: id, start: { $lt: Date.now() }, end: { $gt: Date.now()}})
      // if (reservation) {
      //   return "RESERVED"
      // }

      return "AVAILABLE";
    },
  },
  File: {
    __resolveType(file) {
      if (file.calibrated) return "Calibration";
      return "Receipt";
    },
  },
  Calibration: {
    file: (_, __, context) => {
      console.log(context);
      return "filename";
    },
  },
};

const { nanoid } = require("nanoid");
const dayjs = require("dayjs");
const {
  EmailAddressResolver,
  NonEmptyStringResolver,
  ObjectIDResolver,
  TimestampResolver,
  URLResolver,
} = require("graphql-scalars");

const { OperationError, DocumentNonExistentError } = require("./utils/errors");

// [x] Handle Error: checkOut something already checked out - OperationError
// [x] Handle Error: checkIn something already checked in - OperationError
// [x] Handle Error: Equipment not found (checkOut, checkIn, editEquipment, changeImage, equipmentById, equipmentByQR) - DocumentNotExistent Error
// [ ] Handle Error: Bad file type (changeImage, uploadImage) - FileTypeError

module.exports = {
  EmailAddress: EmailAddressResolver,
  NonEmptyString: NonEmptyStringResolver,
  ObjectID: ObjectIDResolver,
  Timestamp: TimestampResolver,
  URL: URLResolver,
  Query: {
    equipment(_, __, { models: { Equipment } }) {
      return Equipment.find({}).exec();
    },
    equipmentById(_, { input: { equipment } }, { models: { Equipment } }) {
      return Equipment.findById(equipment)
        .exec()
        .then((equipment) => {
          if (!equipment) {
            throw new DocumentNonExistentError(
              "Requested ID does not match any documents in the database"
            );
          } else {
            return equipment;
          }
        });
    },
    equipmentByQR(_, { input: { qr } }, { models: { Equipment } }) {
      return Equipment.findOne({ qr: qr })
        .exec()
        .then((equipment) => {
          if (!equipment) {
            throw new DocumentNonExistentError(
              "Requested QR code does not match any documents in the database"
            );
          } else {
            return equipment;
          }
        });
    },
    user() {
      // TODO: Return user info
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
        created: +dayjs(),
        // REVIEW: Does mongoDB require that nested objects have an _id that is unique across the entire collection?
        // Each instance of a user will share an id value but be assigned a unique _id by mongoDB
        createdBy: user,
      });
    },
    editEquipment(
      _,
      { input: { id, user, qr, description, mfg, mfgPn, mfgSn, isActive } },
      { models: { Equipment } }
    ) {
      return Equipment.countDocuments({ _id: id })
        .exec()
        .then((count) => {
          if (count === 0) {
            throw new DocumentNonExistentError(
              "Requested ID does not match any documents in the database"
            );
          } else {
            const equipmentFields = {};
            if (user) equipmentFields.user = user;
            if (qr) equipmentFields.qr = qr;
            if (description) equipmentFields.description = description;
            if (mfg) equipmentFields.mfg = mfg;
            if (mfgPn) equipmentFields.mfgPn = mfgPn;
            if (mfgSn) equipmentFields.mfgSn = mfgSn;
            if (isActive) equipmentFields.isActive = isActive;
            return Equipment.findByIdAndUpdate(id, equipmentFields);
          }
        });
    },
    addReceipt(_, { input: { id, user, equipment, calibrated, file } }) {
      // TODO: Add receipt
    },
    addCalibration() {
      // TODO: Add calibration
    },
    uploadImage(_, { input: { url } }, { dataSources: { imgurAPI } }) {
      // url is a string
      return imgurAPI.uploadImageFromUrl(url).then(({ data }) => {
        return {
          id: data.id,
          deleteHash: data.deletehash,
          fileType: data.type,
          url: data.link,
        };
      });
    },
    changeImage(_, { input: { equipment, image } }, { models: { Equipment } }) {
      // equipment is an ObjectId
      // image is an image object
      return Equipment.findById(equipment)
        .exec()
        .then((item) => {
          if (!item) {
            throw new DocumentNonExistentError(
              "Requested ID does not match any documents in the database"
            );
          } else {
            image.fileType = image.type;
            delete image.type;
            item.image = image;
            return item.save();
          }
        });
    },
    checkOut(
      _,
      { input: { user, equipment, project } },
      { models: { Equipment, Record } }
    ) {
      // user is a user object
      // equipment is an ObjectId
      // project is a String

      // TODO: Add logic to check for current reservation
      // Check to verify there is not an open log for this equipment
      return Equipment.countDocuments({ _id: equipment })
        .exec()
        .then((count) => {
          if (count === 0) {
            throw new DocumentNonExistentError(
              "Requested ID does not match any documents in the database"
            );
          } else {
            return Record.countDocuments({
              equipment: equipment,
              checkIn: null,
            })
              .exec()
              .then((count) => {
                if (count > 0) {
                  throw new OperationError(
                    `Cannot check out equipment id ${equipment}: Item is currently checked out`
                  );
                } else {
                  return Record.create({
                    equipment: equipment,
                    user: user,
                    project: project,
                    checkOut: +dayjs(),
                    checkIn: null,
                    created: +dayjs(),
                    createdBy: user,
                  });
                }
              });
          }
        });
    },
    checkIn(
      _,
      { input: { user, equipment } },
      { models: { Equipment, Record } }
    ) {
      // user is a user object
      // equipment is an ObjectId

      // TODO: Add logic to look for current reservation for user and delete
      // Check to see if this equipment exists
      return Equipment.countDocuments({ _id: equipment })
        .exec()
        .then((count) => {
          if (count === 0) {
            throw new DocumentNonExistentError(
              "Requested ID does not match any documents in the database"
            );
          } else {
            // Check to verify that there is an open log for this equipment
            return Record.countDocuments({
              equipment: equipment,
              checkIn: null,
            })
              .exec()
              .then((count) => {
                if (count === 0) {
                  throw new OperationError(
                    `Cannot check in equipment id ${equipment}: Item is not currently checked out`
                  );
                } else {
                  return Record.findOne({
                    equipment: equipment,
                    checkIn: null,
                  }).then((item) => {
                    item.checkIn = +dayjs();
                    item.modified = +dayjs();
                    item.modifiedBy = user;
                    return item.save();
                  });
                }
              });
          }
        });
    },
  },
  Equipment: {
    id({ _id }) {
      return _id;
    },
    status({ id }, __, { models: { Record } }) {
      // Look for current log (checkOut date but no checkIn date)
      return Record.findOne({
        equipment: id,
        checkIn: null,
        checkOut: { $exists: true },
      })
        .exec()
        .then((log) => {
          console.log(log);
          if (log) {
            return "UNAVAILABLE";
          } else {
            return Record.findOne({
              _id: id,
              start: { $lte: +dayjs() },
              end: { $gte: +dayjs() },
            })
              .exec()
              .then((reservation) => {
                if (reservation) {
                  return "RESERVED";
                }
                return "AVAILABLE";
              });
          }

          // Look for current reservation
        });
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
  Image: {
    type({ fileType }) {
      return fileType;
    },
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

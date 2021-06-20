const { nanoid } = require("nanoid");
const dayjs = require("dayjs");

const {
  EmailAddressResolver,
  NonEmptyStringResolver,
  ObjectIDResolver,
  TimestampResolver,
  URLResolver,
} = require("graphql-scalars");

const {
  OperationError,
  DocumentNonExistentError,
  ImgurError,
} = require("./utils/errors");

// [x] Handle Error: checkOut something already checked out - OperationError
// [x] Handle Error: checkIn something already checked in - OperationError
// [x] Handle Error: Equipment not found (checkOut, checkIn, editEquipment, changeImage, equipmentById, equipmentByQR) - DocumentNotExistent Error
// [x] Handle Error: Error in Imgur Request (changeImage, uploadImage) - ImgurError
// [ ] Handle Error: Bad file type (addCalibration, addReceipt) - FileTypeError
// NOTE: Anywhere where a field in the schema contains a nested object (Type) but the mongoose model contains only an ObjectID, that field needs to have it's own resolver

// TODO: Add comment mutation (need to generate IDs)

module.exports = {
  EmailAddress: EmailAddressResolver,
  NonEmptyString: NonEmptyStringResolver,
  ObjectID: ObjectIDResolver,
  Timestamp: TimestampResolver,
  URL: URLResolver,
  Query: {
    equipment(_, __, { models: { Equipment } }) {
      // DONE: Equipment Query Resolver
      return Equipment.find({}).exec();
    },
    equipmentById(_, { input: { equipment } }, { models: { Equipment } }) {
      // DONE: EquipmentById Query Resolver
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
      // DONE: EquipmentByQR Query Resolver
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
    user(_, __, { user }) {
      // DONE: User Query Resolver
      return user;
    },
  },
  Mutation: {
    addEquipment(
      _,
      { input: { description, notes, mfg, mfgPn, mfgSn } },
      { user, models: { Equipment } }
    ) {
      // DONE: AddEquipment Mutation REsolver
      // user is a user object
      // mfg, mfgPn, mfgSn, notes, and description are Strings
      return Equipment.create({
        qr: nanoid(9),
        description: description,
        notes: notes,
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
      { input: { id, qr, description, notes, mfg, mfgPn, mfgSn, isActive } },
      { user, models: { Equipment } }
    ) {
      // DONE: EditEquipment Mutation Resolver
      // id is an ObjectID
      // user is a user object
      // qr is a nanoID (string)
      // description is a non-empty string
      // mfg is a string
      // mfgPn is a string
      // mfgSn is a string
      // isActive is a boolean
      return Equipment.countDocuments({ _id: id })
        .exec()
        .then((count) => {
          if (count === 0) {
            throw new DocumentNonExistentError(
              "Requested ID does not match any documents in the database"
            );
          } else {
            const equipmentFields = {};
            if (qr) equipmentFields.qr = qr;
            if (description) equipmentFields.description = description;
            if (notes) equipmentFields.notes = notes;
            if (mfg) equipmentFields.mfg = mfg;
            if (mfgPn) equipmentFields.mfgPn = mfgPn;
            if (mfgSn) equipmentFields.mfgSn = mfgSn;
            if (isActive) equipmentFields.isActive = isActive;
            return Equipment.findByIdAndUpdate(id, equipmentFields);
          }
        });
    },
    uploadImage(_, { input: { url } }, { dataSources: { imgurAPI } }) {
      // DONE: UploadImage Mutation  Resolver
      // url is a URL (string)
      return imgurAPI
        .uploadImageFromUrl(url)
        .then(({ data }) => {
          return {
            id: data.id,
            deleteHash: data.deletehash,
            fileType: data.type,
            url: data.link,
          };
        })
        .catch((error) => {
          console.error(error);
          throw new ImgurError(error);
        });
    },
    changeImage(
      _,
      { input: { equipment, image } },
      { user, models: { Equipment } }
    ) {
      // DONE: ChangeImage Mutation Resolver
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
            item.modifiedBy = user;
            item.modified = +dayjs();
            return item.save();
          }
        });
    },
    changeImageInfo(
      _,
      { input: { hash, title, description } },
      { dataSources: { imgurAPI } }
    ) {
      return imgurAPI
        .changeImageInfo(hash, title, description)
        .then(({ data }) => {
          return "Success!";
        })
        .catch((error) => {
          console.error(error);
          throw new ImgurError(error);
        });
    },
    checkOut(
      _,
      { input: { equipment, project } },
      { user, models: { Equipment, Record } }
    ) {
      // DONE: CheckOut Mutation Resolver (Add logic to check for current reservation)
      // user is a user object
      // equipment is an ObjectId
      // project is a non-empty string

      // Check to see if this equipment exists
      return Equipment.countDocuments({ _id: equipment })
        .exec()
        .then((count) => {
          if (count === 0) {
            throw new DocumentNonExistentError(
              "Requested ID does not match any documents in the database"
            );
          } else {
            // Check for open checkout log
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
                  // Check for current reservation
                  return Record.countDocuments({
                    equipment: equipment,
                    start: { $lte: +dayjs() },
                    end: { $gte: +dayjs() },
                  })
                    .exec()
                    .then((count) => {
                      if (count > 0) {
                        throw new OperationError(
                          `Cannot check out equipment id ${equipment}: Item is currently reserved`
                        );
                      } else {
                        // Create new log
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
          }
        });
    },
    checkIn(
      _,
      { input: { equipment } },
      { user, models: { Equipment, Record } }
    ) {
      // DONE: CheckIn Mutation Resolver (Add logic to look for current reservation for user and delete)
      // user is a user object
      // equipment is an ObjectId

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
                  // Check for a reservation that is current and belongs to the current user and delete it
                  return Record.findOneAndDelete({
                    equipment: equipment,
                    start: { $lte: +dayjs() },
                    end: { $gte: +dayjs() },
                  })
                    .exec()
                    .then(() => {
                      return Record.findOne({
                        equipment: equipment,
                        checkIn: null,
                      }).then((item) => {
                        item.checkIn = +dayjs();
                        item.modified = +dayjs();
                        item.modifiedBy = user;
                        return item.save();
                      });
                    });
                }
              });
          }
        });
    },
    addCalibration(
      _,
      { input: { equipment, calibrated } },
      { user, models: { Equipment } }
    ) {
      // TODO: AddCalibration Mutation Resolver
    },
    addReceipt(
      _,
      { input: { id, equipment, calibrated, file } },
      { user, models: { Equipment } }
    ) {
      // TODO: AddReceipt Mutation Resolver
    },
    addReservation(
      _,
      { input: { equipment, project, start, end } },
      { user, models: { Equipment, Record } }
    ) {
      // TODO: Add Reservation Resolver
    },
    deleteReservation(
      _,
      { input: { reservation } },
      { user, models: { Record } }
    ) {
      // TODO: Delete Reservation Resolver
    },
    editReservation(
      _,
      { input: { reservation, project, start, end } },
      { user, models: { Record } }
    ) {
      // TODO: Edit Reservation Resolver
    },
  },
  Equipment: {
    id({ _id }) {
      // DONE: Equipment Id Resolver (alias _id)
      console.log(_id);
      // _id is an ObjectID
      return _id;
    },
    status({ id }, __, { models: { Record } }) {
      // DONE: Equipment Status Resolver
      // id is an ObjectID
      console.log(id);
      // Look for current log (checkOut date but no checkIn date)
      return Record.findOne({
        equipment: id,
        checkIn: null,
        checkOut: { $exists: true },
      })
        .exec()
        .then((log) => {
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
    calStatus({ id }, __, { models: { Equipment } }) {
      // TODO: Equipment Cal Status Resolver
      // HACK: Returns only UNCALIBRATED
      return "UNCALIBRATED";
    },
    log({ id }, __, { models: { Record } }) {
      // DONE: Equipment Log Resolver
      return Record.find({ checkOut: { $exists: true }, equipment: id });
    },
    schedule({ id }, __, { models: { Record } }) {
      // DONE: Equipment Schedule Resolver
      return Record.find({ start: { $exists: true }, equipment: id });
    },
  },
  User: {
    // DONE: User Resolver, at least logs and reservations fields
    logs({ id }, __, { models: { Record } }) {
      return Record.find({
        checkOut: { $exists: true },
        "user.id": id,
      });
    },
    reservations({ id }, __, { models: { Record } }) {
      return Record.find({
        start: { $exists: true },
        "user.id": id,
      });
    },
  },
  Log: {
    equipment({ equipment }, __, { models: { Equipment } }) {
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
  },
  Reservation: {
    equipment({ equipment }, __, { models: { Equipment } }) {
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
  },
  Image: {
    // DONE: Image Resolver, type field
    type({ fileType }) {
      return fileType;
    },
  },
  Receipt: {
    // TODO: Receipt Resolver, at least file field
  },
  Calibration: {
    // TODO: Calibration Resolver, at least file field
  },
  File: {
    __resolveType(file) {
      if (file.calibrated) return "Calibration";
      return "Receipt";
    },
  },
};

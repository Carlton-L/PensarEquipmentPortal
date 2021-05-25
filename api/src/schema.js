const { gql } = require("apollo-server-express");
const manufacturerList = require("./etc/manufacturers");

const typeDefs = gql`
  directive @authenticated on OBJECT | FIELD_DEFINITION

  type Query {
    """
    Retrieves an array of equipment (executed on browse)
    """
    equipment: [Equipment]!
    """
    Retrieves a single equipment record from a given equipment ID (executed on /:id/)
    """
    equipmentById(input: EquipmentIdInput): Equipment!
    """
    Retrieves an equipment record from a given equipment QR code ID (executed on scan)
    """
    equipmentByQR(input: QRInput): Equipment!

    """
    Retrieves user information
    """
    user: User! @authenticated
  }

  type Mutation @authenticated {
    """
    Add a new equipment record to the database
    """
    addEquipment(input: AddEquipmentInput!): Equipment!
    """
    Edit an existing equipment record
    """
    editEquipment(input: EditEquipmentInput!): Equipment!

    """
    Check out an item to a user and project code
    """
    checkOut(input: CheckOutInput!): Log!
    """
    Check in an item back to the lab
    """
    checkIn(input: CheckInInput!): Log!

    """
    Create a new reservation
    """
    addReservation(input: AddReservationInput!): Reservation!

    """
    Delete an existing reservation
    """
    deleteReservation(input: DeleteReservationInput!): Reservation!

    """
    Edit an existing reservation
    """
    editReservation(input: EditReservationInput!): Reservation!

    """
    Upload an image to imgur via URL
    """
    uploadImage(input: UploadImageInput!): Image!
    """
    Change an existing equipment record's associated image to another existing image
    """
    changeImage(input: ChangeImageInput!): Equipment!

    """
    Adds a new calibration record to an equipment document
    """
    addCalibration(input: AddCalibrationInput): Calibration!
    """
    Adds a new receipt record to an equipment document
    """
    addReceipt(input: AddReceiptInput): Receipt!
  }

  input AddReservationInput {
    equipment: ObjectID!
    project: NonEmptyString!
    start: Timestamp!
    end: Timestamp!
  }

  input DeleteReservationInput {
    reservation: ObjectID!
  }

  input EditReservationInput {
    reservation: ObjectID!
    project: NonEmptyString
    start: Timestamp
    end: Timestamp
  }

  input CheckOutInput {
    equipment: ObjectID!
    project: NonEmptyString!
  }

  input CheckInInput {
    equipment: ObjectID!
  }

  input UploadImageInput {
    url: URL!
  }

  input ChangeImageInput {
    equipment: ObjectID!
    image: ImageInput!
  }

  input ImageInput {
    id: ID!
    deleteHash: ID!
    type: NonEmptyString!
    url: URL!
  }

  input AddEquipmentInput {
    description: NonEmptyString!
    mfg: NonEmptyString!
    mfgPn: String!
    mfgSn: String!
  }

  input EditEquipmentInput {
    id: ObjectID!
    qr: NonEmptyString
    description: NonEmptyString
    mfg: NonEmptyString
    mfgPn: String
    mfgSn: String
    isActive: Boolean
  }

  input EquipmentIdInput {
    equipment: ObjectID!
  }

  input QRInput {
    qr: NonEmptyString!
  }

  input AddCalibrationInput {
    equipment: ObjectID!
    calibrated: Timestamp!
  }

  input AddReceiptInput {
    equipment: ObjectID!
  }

  enum StatusAvailability {
    AVAILABLE
    UNAVAILABLE
    RESERVED
  }

  enum StatusCalibration {
    CALIBRATED
    UNCALIBRATED
  }

  type Equipment {
    id: ObjectID!
    qr: NonEmptyString!
    description: NonEmptyString!
    mfg: NonEmptyString!
    mfgPn: String!
    mfgSn: String!
    status: StatusAvailability!
    calStatus: StatusCalibration!
    #principals: [Equipment]!
    #acessories: [Equipment]!
    # TODO: Implement date range
    log(from: Timestamp = null, to: Timestamp = null): [Log]!
    schedule(from: Timestamp = null, to: Timestamp = null): [Reservation]!
    calibrations: [Calibration]!
    receipts: [Receipt]!
    comments: [Comment]!
    image: Image
    isActive: Boolean!
    created: Timestamp!
    createdBy: User!
    modified: Timestamp
    modifiedBy: User
  }

  type Image {
    id: ID!
    deleteHash: ID!
    type: NonEmptyString!
    url: URL!
  }

  """
  Logs refer to records of actual equipment usage (check-out/check-in)
  """
  type Log {
    equipment: Equipment!
    user: User!
    project: NonEmptyString!
    checkOut: Timestamp!
    checkIn: Timestamp
    created: Timestamp!
    createdBy: User!
    modified: Timestamp
    modifiedBy: User
  }

  """
  Reservations refer to records of scheduled equipment usage (holds) - NOT CURRENTLY IMPLEMENTED
  """
  type Reservation {
    equipment: Equipment!
    user: User!
    project: NonEmptyString!
    start: Timestamp!
    end: Timestamp!
    created: Timestamp!
    createdBy: User!
    modified: Timestamp
    modifiedBy: User
  }

  # TODO: Determine GraphQL type for file fields
  interface File {
    id: ID!
    equipment: Equipment!
    file: String!
    created: Timestamp!
    createdBy: User!
    modified: Timestamp
    modifiedBy: User
  }

  type Calibration implements File {
    id: ID!
    equipment: Equipment!
    file: String! @authenticated
    calibrated: Timestamp!
    created: Timestamp!
    createdBy: User!
    modified: Timestamp
    modifiedBy: User
  }

  type Receipt implements File {
    id: ID!
    equipment: Equipment!
    file: String! @authenticated
    created: Timestamp!
    createdBy: User!
    modified: Timestamp
    modifiedBy: User
  }

  type Comment {
    id: ID!
    user: User!
    equipment: Equipment!
    content: NonEmptyString
    created: Timestamp!
    createdBy: User!
    modified: Timestamp
    modifiedBy: User
  }

  """
  User ID, name, and email come from Pensar's database (via OAuth)
  """
  type User {
    id: ID!
    name: NonEmptyString!
    email: EmailAddress!
    logs: [Log]!
    reservations: [Reservation]!
  }
`;

module.exports = typeDefs;

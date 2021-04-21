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
    Retrieves all logs for a given user (executed on /user/)
    """
    userItemLog(input: UserInput): [Log]
    """
    Retrieves all reservations for a given user (executed on /user/)
    """
    userItemSchedule(input: UserInput): [Reservation]
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
    Upload an image to imgur via URL
    """
    uploadImage(input: UploadImageInput!): Image!
    """
    Change an existing equipment record's associated image to another existing image
    """
    changeImage(input: ChangeImageInput!): Equipment!
  }

  input UserInput {
    id: ID!
    name: String!
    email: String!
  }

  input CheckOutInput {
    user: UserInput!
    equipment: ID!
    project: String!
  }

  input CheckInInput {
    user: UserInput!
    equipment: ID!
  }

  input UploadImageInput {
    url: String!
  }

  input ChangeImageInput {
    equipment: ID!
    image: ImageInput!
  }

  input ImageInput {
    id: ID!
    deleteHash: ID!
    type: String!
    url: String!
  }

  input AddEquipmentInput {
    user: UserInput!
    description: String!
    mfg: String!
    mfgPn: String!
    mfgSn: String!
  }

  input EditEquipmentInput {
    id: ID!
    user: UserInput!
    qr: String
    description: String
    mfg: String
    mfgPn: String
    mfgSn: String
    isActive: Boolean
  }

  input UserIdInput {
    user: ID!
  }

  input EquipmentIdInput {
    equipment: ID!
  }

  input QRInput {
    qr: Int
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
    id: ID!
    qr: String!
    description: String!
    mfg: String!
    mfgPn: String!
    mfgSn: String!
    status: StatusAvailability!
    calStatus: StatusCalibration!
    #principals: [Equipment]!
    #acessories: [Equipment]!
    log(from: String = null, to: String = null): [Log]!
    schedule(from: String = null, to: String = null): [Reservation]!
    calibrations: [Calibration]!
    receipts: [Receipt]!
    comments: [Comment]!
    image: Image
    isActive: Boolean!
    created: String!
    createdBy: User!
    modified: String
    modifiedBy: User
  }

  type Image {
    id: ID!
    deleteHash: ID!
    type: String!
    url: String!
  }

  """
  Logs refer to records of actual equipment usage (check-out/check-in)
  """
  type Log {
    id: ID!
    equipment: Equipment!
    user: User!
    checkOut: String!
    checkIn: String
    created: String!
    createdBy: User!
    modified: String
    modifiedBy: User
  }

  """
  Reservations refer to records of scheduled equipment usage (holds) - NOT CURRENTLY IMPLEMENTED
  """
  type Reservation {
    id: ID!
    equipment: Equipment!
    user: User!
    start: String!
    end: String!
    created: String!
    createdBy: User!
    modified: String
    modifiedBy: User
  }

  interface File {
    id: ID!
    equipment: Equipment!
    file: String!
    created: String!
    createdBy: User!
    modified: String
    modifiedBy: User
  }

  type Calibration implements File {
    id: ID!
    equipment: Equipment!
    file: String! @authenticated
    calibrated: String!
    created: String!
    createdBy: User!
    modified: String
    modifiedBy: User
  }

  type Receipt implements File {
    id: ID!
    equipment: Equipment!
    file: String! @authenticated
    purchased: String
    created: String!
    createdBy: User!
    modified: String
    modifiedBy: User
  }

  type Comment {
    id: ID!
    user: User!
    equipment: Equipment!
    content: String
    created: String!
    createdBy: User!
    modified: String
    modifiedBy: User
  }

  """
  User ID, name, and email come from Pensar's database (via OAuth)
  """
  type User {
    id: ID!
    name: String!
    email: String!
    logs: [Log]!
    reservations: [Reservation]!
  }
`;

module.exports = typeDefs;

const { gql } = require("apollo-server-express");
const manufacturerList = require("./etc/manufacturers");

const typeDefs = gql`
  directive @authenticated on OBJECT | FIELD_DEFINITION

  type Query {
    """
    Retrieves a single equipment record from a given equipment ID
    """
    equipmentById(input: EquipmentIdInput): Equipment!
    """
    Retrieves a single user record from a given user's ID
    """
    user(input: UserIdInput): User!
    """
    Retrieves an equipment record from a given equipment QR code integer
    """
    equipmentByQR(input: QRInput): Equipment!
    """
    Retrieves an array of equipment using optional filters
    """
    equipment(input: EquipmentInput): [Equipment]!
  }

  type Mutation @authenticated {
    """
    Adds a new user (usually run after OAuth for a user that doesn't already exist)
    """
    addUser(input: AddUserInput): User!
  }

  input UserIdInput {
    id: ID!
  }

  input AddUserInput {
    id: ID!
    name: String!
    email: String!
  }

  input EquipmentIdInput {
    id: ID!
  }

  input QRInput {
    qr: Int
  }

  enum FilterAvailability {
    ALL
    AVAILABLE
    UNAVAILABLE
  }

  enum FilterCalibration {
    ALL
    CALIBRATED
    UNCALIBRATED
  }

  input EquipmentInput {
    availability: FilterAvailability
  }

  type Equipment {
    id: ID!
    qr: Int!
    description: String!
    mfg: String!
    mfgPn: String
    mfgSn: String
    principals: [Equipment]! 
    acessories: [Equipment]! 
    log: [Log]!
    schedule: [Reservation]! 
    calibrations: [Calibration]! 
    receipts: [Receipt]! 
    comments: [Comment]!
    image: String 
    isActive: Boolean!
    created: String!
    createdBy: ID!
    modified: String
    modifiedBy: ID
  }

  """
  Logs refer to records of actual equipment usage (check-out/check-in)
  """
  type Log {
    id: ID!
    equipment: Equipment!
    user: ID!
    userName: String!
    userEmail: String!
    checkOut: String!
    checkIn: String
    created: String!
    createdBy: ID!
    modified: String
    modifiedBy: ID
  }

  """
  Reservations refer to records of scheduled equipment usage (holds)
  """
  type Reservation {
    id: ID!
    equipment: Equipment!
    user: ID!
    userName: String!
    userEmail: String!
    start: String!
    end: String!
    created: String!
    createdBy: ID!
    modified: String
    modifiedBy: ID
  }

  interface File {
    id: ID!
    equipment: Equipment!
    file: String!
    created: String!
    createdBy: ID!
    modified: String
    modifiedBy: ID
  }

  type Calibration implements File {
    id: ID!
    equipment: Equipment!
    file: String! @authenticated
    calibrated: String!
    created: String!
    createdBy: ID!
    modified: String
    modifiedBy: ID
  }

  type Receipt implements File {
    id: ID!
    equipment: Equipment!
    file: String! @authenticated
    purchased: String
    created: String!
    createdBy: ID!
    modified: String
    modifiedBy: ID
  }

  type Comment {
    id: ID!
    user: User!
    equipment: Equipment!
    content: String
    created: String!
    createdBy: ID!
    modified: String
    modifiedBy: ID
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

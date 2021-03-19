const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    equipment(input: EquipmentInput): String
  }

  input EquipmentInput {
    name: String
  }

  type Equipment {
    id: ID!
    psn: Int!
    description: String!
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
    file: String!
    calibrated: String!
    created: String!
    createdBy: ID!
    modified: String
    modifiedBy: ID
  }

  type Receipt implements File {
    id: ID!
    equipment: Equipment!
    file: String!
    purchased: String
    created: String!
    createdBy: ID!
    modified: String
    modifiedBy: ID
  }

  type Comment {
    id: ID!
    user: ID!
    userName: String!
    userEmail: String!
    equipment: Equipment!
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

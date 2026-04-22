export const typeDefs = `
  enum UserRole {
    USER
    ADMIN
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    cvs: [Cv!]!
  }

  type Cv {
    id: ID!
    name: String!
    age: Int!
    job: String!
    owner: User!
    skills: [Skill!]!
  }

  type Skill {
    id: ID!
    designation: String!
    cvs: [Cv!]!
  }

  type Query {
    getAllCvs: [Cv!]!
    getCvById(id: ID!): Cv
  }

  input CreateCvInput {
    name: String!
    age: Int!
    job: String!
    userId: ID!
    skillIds: [ID!]!
  }

  input UpdateCvInput {
    id: ID!
    name: String
    age: Int
    job: String
    userId: ID
    skillIds: [ID!]
  }

  type Mutation {
    createCv(input: CreateCvInput!): Cv!
    updateCv(input: UpdateCvInput!): Cv!
    deleteCv(id: ID!): Boolean!
  }

  type Subscription {
    cvModified: CvNotification!
  }

  type CvNotification {
    mutation: MutationType!
    data: Cv!
  }

  enum MutationType {
    CREATED
    UPDATED
    DELETED
  }
`;

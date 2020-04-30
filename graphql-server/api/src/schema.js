const gql = require('graphql-tag')

const typeDefs = gql`
  # Schema
  type User {
    id: ID!
    username: String!
    pets: [Pet]!
  }

  type Pet {
    id: ID!
    createdAt: String!
    name: String!
    type: String!
    owner: User
    img: String
  }

  enum typeInput {
    CAT
    DOG
  }

  input PetInput {
    name: String
    type: String
  }

  input NewPetInput {
    name: String!
    type: typeInput!
  }

  # Query
  type Query {
    pets(input: PetInput): [Pet]!
    pet(id: ID): Pet
    user: User!
  }

  # Mutation
  type Mutation {
    createPet(input: NewPetInput!): Pet!
  }
`

module.exports = typeDefs
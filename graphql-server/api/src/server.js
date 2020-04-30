const { ApolloServer } = require('apollo-server')
const Models = require('./db')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context() {
    return Models
  }
})

server.listen(4000).then(() => console.log('listening on port 4000'))
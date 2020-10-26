const gql = require('graphql-tag')
const {
  ApolloServer,
  PubSub,
  SchemaDirectiveVisitor,
} = require('apollo-server')

const pubSub = new PubSub()
const NEW_ITEM = 'NEW_ITEM'

const USER_DATA = {
  id: '1',
  username: 'devin',
  createdAt: Math.round(new Date().getTime() / 1000),
}
const SETTING_DATA = { theme: 'Light' }

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    console.log(field)
  }
}

const typeDefs = gql`
  directive @log on FIELD_DEFINITION

  type DirectiveExample {
    name: String! @deprecated
  }

  type User {
    id: ID! @log
    username: String!
    createdAt: Int!
  }

  type Settings {
    user: User!
    theme: String!
  }

  type Item {
    task: String!
  }

  input NewSettingsInput {
    user: ID!
    theme: String!
  }

  type Query {
    me: User!
    settings(user: ID!): Settings!
  }

  type Mutation {
    settings(input: NewSettingsInput!): Settings!
    createItem(task: String!): Item!
  }

  type Subscription {
    newItem: Item
  }
`

const resolvers = {
  Query: {
    me() {
      return {
        id: USER_DATA.id,
        username: USER_DATA.username,
        createdAt: USER_DATA.createdAt,
      }
    },
    settings(_, args) {
      return { user: args.user, theme: SETTING_DATA.theme }
    },
  },
  Mutation: {
    settings(_, args) {
      return SETTING_DATA
    },
    createItem(_, args) {
      const item = { task: args.task }
      // newItem: item should the same as defined on type Subscription
      pubSub.publish(NEW_ITEM, { newItem: item })
      return item
    },
  },
  Subscription: {
    newItem: {
      subscribe: () => pubSub.asyncIterator(NEW_ITEM),
    },
  },
  Settings: {
    user(settings) {
      return USER_DATA
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    // custom directive
    log: LogDirective, // log: the directive name, LogDirective: the class
  },
  context({ connection }) {
    if (connection) {
      return { ...connection.context }
    }
  },
  subscriptions: {
    onConnect(params) {
      console.log('params', params) // basically like `req.headers` on context object param
    },
  },
})

server.listen().then(({ url }) => console.log(`Server run on ${url}`))

import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory"
import { HttpLink } from "apollo-link-http"
import { setContext } from "apollo-link-context"
import gql from "graphql-tag"
import { ApolloLink } from "apollo-link"

// Create custom typeDef on client apollo
const typeDefs = gql`
  extend type User {
    age: Int
  }

  extend type Pet {
    vaccinated: Boolean!
  }
`

// Create custom resolvers on client apollo
const resolvers = {
  User: {
    age() {
      return 5
    },
  },
  Pet: {
    vaccinated() {
      return true
    },
  },
}

// connecting the client to apollo server
const http = new HttpLink({ uri: "http://localhost:4000" })
const delay = setContext(
  (request) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, 800)
    })
)

const link = ApolloLink.from([delay, http])

const cache = new InMemoryCache()

const client = new ApolloClient({ link, cache, resolvers, typeDefs })

export default client

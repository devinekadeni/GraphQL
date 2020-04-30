const gql = require('graphql-tag')
const {ApolloServer} = require('apollo-server')

// Schemas
const typeDefs = gql`
  enum ShoeType {
    jordan
    nike
    adiddas
  }

  type User {
    email: String! # ! == required (cannot be null)
    avatar: String
    friends: [User]! # []! == always an array, [User!] == array always have a user
    # img(width: String, height: String): String # can do this regarding NUM_1
  }

  interface Shoe { # so that client can get all shoes type (sneaker & boot)
    brand: ShoeType!
    size: Int!
  }

  union Footwear = Sneaker | Boot # same as interface. but have no common field

  type Sneaker implements Shoe {
    brand: ShoeType! # should be defined again even tho interface
    size: Int! # should be defined again even tho interface
    sport: String!
  }

  type Boot implements Shoe {
    brand: ShoeType! # should be defined again even tho interface
    size: Int! # should be defined again even tho interface
    hasGrip: Boolean!
  }

  input ShoesInput {
    brand: ShoeType
    size: Int
  }

  input NewShoeInput {
    brand: ShoeType!
    size: Int!
  }

  type Query {
    me: User! # User = { email, avatar, friends }
    shoes(input: ShoesInput): [Shoe]!
    footwear: [Footwear]!
    friends: [User]!
    withparam(name: String!): [User]!
  }

  # On Apollo Server Query would be:
    # Query: me
    # {
    #   me {
    #     email
    #     avatar
    #     friends: {
    #       email
    #       avatar
    #     }
    #   }
    # }
    # Query: shoes with filter
    # {
    #   shoes(input: { brand: nike, size: 12 }) {
    #     brand
    #     size
    #   }
    # }
    # Query: shoes with interface
    # {
    #   shoes {
    #     __typename
    #     size
    #     brand
    #     ... on Sneaker {
    #       sport
    #     }
    #     ... on Boot {
    #       hasGrip
    #     }
    #   }
    # }
    # {
    #   footwear {
    #     ... on Sneaker {
    #       brand
    #       size
    #       sport
    #     }
        
    #     ... on Boot {
    #       brand
    #       size
    #       hasGrip
    #     }
    #   }
    # }
    # Query: friends
    # {
    #   friends {
    #     email
    #     avatar
    #   }
    # }
    # Query: withparam
    # {
    #   withparam(name: "devin") {
    #     email
    #     avatar
    #   }
    # }
  # END

  type Mutation {
    addShoe(input: NewShoeInput!): Shoe!
  }

  # On Apollo Server Mutation would be:
    # mutation {
    #   addShoe (input: { brand: jordan, size: 14 }) {
    #     brand
    #     size
    #   }
    # }
  # End
`
// NOTES: Query & Resolvers --> dependencies each other
const resolvers = {
  Query: {
    // based on type
    me() {
      // always a function
      return {
        email: "devinekadeni@gmail.com",
        avatar: "https://yoda.png",
        friends: [{ email: "devin", avatar: "yodi.png", friends: [] }],
      }
    },
    shoes(_, { input }) {
      if (input) {
        return [
          { brand: "nike", size: 12, hasGrip: true },
          { brand: "adiddas", size: 14, sport: "fashion" },
        ].filter((shoe) => shoe.brand === input.brand)
      }
      return [
        { brand: "nike", size: 12, hasGrip: true },
        { brand: "adiddas", size: 14, sport: "fashion" },
      ]
    },
    footwear() {
      return [
        { brand: "nike", size: 12, hasGrip: true },
        { brand: "adiddas", size: 14, sport: "fashion" },
      ]
    },
    /** NOTE
     * param1: resolved value from the upper resolver or can be initial data from ApolloServer
     * param2: parameter from query client
     * param3: context that define on ApolloServer
     *  i.e. ApolloServer({
     *    context() { return { name: 'devin' }}
     * })
     */
    friends(param1, param2, param3) {
      return [{ email: "devin" }]
    },
    withparam(_, { name }, ctx) {
      return [{ email: name.trim(), avatar: "yoda.png", friends: [] }]
    },
  },
  // User: {
  //   img(_, { width, height }) { // can do this regarding NUM_1
  //     return transformation(width, height)
  //   }
  // },
  Mutation: {
    addShoe(_, { input }) {
      return input
    },
  },
  Shoe: {
    __resolveType(shoe) {
      if (shoe.sport) {
        return "Sneaker"
      }
      return "Boot"
    },
  },
  Footwear: {
    __resolveType(shoe) {
      if (shoe.sport) {
        return "Sneaker"
      }
      return "Boot"
    },
  },
}

// Schema + Resolvers => Server
// Schema: typeDefs + Query
// Resolvers: function
const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen(4000)
  .then(() => console.log('on port 4000'))
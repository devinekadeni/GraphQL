const resolvers = {
  Query: {
    pets(_, { input }, ctx) {
      let filters = input || {}
      return ctx.models.Pet.findMany(filters)
    },
    pet(_, { id }, ctx) {
      return ctx.models.Pet.findOne({ id })
    },
    user(_, __, ctx) {
      return ctx.models.User.findOne()
    },
  },
  Mutation: {
    createPet(_, { input }, ctx) {
      const newPet = ctx.models.Pet.create(input)
      return newPet
    },
  },

  // Schema
  Pet: {
    owner(pet, __, ctx) {
      const user = ctx.models.User.findOne()
      return user
    },
    img(pet) {
      return pet.type === "DOG"
        ? "https://placedog.net/300/300"
        : "http://placekitten.com/300/300"
    },
  },
  User: {
    pets(user, __, ctx) {
      const pets = ctx.models.Pet.findMany({ user: user.id })
      return pets
    },
  },
}

module.exports = resolvers

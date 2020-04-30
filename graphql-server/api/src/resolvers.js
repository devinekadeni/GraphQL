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
    }
  },
  Mutation: {
    createPet(_, { input }, ctx) {
      const newPet = ctx.models.Pet.create(input)
      return newPet
    }
  },

  // Schema
  Pet: {
    owner(pet, __, ctx) {
      console.log('pet', pet)
      const user = ctx.models.User.findOne()
      console.log('user', user)
      return user
    }
  },
  User: {
    pets(user, __, ctx) {
      const pets = ctx.models.Pet.findMany({ user: user.id })
      return pets
    }
  }
}

module.exports = resolvers
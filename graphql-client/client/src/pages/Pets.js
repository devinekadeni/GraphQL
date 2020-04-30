import React, { useState } from "react"
import gql from "graphql-tag"
import { useQuery, useMutation } from "@apollo/react-hooks"
import PetsList from "../components/PetsList"
import NewPetModal from "../components/NewPetModal"
import Loader from "../components/Loader"

const PET_FIELDS = gql`
  fragment PetsFields on Pet {
    # to make a reusable abstraction of fields
    id
    name
    type
    createdAt
    img
    vaccinated @client # directive, to get fields from apollo client type
    owner {
      id
      age @client # directive, to get fields from apollo client type
      username
    }
  }
`

const PET_LIST = gql`
  query PetList {
    pets {
      ...PetsFields
    }
  }
  ${PET_FIELDS}
`

const CREATE_PET = gql`
  mutation CreatePet($newPet: NewPetInput!) {
    createPet(input: $newPet) {
      ...PetsFields # this is how to apply the fragment
    }
  }
  ${PET_FIELDS}
  # this is how to apply the fragment
`

export default function Pets() {
  const [modal, setModal] = useState(false)
  const { data, loading, error } = useQuery(PET_LIST)
  const [createPet, newPet] = useMutation(CREATE_PET, {
    update(cache, { data: { createPet } }) {
      const { pets } = cache.readQuery({ query: PET_LIST }) // read the cacheQuery of apollo in memory
      cache.writeQuery({
        // update the cache after mutating the data, so the UI will be updated automatically (without refetch again)
        query: PET_LIST,
        data: { pets: [createPet, ...pets] },
      })
    },
  })

  const onSubmit = (input) => {
    setModal(false)
    createPet({
      variables: {
        newPet: {
          name: input.name,
          type: input.type,
        },
      },
      optimisticResponse: {
        // optimistic UI, to be able perform something like skeleton UI
        __typename: "Mutation", // this objects below should be the same as the Query
        createPet: {
          __typename: "Pet",
          id: "1",
          name: input.name,
          type: input.type,
          createdAt: 12345,
          img: "https://via.placeholder.com/300",
          vaccinated: true,
          owner: {
            __typename: "User",
            id: "2",
            age: 5,
            username: "devin",
          },
        },
      },
    })
  }

  if (loading) {
    return <Loader />
  }

  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data ? data.pets : []} />
      </section>
    </div>
  )
}

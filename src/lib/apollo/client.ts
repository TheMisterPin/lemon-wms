'use client'

import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

import { readStoredAccessToken } from '@/lib/auth/store'

const httpLink = new HttpLink({ uri: '/api/graphql' })

const authLink = setContext((_, { headers }) => {
  const token = readStoredAccessToken()
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

export function makeApolloClient() {
  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
  })
}

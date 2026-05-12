'use client'

import { useRef, type ReactNode } from 'react'
import { ApolloProvider } from '@apollo/client/react'

import { makeApolloClient } from '@/lib/apollo/client'

export default function DashboardApolloProvider({ children }: { children: ReactNode }) {
  const client = useRef(makeApolloClient())
  return <ApolloProvider client={client.current}>{children}</ApolloProvider>
}

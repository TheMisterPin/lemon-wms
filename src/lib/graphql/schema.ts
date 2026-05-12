import SchemaBuilder from '@pothos/core'
import DataloaderPlugin from '@pothos/plugin-dataloader'
import PrismaPlugin from '@pothos/plugin-prisma'

import { Prisma, type PrismaClient } from '@/generated/prisma'
import type { AccessTokenPayload } from '@/lib/auth/jwt'

import type PrismaTypes from './pothos-types'

export type GraphQLContext = {
  user: AccessTokenPayload
  prisma: PrismaClient
}

export const builder = new SchemaBuilder<{
  Context: GraphQLContext
  PrismaTypes: PrismaTypes
}>({
  plugins: [PrismaPlugin, DataloaderPlugin],
  prisma: {
    client: (ctx) => ctx.prisma,
    dmmf: Prisma.dmmf,
    filterConnectionTotalCount: true,
  },
})

builder.queryType({})

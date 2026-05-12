import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['src/**/*.graphql'],
  generates: {
    'src/generated/gql/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        avoidOptionals: true,
        maybeValue: 'T | null | undefined',
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config

import { writeFileSync } from 'fs'
import { lexicographicSortSchema, printSchema } from 'graphql'
import { join } from 'path'

import { schema } from '../src/lib/graphql'

const sdl = printSchema(lexicographicSortSchema(schema))
const outPath = join(process.cwd(), 'schema.graphql')
writeFileSync(outPath, sdl)

console.log(`✔ Schema written to ${outPath}`)

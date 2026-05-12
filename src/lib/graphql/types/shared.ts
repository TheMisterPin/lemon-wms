import { builder } from '../schema'

export const DashboardKpiType = builder.objectRef<{
  label: string
  value: string
  helper: string
  tone: 'success' | 'warning' | 'danger' | 'neutral'
}>('DashboardKpi').implement({
  fields: (t) => ({
    label: t.exposeString('label'),
    value: t.exposeString('value'),
    helper: t.exposeString('helper'),
    tone: t.exposeString('tone'),
  }),
})

export const DashboardHeaderType = builder.objectRef<{
  title: string
  subtitle: string
}>('DashboardHeader').implement({
  fields: (t) => ({
    title: t.exposeString('title'),
    subtitle: t.exposeString('subtitle'),
  }),
})

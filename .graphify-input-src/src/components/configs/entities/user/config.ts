import type { User, UserFormValues } from '@/lib/schemas/user'
import type { FactboxSectionConfig } from '@/types/components/factbox/generic-factbox.types'
import type { GenericFormConfig, SelectOption } from '@/types/components/form/generic-form.types'
import type { ColumnConfig } from '@/types/components/table/column.types'

export const roleOptions: SelectOption[] = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'OFFICE_MANAGER', label: 'Office Manager' },
  { value: 'OFFICE_WORKER', label: 'Office Worker' },
  { value: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager' },
  { value: 'WAREHOUSE_WORKER', label: 'Warehouse Worker' }
]

export const loginTypeOptions: SelectOption[] = [
  { value: 'CREDENTIAL', label: 'Email + Password' },
  { value: 'BADGE_PIN', label: 'Badge + PIN' },
  { value: 'BOTH', label: 'Both' }
]

export const userFormConfig: GenericFormConfig<UserFormValues> = {
  columns: 2,
  submitLabel: 'Save user',
  defaultValues: {
    email: null,
    password: null,
    pin: null,
    role: 'OFFICE_WORKER',
    loginType: 'CREDENTIAL',
    isActive: true
  },
  fields: [
    {
      name: 'email',
      label: 'Email address',
      type: 'email',
      placeholder: 'user@company.com'
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: roleOptions,
      required: true
    },
    {
      name: 'loginType',
      label: 'Login type',
      type: 'select',
      options: loginTypeOptions,
      required: true
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox'
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••',
      description: 'Required for credential login. Minimum 8 characters.'
    },
    {
      name: 'pin',
      label: 'PIN',
      type: 'text',
      placeholder: '••••',
      description: 'Required for badge + PIN login. Exactly 4 digits.'
    }
  ]
}

export const userTableColumns: ColumnConfig<User>[] = [
  { label: 'Badge', accessor: 'badgeNumber' },
  { label: 'Email', accessor: 'email' },
  { label: 'Role', accessor: 'role' },
  { label: 'Login type', accessor: 'loginType' },
  { label: 'Active', accessor: 'isActive', type: 'boolean' },
  { label: 'Created', accessor: 'createdAt', type: 'date' }
]

export const userFactboxSections: FactboxSectionConfig<User>[] = [
  {
    title: 'Identity',
    fields: [
      { label: 'Badge number', accessor: 'badgeNumber' },
      { label: 'Email', accessor: 'email' },
      { label: 'Role', accessor: 'role' },
      { label: 'Login type', accessor: 'loginType' },
      { label: 'Active', accessor: 'isActive' }
    ]
  },
  {
    title: 'Audit',
    fields: [
      { label: 'Created at', accessor: 'createdAt' },
      { label: 'Deleted at', accessor: 'deletedAt' }
    ]
  }
]

export const userCrudConfig = {
  form: userFormConfig,
  table: userTableColumns,
  factbox: userFactboxSections
} as const

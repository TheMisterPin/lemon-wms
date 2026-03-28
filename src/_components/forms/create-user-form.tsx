/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserRoundPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useErrorModal } from '@/hooks'
import { createUserformSchema } from '../../utils/components/forms/schemas/create-user-form'
export function CreateUserForm() {
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const { openModal } = useErrorModal()
  const form = useForm<z.infer<typeof createUserformSchema>>({
    resolver: zodResolver(createUserformSchema as any),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    },
    mode: 'onSubmit'
  })

  async function onSubmit(values: z.infer<typeof createUserformSchema>) {
    setServerSuccess(null)
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        openModal(payload?.error ?? 'Failed to create user')

        return
      }
      setServerSuccess('User created.')
      form.reset()
    } catch {
      openModal('Failed to create user')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" flex flex-col p-4 border-2 border-slate-400/50 rounded-md justify-around">
        <div className=" h-5/6 gap-4  flex flex-col my-auto ">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
Name
                </FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="my-auto">
                <FormLabel>
Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="jane@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="my-auto">
                <FormLabel>
Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {serverSuccess && (
          <p className="text-sm" role="status">
            {serverSuccess}
          </p>
        )}
        <div className='mx-auto w-2/3'>
          <Button type="submit" className='w-full bg-linear-to-r hover:bg-linear-to-l from-slate-500 to-slate-700 mt-4 transition-all duration-150' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Spinner /> : <UserRoundPlus />}
            {form.formState.isSubmitting ? 'Creating...' : 'Sign Up'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

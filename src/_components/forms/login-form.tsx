/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn } from 'lucide-react'
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
import { useAuth } from '@/hooks'
import { useErrorModal } from '@/hooks'
import { loginFormSchema } from '@/utils/components/forms/schemas/login-form'
export function LoginForm() {
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const { openModal } = useErrorModal()
  const { login } = useAuth()
  const router = useRouter()
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema as any),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onSubmit'
  })

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setServerSuccess(null)
    try {
      const success = await login(values.email, values.password)
      if (success) {
        setServerSuccess('Login successful! Redirecting...')
        form.reset()
        // Redirect to location page after successful login
        // Small delay to ensure state is updated
        setTimeout(() => {
          router.push('/location')
        }, 100)
      } else {
        openModal('Invalid email or password')
      }
    } catch {
      openModal('Failed to login')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className=" flex flex-col p-4 border-2 border-slate-400/50 rounded-md justify-around">
      <Form {...form}>
        <div className=" h-5/6 gap-4  flex flex-col py-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="my-auto">
                <FormLabel>
Email
                </FormLabel>
                <FormControl>
                  <Input autoComplete="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className=" my-auto">
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
            {form.formState.isSubmitting ? <Spinner /> : <LogIn />}
            {form.formState.isSubmitting ? 'Logging in...' : 'Log in'}
          </Button>
        </div>
      </Form>
    </form>
  )
}

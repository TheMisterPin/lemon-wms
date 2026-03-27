
import { Card } from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import { CreateUserForm } from '../forms/create-user-form'
import { LoginForm } from '../forms/login-form'

export function LoginPage() {
  return (

    <Card className="m-auto p-6 min-h-2/3">
      <Tabs defaultValue="login" className="flex-1" >
        <div className="mb-4 space-y-2 text-center">
          <h1 className="text-2xl font-bold bg-linear-to-b from-gray-800 to-slate-700 text-transparent bg-clip-text">Welcome to BoxMas</h1>
          <p className="text-sm text-muted-foreground">Please login or sign up to continue.</p>

          <TabsList className="mt-2 border-2 ">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="login" className="flex">
          <LoginForm />
        </TabsContent>
        <TabsContent value="signup" className="flex">
          <CreateUserForm/>
        </TabsContent>
      </Tabs>
    </Card>

  )
}

'use client'
import React, { useState, useEffect } from 'react'
import { UserCard } from '@/_components/cards/user-card'
import { UniversalLoader } from '@/components/universal-loader'
import { User } from '@/types/models/user/user-model'
export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/user')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data: User[] = await response.json()
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])
  if (loading) {
    return <UniversalLoader message="Loading users..." />
  }
  if (error) {
    return <div>
Error:
      {error}
    </div>
  }

  return (
    <div>
      <h1>
User List
      </h1>
      {users.length === 0 ? (
        <p>
No users found
        </p>
      ) : (
        <div>
          {users.map((user) => (
            <li key={user.id}>
              <UserCard {...user} />
            </li>
          ))}
        </div>
      )}
    </div>
  )
}

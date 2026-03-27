import { InboxIcon } from 'lucide-react'

import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { User } from '@/types'

export function UserCard(user : User) {
  return (

    <Item variant="outline">
      <ItemMedia variant="icon">
        <InboxIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{user.name}</ItemTitle>
      </ItemContent>
    </Item>

  )
}

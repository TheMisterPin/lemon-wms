import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle
} from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
export function UniversalLoader({ message }: {message: string}) {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">
            {message}
          </ItemTitle>
        </ItemContent>
      </Item>
    </div>
  )
}

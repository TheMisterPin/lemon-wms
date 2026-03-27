import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface FormSelectInputElement {
  value : string,
  label : string
}
interface FormSelectInputProps {
  label : string,
  options : FormSelectInputElement[]
}
export function FormSelectInput(props : FormSelectInputProps) {
  const { label, options } = props
  return (
    <Select>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>
            {label}
          </SelectLabel>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

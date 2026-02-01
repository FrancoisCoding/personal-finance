import * as React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface SearchBarProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
  inputClassName?: string
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ containerClassName, inputClassName, type = 'search', ...props }, ref) => (
    <div className={cn('relative w-full', containerClassName)}>
      <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        ref={ref}
        type={type}
        className={cn('pl-9', inputClassName)}
        {...props}
      />
    </div>
  )
)
SearchBar.displayName = 'SearchBar'

export { SearchBar }

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("shimmer-effect rounded-md bg-muted/65", className)}
      {...props}
    />
  )
}

export { Skeleton }

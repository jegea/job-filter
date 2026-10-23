import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

type PaginationProps = {
  page: number
  totalPages: number
  isPending: boolean
  onPageChange: (page: number) => void
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages] as const
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ] as const
}

export default function Pagination({
  page,
  totalPages,
  isPending,
  onPageChange,
}: PaginationProps) {
  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={isFirstPage || isPending}
        onClick={() => onPageChange(1)}
        aria-label="First page"
      >
        <ChevronsLeft className="size-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={isFirstPage || isPending}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {getVisiblePages(page, totalPages).map((pageNumber, index) => {
        if (pageNumber === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex size-8 items-center justify-center text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          )
        }

        return (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? 'default' : 'outline'}
            size="icon"
            className="size-8"
            disabled={isPending}
            onClick={() => onPageChange(pageNumber)}
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === page ? 'page' : undefined}
          >
            {pageNumber}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={isLastPage || isPending}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={isLastPage || isPending}
        onClick={() => onPageChange(totalPages)}
        aria-label="Last page"
      >
        <ChevronsRight className="size-4" />
      </Button>
    </div>
  )
}
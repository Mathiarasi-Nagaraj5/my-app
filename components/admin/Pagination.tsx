import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // shows up to 5 page numbers, centered around the current page
  const pageNumbers: number[] = [];
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);
  start = Math.max(1, end - 4);
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <div className="mt-5 flex items-center justify-between border-t border-charcoal/10 px-4 py-3">
      <p className="text-sm text-charcoal/55">
        Showing {startItem}–{endItem} of {totalItems}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded border border-charcoal/15 text-charcoal disabled:opacity-30"
        >
          <ChevronLeft size={15} />
        </button>

        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="flex h-8 w-8 items-center justify-center rounded text-xs text-charcoal/70 hover:bg-charcoal/5"
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-charcoal/40">…</span>}
          </>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-8 w-8 items-center justify-center rounded text-xs ${
              page === currentPage
                ? "bg-brass font-medium text-charcoal"
                : "text-charcoal/70 hover:bg-charcoal/5"
            }`}
          >
            {page}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-charcoal/40">…</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="flex h-8 w-8 items-center justify-center rounded text-xs text-charcoal/70 hover:bg-charcoal/5"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded border border-charcoal/15 text-charcoal disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
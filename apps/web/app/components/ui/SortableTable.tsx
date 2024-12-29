import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import {
  type Table as ReactTable,
  type SortDirection,
  flexRender,
} from "@tanstack/react-table";

import { cx } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";

import "@tanstack/react-table";

export const SortableTable = <TData,>({
  table,
}: {
  table: ReactTable<TData>;
}) => {
  return (
    <TableRoot>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortingHandler =
                  header.column.getToggleSortingHandler?.();
                const getAriaSortValue = (isSorted: false | SortDirection) => {
                  switch (isSorted) {
                    case "asc":
                      return "ascending";
                    case "desc":
                      return "descending";
                    default:
                      return "none";
                  }
                };

                return (
                  <TableHeaderCell
                    key={header.id}
                    onClick={sortingHandler}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && sortingHandler) {
                        sortingHandler(event);
                      }
                    }}
                    className={cx(
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : "",
                      "py-1.5",
                      header.column.columnDef.meta?.headerClassNames,
                    )}
                    tabIndex={header.column.getCanSort() ? 0 : -1}
                    aria-sort={getAriaSortValue(header.column.getIsSorted())}
                  >
                    <div
                      className={cx(
                        header.column.columnDef.enableSorting === true
                          ? "flex items-center gap-4"
                          : "",
                        "py-1.5",
                        header.column.columnDef.meta?.headerContentClassNames,
                      )}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getCanSort() && (
                        <div className="-space-y-2">
                          <RiArrowUpSLine
                            className={cx(
                              "size-4 text-gray-900 dark:text-gray-50",
                              header.column.getIsSorted() === "desc"
                                ? "opacity-30"
                                : "",
                            )}
                            aria-hidden={true}
                          />
                          <RiArrowDownSLine
                            className={cx(
                              "size-4 text-gray-900 dark:text-gray-50",
                              header.column.getIsSorted() === "asc"
                                ? "opacity-30"
                                : "",
                            )}
                            aria-hidden={true}
                          />
                        </div>
                      )}
                    </div>
                  </TableHeaderCell>
                );
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cx(cell.column.columnDef.meta?.cellClassNames)}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableRoot>
  );
};

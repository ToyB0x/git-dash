import type { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassNames?: string;
    headerContentClassNames?: string;
    cellClassNames?: string;
  }
}

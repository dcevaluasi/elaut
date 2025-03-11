import React from "react";
import { HashLoader } from "react-spinners";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";

const TableData = ({
  isLoading,
  columns,
  table,
  type,
}: {
  isLoading: boolean;
  columns: any;
  table: any;
  type: string;
}) => {
  return (
    <div className="rounded-md border scrollbar-hide">
      <Table className="scrollbar-hide">
        <TableHeader className="scrollbar-hide">
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow
              className={`${type == "long" ? "h-[100px]" : ""} scrollbar-hide`}
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header: any) => {
                return (
                  <TableHead className="h-fit py-3" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="scrollbar-hide">
          {isLoading ? (
            <TableRow>
              {" "}
              <HashLoader color="#fff" size={24} />
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row: any) => (
              <TableRow
                key={row.id}
                className=" hover:bg-gray-50 scrollbar-hide"
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell
                    key={cell.id}
                    className="py-3 text-xs scrollbar-hide"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableData;

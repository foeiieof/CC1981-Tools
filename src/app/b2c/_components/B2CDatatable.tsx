"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ChevronDown, Copy, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { B2CSaleOrderWithBrand } from "@/app/api/types"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { IResponse, Lgr } from "@/app/api/utility"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import useSWR from "swr"
import SkeletonOrderTable from "./SkeletonOrderTable"
import { CalendarPicker } from "./CalendaPicker"
import { toast } from "sonner"
import { OrderActions } from "./OrderActions"


export const columns: ColumnDef<B2CSaleOrderWithBrand>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    // id: "order-id",
    accessorKey: "OrderId",
    header: "Order",

    cell: ({ row }) => {
      const order = String(row.getValue("OrderId"));
      const message = String(row.original.MessageError ?? "");

      return (

        <div className="capitalize flex items-center gap-2">
          <button
            className="flex flex-row justify-center items-center gap-2 hover:bg-zinc-100  p-2 rounded-lg "
            type="button"
            onClick={() => {
              toast.success(`Copy OrderSN : ${order}`)
              navigator.clipboard.writeText(order)
            }}
          >
            {order}
            <Copy size={12} />
          </button>
          {message && message !== "undefined" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <ShieldAlert size={16} color="#b51a00" className="cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px] break-words">{message}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "Brand",
    header: "Brand",
    cell: info => String(info.getValue()).slice(0, 13)
  },
  {
    accessorKey: "OrderStatus",
    header: "Status",
    cell: info => info.getValue()
  },
  {
    accessorKey: "ShipName",
    header: "Name",
    cell: inf => String(inf.getValue()).slice(0, 13)
  },
  {
    accessorKey: "ShipPhone",
    header: "Phone",
    cell: inf => inf.getValue()
  },
  {
    accessorKey: "LogisName",
    header: "Logistic",
    cell: inf => String(inf.getValue()).slice(0, 13)
  },
  {
    accessorKey: "PaidAmount",
    header: "TotalAmount",
    cell: ({ getValue }) => {
      const raw = getValue() ?? 0;
      const value = Number(raw) || 0
      return '฿' + value.toLocaleString('th-TH', { minimumFractionDigits: 0 });
    }
  },
  {
    accessorKey: "CreationDate",
    header: "CreatedAt",
    cell: (info) => {
      const val = info.getValue() as Date
      return (
        <span>{format(val, "dd/MM/yyyy HH:mm", { locale: th })}</span>
      )
    }
  },
  {
    id: "actions",
    // header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original
      return (<OrderActions order={order} />)
    },
  },
]



// function ModalB2COrderDetail({ order }: { order: B2CSaleOrderWithBrand }) {
//   if (order)
//     Lgr.info({ data: order }, "ModalB2COrderDetail")
//   return (
//     <span> {order.OrderId} </span>
//   )
// }

const fetcher = async (url: URL): Promise<B2CSaleOrderWithBrand[] | null> => {
  const headCon: RequestInit = {}
  if (url.searchParams.get("order_sn")) headCon.cache = "no-store"
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

  const json = (await res.json()) as IResponse<B2CSaleOrderWithBrand[] | undefined>;
  return json.data ?? null;
};


export function B2CDataTable() {

  const [apiPath, setApiPath] = useState<URL>();
  useEffect(() => { if (!apiPath) setApiPath(new URL('/api/b2c/order', window.location.origin)) }, [])

  const { data: orderData, isLoading, error, mutate } = useSWR(apiPath, fetcher, { refreshInterval: 0 });


  // params
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data: orderData ?? [],
    columns: columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection, },
  })

  const filterValue = (table.getColumn("OrderId")?.getFilterValue() as string) ?? "";
  // Lgr.info({ filter: filterValue }, "Param: Filter")

  useEffect(() => {

    if ((startDate || endDate) && apiPath) {
      const api = new URL(apiPath?.toString())
      if (startDate && api)
        api.searchParams.set("start", String(Math.floor(startDate.getTime() / 1000)))

      if (endDate && api)
        api.searchParams.set("end", String(Math.floor(endDate.setHours(23, 59, 59) / 1000)))
      Lgr.info({ param: endDate }, "Param : endDate")

      if (startDate && endDate && (startDate > endDate)) {
        setStartDate(undefined)
        setEndDate(undefined)
        toast.error("Invalid StartDate or EndDate", { description: "Please check again!" })
        // setApiPath(new URL('/api/b2c/order', window.location.origin))
      } else {
        setTimeout(() => setApiPath(api), 1000)
      }
    }
  }, [startDate, endDate])


  // Check valid date

  useEffect(() => {
    const filteredRows = table.getFilteredRowModel().rows
    // Lgr.info({ value: filteredRows }, "table.getFilteredRowModel")
    if (filterValue && filteredRows.length === 0) {
      apiPath?.searchParams.set("order_sn", filterValue)
      mutate()
    } else {
      setApiPath(new URL('/api/b2c/order', window.location.origin))
      mutate()
    }
  }, [filterValue])



  if (!orderData) return (< SkeletonOrderTable />)

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          className="max-w-sm"
          placeholder="Order...?"
          value={(table.getColumn("OrderId")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("OrderId")?.setFilterValue(event.target.value.trim())}
        />

        <CalendarPicker data={startDate} setData={setStartDate} topic="Start Date" />
        <CalendarPicker data={endDate} setData={setEndDate} topic="End Date" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize} `}
            onValueChange={(value: string) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50, 100, 200].map((pageSize) => (
                <SelectItem
                  key={pageSize} value={`${pageSize} `}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-x-2">

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

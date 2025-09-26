"use client"
import Image from "next/image"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IResShopee_GetOrderList_Struct } from "@/app/api/shopee/order/route"
import { IResShopee_GetOrderWithDetailsList_Struct, IResShopee_GetOrderWithDetailsList_Struct_ItemList } from "@/app/api/shopee/order/details/route"

export const ShopeeOrderDetailsColumn: ColumnDef<IResShopee_GetOrderWithDetailsList_Struct>[] = [
  {
    accessorKey: "shop_id",
    header: "Shop ID",
    cell: info => info.getValue() ?? "-",
  },
  {
    accessorKey: "order_sn",
    header: "Order SN",
  },
  {
    accessorKey: "item_list",
    header: "Item",
    cell: info => {
      const items = info.getValue() as IResShopee_GetOrderWithDetailsList_Struct_ItemList[];
      // console.log(`item-list : url ${JSON.stringify(items)}`)
      const item = items[0]
      // return (
      //   <div className="flex space-x-1">
      //     {items?.map((i, idx) =>
      //       i.image_info?.image_url ? (
      //         <Image
      //           key={`img-${i.item_id}-${idx}`}
      //           src={i.image_info.image_url}
      //           alt={i.item_name ?? "Item image"}
      //           className="h-10 w-10 object-cover rounded"
      //         />
      //       ) : null
      //     )}
      //   </div>
      // );
      return (
        <div className="flex space-x-1">
          <Image
            key={`img-${item.item_id}`}
            src={item.image_info?.image_url ?? ""}
            alt={item.item_name}

            height={160}
            width={120}
            className="h-auto w-[120px] object-cover rounded border"
          />
          {/* {items.image_info?.image_url} */}
        </div>
      );
    }
  },
  // {
  //   accessorKey: "booking_sn",
  //   header: "Booking SN",
  // },
  {
    accessorKey: "order_status",
    header: "Order Status",
  },
  {
    accessorKey: "shipping_carrier",
    header: "Shipping Carrier",
  },
  {
    accessorKey: "cod",
    header: "COD",
    cell: info => (info.getValue() ? "Yes" : "No")
  },
  {
    accessorKey: "total_amount",
    header: "Total Amount",
    cell: info => (info.getValue() as number).toLocaleString(),
  },
  {
    accessorKey: "payment_method",
    header: "Payment Method",
  },
  // {
  //   accessorKey: "item_list",
  //   header: "Item List",
  //   cell: info => JSON.stringify(info.getValue()),
  // },
  {
    accessorKey: "create_time",
    header: "Create Time",
    cell: info => new Date(info.getValue() as number * 1000).toLocaleString(),
  },
  {
    accessorKey: "update_time",
    header: "Update Time",
    cell: info => new Date(info.getValue() as number * 1000).toLocaleString(),
  },
  {
    accessorKey: "pickup_done_time",
    header: "Pickup Done Time",
    cell: info => info.getValue() ? new Date(info.getValue() as string | Date).toLocaleString() : "-",
  },


]

export const ShopeeOrderColumn: ColumnDef<IResShopee_GetOrderList_Struct>[] = [
  {
    accessorKey: "order_sn",
    header: "OrderSN"
  },
  {
    accessorKey: "shop_id",
    header: "Shop"
  },
  {
    accessorKey: "order_status",
    header: "Status"
  },
  {
    accessorKey: ""
  }

]

export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const columns: ColumnDef<Payment>[] = [
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
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  // {
  //   accessorKey: "amount",
  //   header: "Amount",
  // },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

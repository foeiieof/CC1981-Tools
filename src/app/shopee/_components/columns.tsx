"use client"
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


// export const ShopeeOrderDetailsColumn: ColumnDef<IResShopee_GetOrderWithDetailsList_Struct>[] = [
//   {
//     accessorKey: "shop_id",
//     header: "Shop ID",
//     cell: info => info.getValue() ?? "-",
//   },
//   {
//     accessorKey: "order_sn",
//     header: "Order SN",
//     cell: ({ row }) => {
//       const order = row.original
//       return (
//         <button
//           className="flex flex-row justify-center items-center gap-2 hover:bg-zinc-100  p-2 rounded-lg "
//           type="button"
//           onClick={() => {
//             toast.success(`Copy OrderSN : ${order.order_sn}`)
//             navigator.clipboard.writeText(order.order_sn)
//           }}
//         >
//           {order.order_sn}
//           <Copy size={12} />

//         </button>
//       )
//     }
//   },
//   {
//     accessorKey: "item_list",
//     header: "Item",
//     cell: info => {
//       const items = info.getValue() as IResShopee_GetOrderWithDetailsList_Struct_ItemList[];
//       // console.log(`item-list : url ${JSON.stringify(items)}`)
//       const item = items[0]
//       // return (
//       //   <div className="flex space-x-1">
//       //     {items?.map((i, idx) =>
//       //       i.image_info?.image_url ? (
//       //         <Image
//       //           key={`img-${i.item_id}-${idx}`}
//       //           src={i.image_info.image_url}
//       //           alt={i.item_name ?? "Item image"}
//       //           className="h-10 w-10 object-cover rounded"
//       //         />
//       //       ) : null
//       //     )}
//       //   </div>
//       // );
//       return (
//         <div className="flex space-x-1">
//           <Image
//             key={`img-${item.item_id}`}
//             src={item.image_info?.image_url ?? ""}
//             alt={item.item_name}

//             height={160}
//             width={120}
//             className="h-auto w-[120px] object-cover rounded border"
//           />
//           {/* {items.image_info?.image_url} */}
//         </div>
//       );
//     }
//   },
//   // {
//   //   accessorKey: "booking_sn",
//   //   header: "Booking SN",
//   // },
//   {
//     accessorKey: "order_status",
//     header: "Order Status",
//   },
//   {
//     accessorKey: "shipping_carrier",
//     header: "Shipping Carrier",
//   },
//   {
//     accessorKey: "cod",
//     header: "COD",
//     cell: info => {
//       const data = info.getValue() ? "Yes" : "No"
//       return (<span className={`font-bold ${data === "Yes" ? " text-green-600" : "text-red-600"}`}> {data}</span>)
//     }
//   },
//   {
//     accessorKey: "total_amount",
//     header: "Total Amount",
//     cell: info => (info.getValue() as number).toLocaleString() + " ฿",
//   },
//   {
//     accessorKey: "payment_method",
//     header: "Payment Method",
//     cell: info => {
//       const data = (info.getValue() as string)
//       return (
//         <span className="max-w-16 text-balance">
//           {data}
//         </span>
//       )
//     }
//   },
//   // {
//   //   accessorKey: "item_list",
//   //   header: "Item List",
//   //   cell: info => JSON.stringify(info.getValue()),
//   // },
//   {
//     accessorKey: "create_time",
//     header: "Create Time",
//     cell: info => {
//       // const opts: Intl.DateTimeFormatOptions = 
//       const time = new Date(info.getValue() as number * 1000).toLocaleString("th-TH", {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit"
//       })
//       return (
//         <span>
//           {time}
//         </span>
//       )
//     },
//   },
//   {
//     accessorKey: "update_time",
//     header: "Update Time",
//     cell: info => {
//       const time = new Date(info.getValue() as number * 1000).toLocaleString("th-TH", {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit"
//       })
//       return (
//         <span>
//           {time}
//         </span>
//       )
//     },
//   },


//   // {
//   //   accessorKey: "pickup_done_time",
//   //   header: "Pickup Done ",
//   //   cell: info => info.getValue() ? new Date(info.getValue() as string | Date).toLocaleString() : "-",
//   // },
//   {
//     id: "actions",
//     enableHiding: false,
//     cell: ({ row }) => {
//       const order = row.original
//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" className="h-8 w-8 p-0">
//               <span className="sr-only">Open menu</span>
//               <MoreHorizontal />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuItem
//               onClick={() => {
//                 // setSelectOrder(order)
//                 // isModalOrderDetails(true)
//               }}
//             >View order details</DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem>Generate AWB</DropdownMenuItem>
//             <DropdownMenuItem>Dowload AWB</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       )
//     },
//   },
// ]

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

"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CircleEllipsis, ClipboardPlus, MoreHorizontal, ReceiptText, TableColumnsSplit } from "lucide-react"

import { B2CSaleOrderWithBrand } from "@/app/api/types"
import { OrderDetailComponentModal } from "./OrderDetail"
import SeparateBillComponentModal from "./SeparateBillComponentModal"
import { Lgr } from "@/app/api/utility"
import UpdateOrderDetailsComponentModal from "./UpdateOrderDetails"
import AddItemsOrderComponentModal from "./AddItemsOrder"
// import { OrderDetailsModal } from "./order-details-modal"
// import { SeparateBillModal } from "./separate-bill-modal"

export interface IOrderGroup {
  order_sn: string;
  order_groups: number;
  order_group_items: Record<string, number>
}

const dat: IOrderGroup = {
  order_sn: "order12345",
  order_groups: 2,
  order_group_items:
  {
    "SKU123456": 1,
    "SKU12354": 2
  }
}

export function OrderActions({ order }: { order: B2CSaleOrderWithBrand }) {
  const [openDetails, setOpenDetails] = useState<boolean>(false)
  const [openSeparate, setOpenSeparate] = useState<boolean>(false)
  const [openUpdate, setOpenUpdate] = useState<boolean>(false)
  const [openAddItem, setAddIten] = useState<boolean>(false)

  const [dataGroup, setDateGroup] = useState<IOrderGroup | null>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpenDetails(true)}>
            <ReceiptText size={13} />
            View Order details
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setOpenSeparate(true)}>
            <TableColumnsSplit size={13} />
            Separate bills
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setOpenUpdate(true)}>
            <CircleEllipsis size={13} />
            Update Details Order
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setAddIten(true)}>
            <ClipboardPlus size={13} />
            Add Items
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      <OrderDetailComponentModal
        order={order}
        open={openDetails}
        onOpenChange={setOpenDetails}
      />
      <SeparateBillComponentModal
        order={order}
        open={openSeparate}
        onOpenChange={setOpenSeparate}
        onOrder={dataGroup}
        onIncreaseOrder={setDateGroup}
      />
      <UpdateOrderDetailsComponentModal
        order={order}
        open={openUpdate}
        onOpenChange={setOpenUpdate}
      />
      <AddItemsOrderComponentModal
        order={order}
        open={openAddItem}
        onOpenChange={setAddIten}
      />

    </>
  )
}

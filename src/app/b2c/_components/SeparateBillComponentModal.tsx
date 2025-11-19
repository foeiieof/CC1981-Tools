"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { B2CSaleOrderWithBrand } from "@/app/api/types"
import React, { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { Blocks, Info, X } from "lucide-react";
import { B2C_SalesOrderLine } from "@prisma/client";
import { IResponse, Lgr } from "@/app/api/utility";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IOrderGroup } from "./OrderActions";
import { toast } from "sonner";
import { type } from "os";
import { Input } from "@/components/ui/input";

function CardSection({ title, icon, children }: { title: string, icon: ReactNode, children: ReactNode }) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <h3 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function format(date?: Date) {
  if (!date) return "-"
  return new Date(date).toLocaleString()
}

function DetailGrid({ children, className }: { children: ReactNode, className?: string }) {
  return <div className={`grid grid-cols-2 gap-y-2 ${className ?? ""}`}>{children}</div>;
}


function DetailItem({ label, value, classVal }: { label: string, value: ReactNode, classVal?: string }) {
  return (
    <div className="flex flex-col text-[10px]">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={`font-medium ${classVal ?? "text-[12px]"}`}>{value || "-"}</span>
    </div>
  );
}

async function FetchOrderDetail(order: string) {
  const api = new URL(`/api/b2c/order/details`, window.location.origin)
  api.searchParams.set("order_sn", order)

  const res = await fetch(api)
  const resParse: IResponse<B2C_SalesOrderLine[]> = await res.json()
  return resParse.data
}

async function PostSeparateOrderDetail(dataGroup: IOrderGroup) {
  if (!dataGroup.order_sn)
    return toast.error(`order is required`)

  const api = new URL(`/api/b2c/order/details`, window.location.origin)
  const res = await fetch(api.toString(),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataGroup)
    })

  const resParse: IResponse<unknown> = await res.json()
  return resParse
}

function SelecGroupComponent({ setState, limit, order }: { setState: Dispatch<SetStateAction<IOrderGroup | null>>, limit?: number, order?: string }) {

  const val = order && order.includes("/") ? order.split("/")[1] : undefined
  const [select, setSelected] = useState<string>(val ?? "")

  useEffect(() => {
    if (select)
      setState((prev) => prev ? ({ ...prev, order_groups: Number(select) }) : prev)
  }, [select])


  useEffect(() => {
    // Lgr.info({ data: val }, "logs")
    if (val) setSelected(val)
  }, [val])

  const numOption = Array.from({ length: val ? Number(val) : (limit ? limit : 5) }, (_, i) => i + 1)
  return (
    <Select value={select} onValueChange={setSelected} disabled={val != undefined} >
      <SelectTrigger className="w-full max-w-[160px]">
        <SelectValue placeholder="Select group" />
      </SelectTrigger>
      <SelectContent className="z-[999]">
        <SelectGroup>
          <SelectLabel>Number</SelectLabel>
          {
            numOption.map((i) => (<SelectItem key={`k-head-${i}`} value={String(i)}>{String(i)}</SelectItem>))
          }
        </SelectGroup>
      </SelectContent>
    </Select>)
}

function SelecSubGroupComponent({ sku, setState, limit, order }: { sku: string, setState: Dispatch<SetStateAction<IOrderGroup | null>>, limit?: number, order?: string }) {
  const val = order && order.includes("/") ? order.split("/")[1] : undefined
  const [select, setSelected] = useState<string>("")

  const numOption = Array.from({ length: (val ? Number(val) : limit ?? 5) }, (_, i) => i + 1)

  useEffect(() => {
    if (select) {
      setState((v) => v ? ({
        ...v, order_group_items: {
          ...v.order_group_items,
          [sku]: Number(select)
        }
      }) : v)
    }
  }, [select])

  // if (order) { Lgr.info({ data: order.split("/")[1], ori: order }, "logs") }
  useEffect(() => {
    if (val) setSelected((val))
  }, [])

  return (
    <Select value={select} onValueChange={setSelected} disabled={val != undefined}>
      <SelectTrigger className="w-full max-w-[160px]">
        <SelectValue placeholder="Select group" />
      </SelectTrigger>
      <SelectContent className="z-[999]">
        <SelectGroup>
          <SelectLabel>Number</SelectLabel>
          {
            numOption.map((i) => (<SelectItem key={`key-sub-${i}`} value={String(i)}>{String(i)}</SelectItem>))
          }

        </SelectGroup>
      </SelectContent>
    </Select>)
}

export default function SeparateBillComponentModal({
  order,
  open,
  onOpenChange,
  onOrder,
  onIncreaseOrder
}: {
  order: B2CSaleOrderWithBrand,
  open: boolean,
  onOpenChange: (v: boolean) => void,
  onOrder: IOrderGroup | null,
  onIncreaseOrder: Dispatch<SetStateAction<IOrderGroup | null>>,
}) {

  const [detail, setDetail] = useState<B2C_SalesOrderLine[]>()
  const [mounted, setMounted] = useState<boolean>(false)

  async function UpdateSplitOrder(data: IOrderGroup) {
    try {
      if (!data.order_sn || Object.entries(data.order_group_items).length < 1)
        return toast.error("Split Order Error", { description: `Order ${order.OrderId} ` })
      const res = await PostSeparateOrderDetail(data) as IResponse<unknown>

      if (res.error)
        return toast.error("Split Order Complete", { description: "" })

      return toast.success("Split Order Complete", { description: JSON.stringify(res.data) })
    } catch {
      return toast.error("Split Order Complete", { description: "try again" })
    }
  }

  useEffect(() => {
    if (open)
      document.body.style.pointerEvents = "auto"
    return () => { document.body.style.pointerEvents = "auto" }
  }, [open])

  useEffect(() => {
    setMounted(true)
    if (mounted && open) {

      onIncreaseOrder(prev => ({ ...prev!, order_sn: order.OrderId }));

      (async () => {
        const res = await FetchOrderDetail(order.OrderId)
        // Lgr.info({ data: JSON.stringify(res) }, "fetchOrderDetail")
        if (res && res.length > 0)
          setDetail(res)
        return
      })()
    }
  }, [mounted, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="  max-w-[95vw] w-full p-0 overflow-hidden z-[99]" >
        {/* Close Button */}
        <X className="h-4 w-4 opacity-0" />
        {/* Header */}
        <DialogHeader className="sticky top-0 z-20 bg-background border-b px-4 py-2">
          <DialogTitle className="text-lg font-semibold">
            Seperate Bill — {order.OrderId}
          </DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-0 pb-4 max-h-[calc(90vh-70px)]">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">

            <CardSection title="Overview" icon={<Info size={14} />}>
              <DetailGrid >
                <DetailItem label="Order ID" value={order.OrderId} />
                <DetailItem label="Date" value={format(order.OrderDate)} />
                <DetailItem label="Status" value={order.OrderStatus} />
                <DetailItem label="Progress" value={order.OrderProgress} />
                <DetailItem
                  label="Group"
                  value={
                    <SelecGroupComponent
                      setState={onIncreaseOrder}
                      limit={detail?.length ?? undefined}
                      order={order.OrderId}
                    />} />
              </DetailGrid>
            </CardSection>

            {/* detail order */}
            {detail && detail?.length > 0 ?
              <CardSection title="Item info" icon={<Blocks size={14} />}>
                {detail.map(i => {
                  // Lgr.info(i)
                  return (<div className="w-full" key={`key-${i.OrderId + i.ItemSKU + i.Seq}`}>
                    <DetailGrid >
                      <DetailItem label="SKU ID" classVal="break-all" value={i.ItemSKU + ' | ' + i.OriItemSKU} />
                      <DetailItem label="Name(Qty)" value={i.Name + "(" + i.Qty + ")"} />
                      <DetailItem label="Sequence" value={
                        <Input
                          className="max-w-[160px]"
                          value={i.Seq}
                          readOnly
                        // onChange={}
                        />
                      } />
                      {/* <DetailItem label="Total Amount" value={Number(i.TotalAmount)} /> */}
                      <DetailItem label="Sub-group"
                        value={
                          <SelecSubGroupComponent
                            sku={i.ItemSKU ?? ""}
                            setState={onIncreaseOrder}
                            limit={detail.length ?? undefined}
                            order={order.OrderId}
                          />}
                      />

                    </DetailGrid>
                    <div className="w-full h-[1px] bg-accent my-2"> </div>
                  </div>
                  )
                })}
              </CardSection>
              : ""}

            <CardSection title="Action" icon={<Info size={14} />}>
              <DetailGrid className="gap-4">
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline">Cancle</Button>

                <Button onClick={() => {
                  if (onOrder && onOrder?.order_groups > 1) {
                    UpdateSplitOrder(onOrder)
                  }
                  else { toast.error("Split Order Error",) }
                }
                }
                  variant="default">Confirm Set Group</Button>
              </DetailGrid>
            </CardSection>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  )
}



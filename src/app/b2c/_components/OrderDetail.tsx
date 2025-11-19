"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { B2CSaleOrderWithBrand } from "@/app/api/types"
import React, { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { Blocks, Calculator, CreditCard, FileText, Info, PackageSearch, Server, Truck, X } from "lucide-react";
import { B2C_SalesOrderLine } from "@prisma/client";
import { IResponse, Lgr } from "@/app/api/utility";
import { IOrderGroup } from "./OrderActions";



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


function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-y-2">{children}</div>;
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

export function OrderDetailComponentModal({
  order,
  open,
  onOpenChange,
}: {
  order: B2CSaleOrderWithBrand
  open: boolean
  onOpenChange: (v: boolean) => void
}) {

  const [detail, setDetail] = useState<B2C_SalesOrderLine[]>()
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    if (open)
      document.body.style.pointerEvents = "auto"
    return () => { document.body.style.pointerEvents = "auto" }
  }, [open])

  useEffect(() => {
    setMounted(true)
    if (mounted && open) {
      (async () => {
        const res = await FetchOrderDetail(order.OrderId)
        Lgr.info({ data: JSON.stringify(res) }, "fetchOrderDetail")
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
            Order Details — {order.OrderId}
          </DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-0 pb-4 max-h-[calc(90vh-70px)]">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <CardSection title="Overview" icon={<Info size={14} />}>
              <DetailGrid>
                <DetailItem label="Order ID" value={order.OrderId} />
                <DetailItem label="Date" value={format(order.OrderDate)} />
                <DetailItem label="Status" value={order.OrderStatus} />
                <DetailItem label="Progress" value={order.OrderProgress} />
              </DetailGrid>
            </CardSection>

            <CardSection title="Shipping Info" icon={<Truck size={14} />}>
              <DetailGrid>
                <DetailItem label="Name" value={order.ShipName} />
                <DetailItem label="Phone" value={order.ShipPhone} />
                <DetailItem label="Email" classVal="break-words" value={order.ShipEmail} />
                <DetailItem label="Zipcode" value={order.ShipZipcode} />
                <DetailItem label="Province" value={order.ShipProvince} />
                <DetailItem label="City" value={order.ShipCity} />
              </DetailGrid>
              <DetailItem label="Address" value={order.ShipAddress.endsWith("*") ? order.ShipAddress.replaceAll("*", "") : order.ShipAddress} />
            </CardSection>

            <CardSection title="Billing Info" icon={<FileText size={14} />}>
              <DetailGrid>
                <DetailItem label="Name" value={order.BillName} />
                <DetailItem label="Phone" value={order.BillPhone} />
                <DetailItem label="Email" classVal="break-words " value={order.BillEmail} />
                <DetailItem label="Zipcode" value={order.BillZipcode} />
                <DetailItem label="Province" value={order.BillProvince} />
                <DetailItem label="City" value={order.BillCity} />
              </DetailGrid>
              <DetailItem label="Address" value={order.BillAddress.endsWith("*") ? order.BillAddress.replaceAll("*", "") : order.BillAddress} />
            </CardSection>


            {/* RIGHT */}

            <CardSection title="Payment" icon={<CreditCard size={14} />}>
              <DetailGrid>
                <DetailItem label="Method" value={order.PaymentMethod} />
                <DetailItem label="Paid Amount" value={String(order.PaidAmount)} />
                <DetailItem label="Is COD" value={order.IsCOD ? "Yes" : "No"} />
                <DetailItem label="Bank Charge" value={String(order.BankCharge)} />
              </DetailGrid>
            </CardSection>

            <CardSection title="Logistics" icon={<PackageSearch size={14} />}>
              <DetailGrid>
                <DetailItem label="Logis Name" value={order.LogisName} />
                <DetailItem label="Tracking" value={order.TrackingNumber} />
                <DetailItem label="Shipping Price" value={String(order.ShippingPrice)} />
              </DetailGrid>

              {order.AWBUrl && (
                <DetailItem
                  label="AWB"
                  value={
                    <a href={order.AWBUrl} target="_blank" className="underline text-primary">
                      View File
                    </a>
                  }
                />
              )}
            </CardSection>

            <CardSection title="Amount Summary" icon={<Calculator size={14} />}>
              <DetailGrid>
                <DetailItem label="Total Before" value={String(order.TotalAmountBeforeCal)} />
                <DetailItem label="Discount" value={String(order.DiscountAmount)} />
                <DetailItem label="VAT Type" value={order.VatType} />
                <DetailItem label="VAT Amount" value={String(order.VatAmount)} />
                <DetailItem label="Total" value={String(order.TotalAmount)} />
                <DetailItem label="Seller Rebate" value={String(order.TotalSellerRebate)} />
              </DetailGrid>
            </CardSection>

            <CardSection title="System Info" icon={<Server size={14} />}>
              <DetailGrid>
                <DetailItem label="Created By" value={order.CreatedBy} />
                <DetailItem label="Created Date" value={format(order.CreationDate)} />
                <DetailItem label="Modified By" value={order.ModifiedBy} />
                <DetailItem label="Modified Date" value={format(order.ModifiedDate)} />
                <DetailItem label="Brand" value={order.Brand} />
                <DetailItem label="Platform" value={order.Platform} />
              </DetailGrid>
            </CardSection>

            {/* detail order */}
            {detail && detail?.length > 0 ?
              <CardSection title="Item info" icon={<Blocks size={14} />}>
                {detail.map(i => {
                  // Lgr.info(i)
                  return (<div className="w-full" key={`key-${i.OrderId + i.ItemSKU + i.Seq}`}>
                    <DetailGrid >
                      <DetailItem label="Brand" value={i.Brand} />
                      <DetailItem label="Sequence" value={i.Seq} />
                      <DetailItem label="SKU ID" classVal="break-all" value={i.ItemSKU + ' | ' + i.OriItemSKU} />
                      <DetailItem label="Name" value={i.Name} />
                      <DetailItem label="Qty" value={i.Qty} />
                      <DetailItem label="Total Amount" value={Number(i.TotalAmount)} />
                    </DetailGrid>
                    <div className="w-full h-[1px] bg-accent my-2"> </div>
                  </div>
                  )
                })}
              </CardSection>
              : ""}

          </div>

        </div>

      </DialogContent>
    </Dialog>
  )
}

function format(date?: Date) {
  if (!date) return "-"
  return new Date(date).toLocaleString()
}

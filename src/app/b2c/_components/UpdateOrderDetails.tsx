import { B2CSaleOrderWithBrand } from "@/app/api/types";
import { IResponse } from "@/app/api/utility";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { B2C_SalesOrderLine } from "@prisma/client";
import { Blocks, Info, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

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

function format(date?: Date) {
  if (!date) return "-"
  return new Date(date).toLocaleString()
}


async function FetchOrderDetail(order: string) {
  const api = new URL(`/api/b2c/order/details`, window.location.origin)
  api.searchParams.set("order_sn", order)

  const res = await fetch(api)
  const resParse: IResponse<B2C_SalesOrderLine[]> = await res.json()
  return resParse.data
}



export default function UpdateOrderDetailsComponentModal({
  order,
  open,
  onOpenChange,
}: {
  order: B2CSaleOrderWithBrand,
  open: boolean,
  onOpenChange: (v: boolean) => void,
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

                <Button onClick={() => { }}
                  variant="default">Confirm Update OrderDetails</Button>
              </DetailGrid>
            </CardSection>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  )
}

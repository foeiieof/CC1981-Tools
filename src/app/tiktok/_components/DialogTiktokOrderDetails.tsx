"use client";

import { Dispatch, memo, SetStateAction, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button"
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { IResTiktokOrderSDK } from "@/app/api/tiktok/order/route";


function DialogTiktokOrderDetails({ data, state }: { data: IResTiktokOrderSDK | undefined, state: [boolean, Dispatch<SetStateAction<boolean>>] }) {

  const [order, setOrder] = useState<IResTiktokOrderSDK | null>(null);

  const [loadingOrderDetails, setLoadingOrderDetails] = state;
  const [activeOrderDetailsTab, setAvtiveOrderDetailsTab] = useState<string>("info")



  useEffect(() => {
    if (data != undefined)
      setOrder(data)
  }, [data])



  const itemsList = order?.lineItems ? order.lineItems : []

  const orderImage = useMemo(() => {
    const items = itemsList[0] ? itemsList[0] : {}
    return (
      <Image
        src={items.skuImage ?? ""}
        alt={items.skuName ?? ""}
        width={180}
        height={220}
        className="rounded object-cover w-auto h-auto"
      />
    )
  }, [itemsList])


  return (
    <Dialog open={loadingOrderDetails} onOpenChange={setLoadingOrderDetails}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>

          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4">


            <div className="grid gap-2 [&_label]:font-bold">
              <Label>Items</Label>
              <div className="space-y-2">
                {itemsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 border rounded p-2"
                  >
                    {orderImage}
                    {/* {item.image_info?.image_url && ( */}
                    {/*   <Image */}
                    {/*     src={item.image_info.image_url} */}
                    {/*     alt={item.item_name} */}
                    {/*     width={48} */}
                    {/*     height={48} */}
                    {/*     className="h-12 w-12 object-cover rounded" */}
                    {/*     loading="lazy" */}
                    {/*   /> */}
                    {/* )} */}
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{item.productName}</span>
                      <span>{item.skuName}</span>
                      <span className="">
                        {"(" + 1 + ")"} ×{" "}
                      </span>

                      <div>
                        <label className="text-zinc-200 line-through ">
                          {(item.originalPrice ?? 0).toLocaleString()}
                        </label>
                        &nbsp;
                        <label className="text-red-600">
                          {(item.salePrice ?? 0).toLocaleString()} ฿
                        </label>
                      </div>


                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Tabs
              value={activeOrderDetailsTab}
              onValueChange={(val) => {
                setAvtiveOrderDetailsTab(val)
              }}
              defaultValue="info" className="w-full">
              <TabsList className="grid grid-cols-3 w-full gap-2">
                {
                  Array.from(["info", "payment", "shipping"]).map((i) => {
                    return (
                      <TabsTrigger key={i} value={i} >
                        <div className={`w-full h-fit px-[6px] text-center font-bold text-[10px] rounded-full `}>
                          <span>{i.toUpperCase()}</span>
                        </div>
                      </TabsTrigger>
                    )
                  })
                }
              </TabsList>

              {/* Info */}
              <TabsContent value="info" className="space-y-4">
                <div>
                  <Label className="font-bold">Order SN</Label>
                  <p>{order.id}</p>
                </div>
                <div>
                  <Label className="font-bold">Status</Label>
                  <p>{order.status}</p>
                </div>
                <div>
                  <Label className="font-bold">Created At</Label>
                  <p>{new Date(order.createTime as number * 1000).toLocaleString("th-TH")}</p>
                </div>
              </TabsContent>

              {/* Payment */}
              <TabsContent value="payment" className="space-y-4">
                <div>
                  <Label className="font-bold">Method</Label>
                  <p>{order.paymentMethodName}</p>
                </div>
                <div>
                  <Label className="font-bold">COD</Label>
                  <p>{order.isCod ? "Yes" : "No"}</p>
                </div>
                <div>
                  <Label className="font-bold">Total</Label>
                  <p>{(order.payment?.totalAmount ?? 0).toLocaleString()} ฿</p>
                </div>
              </TabsContent>

              {/* Shipping */}
              <TabsContent value="shipping" className="space-y-4">
                <div>
                  <Label className="font-bold">Carrier</Label>
                  <p>{order.shippingProvider}</p>
                </div>
                <div>
                  <Label className="font-bold">Tracking</Label>
                  <p>{order.trackingNumber}</p>
                </div>
              </TabsContent>

            </Tabs>

          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(DialogTiktokOrderDetails)


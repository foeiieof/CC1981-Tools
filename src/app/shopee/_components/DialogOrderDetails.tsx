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
import { IResShopee_GetOrderWithDetailsList_Struct } from "@/app/api/shopee/order/details/route";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


function OrderDetailsDialog({ data, state }: { data: IResShopee_GetOrderWithDetailsList_Struct | undefined, state: [boolean, Dispatch<SetStateAction<boolean>>] }) {

  const [order, setOrder] = useState<IResShopee_GetOrderWithDetailsList_Struct | null>(null);

  const [loadingOrderDetails, setLoadingOrderDetails] = state;
  const [activeOrderDetailsTab, setAvtiveOrderDetailsTab] = useState<string>("info")



  useEffect(() => {
    if (data != undefined)
      setOrder(data)
  }, [data])

  // if (order && order?.item_list[1].image_info != undefined)
  //   console.log(order?.order_sn)

  const orderImage = useMemo(() => (
    <Image
      src={order?.item_list[0].image_info?.image_url ?? ""}
      alt={order?.item_list[0].item_name ?? ""}
      width={180}
      height={220}
      className="rounded object-cover w-auto h-auto"
    />
  ), [order?.item_list])

  // console.log(order?.create_time)
  return (
    <Dialog open={loadingOrderDetails} onOpenChange={setLoadingOrderDetails}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            {/* {state */}
            {/*   ? "Loading..." */}
            {/*   : order */}
            {/*     ? `Order SN: ${order.order_sn}` */}
            {/*     : "No data found"} */}
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4">
            {/* <div className="grid gap-2 [&_label]:font-bold"> */}
            {/*   <Label>Status</Label> */}
            {/*   <span className="text-sm">{order.order_status}</span> */}
            {/* </div> */}
            {/* <div className="grid gap-2 [&_label]:font-bold"> */}
            {/*   <Label className="">Payment Method</Label> */}
            {/*   <span className="text-sm">{order.payment_method}</span> */}
            {/* </div> */}

            <div className="grid gap-2 [&_label]:font-bold">
              <Label>Items</Label>
              <div className="space-y-2">
                {order.item_list.map((item, idx) => (
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
                      <span className="font-medium">{item.item_name}</span>
                      <span>{item.model_name}</span>
                      <span className="">
                        {"(" + item.model_quantity_purchased + ")"} ×{" "}
                      </span>

                      <div>
                        <label className="text-zinc-200 line-through ">
                          {item.model_original_price.toLocaleString()}
                        </label>
                        &nbsp;
                        <label className="text-red-600">
                          {item.model_discounted_price.toLocaleString()} ฿
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
                  <p>{order.order_sn}</p>
                </div>
                <div>
                  <Label className="font-bold">Status</Label>
                  <p>{order.order_status}</p>
                </div>
                <div>
                  <Label className="font-bold">Created At</Label>
                  <p>{new Date(order.create_time as number * 1000).toLocaleString("th-TH")}</p>
                </div>
              </TabsContent>

              {/* Payment */}
              <TabsContent value="payment" className="space-y-4">
                <div>
                  <Label className="font-bold">Method</Label>
                  <p>{order.payment_method}</p>
                </div>
                <div>
                  <Label className="font-bold">COD</Label>
                  <p>{order.cod ? "Yes" : "No"}</p>
                </div>
                <div>
                  <Label className="font-bold">Total</Label>
                  <p>{order.total_amount.toLocaleString()} ฿</p>
                </div>
              </TabsContent>

              {/* Shipping */}
              <TabsContent value="shipping" className="space-y-4">
                <div>
                  <Label className="font-bold">Carrier</Label>
                  <p>{order.shipping_carrier}</p>
                </div>
                <div>
                  <Label className="font-bold">Tracking</Label>
                  {/* <p>{order.tracking_no ?? "-"}</p> */}
                </div>
                {/* {order.recipient_address && ( */}
                {/* <div> */}
                {/*   <Label className="font-bold">Address</Label> */}
                {/*   <p>{order.recipient_address.full_address}</p> */}
                {/* </div> */}
                {/* )} */}
              </TabsContent>

              {/* Items */}
              {/* <TabsContent value="items" className="space-y-4"> */}
              {/*   {order.item_list.map((item, idx) => ( */}
              {/*     <div */}
              {/*       key={idx} */}
              {/*       className="flex items-center space-x-2 border rounded p-2" */}
              {/*     > */}
              {/*       {item.image_info?.image_url && ( */}
              {/*         <Image */}
              {/*           src={item.image_info.image_url} */}
              {/*           alt={item.item_name} */}
              {/*           width={48} */}
              {/*           height={48} */}
              {/*           className="h-12 w-12 object-cover rounded" */}
              {/*         /> */}
              {/*       )} */}
              {/*       <div className="flex flex-col"> */}
              {/*         <span className="font-medium">{item.item_name}</span> */}
              {/*         {item.model_name && <span>{item.model_name}</span>} */}
              {/*         <span> */}
              {/*           {item.model_quantity_purchased} ×{" "} */}
              {/*           {item.model_discounted_price.toLocaleString()} ฿ */}
              {/*         </span> */}
              {/*       </div> */}
              {/*     </div> */}
              {/*   ))} */}
              {/* </TabsContent> */}
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

export default memo(OrderDetailsDialog)


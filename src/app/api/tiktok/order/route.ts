import { NextRequest } from "next/server"
import { ResponseHandle } from "../../utility"
import { Order202309GetOrderListRequestBody, Order202309GetOrderListResponseDataOrders, TikTokShopNodeApiClient } from "@/lib/sdk/tiktok"
import { PrismaClient } from "@prisma/client";
import { EnumTiktokOrderStatus } from "../order-awb/route";

const prisma = new PrismaClient()

async function TiktokGetOrderListRecursive(para: {
  shop_cipher: string | undefined; access_token: string | undefined;
}, bd: Order202309GetOrderListRequestBody, store: Order202309GetOrderListResponseDataOrders[] = [], pgToken?: string) {
  const api = new TikTokShopNodeApiClient({ config: { app_key: process.env.TIKTOK_APP_ID, app_secret: process.env.TIKTOK_SECRET_KEY } })
  const res = await api.api.OrderV202309Api.OrdersSearchPost(100, para.shop_cipher ?? "", para.access_token ?? "", "application/json", "DESC", pgToken ?? "", "create_time", bd)
  if (res.body.data) {
    console.log(`[Log] TiktokGetOrderListRecursive : ${JSON.stringify(res.body.code)}\n`)
    const data = res.body.data.orders ?? []
    store.push(...data ?? [])
    if (res.body.data.nextPageToken != "")
      return await TiktokGetOrderListRecursive(para, bd, store, res.body.data.nextPageToken)
  }
  return store
}


export interface IResTiktokOrderSDK extends Order202309GetOrderListResponseDataOrders {
  shop_name?: string
  cipher_id?: string
  on_server?: boolean
}

export async function GET() {
  // const query = req.nextUrl.searchParams
  // const para = { shop_cipher: query.get("shop_cipher") ?? undefined, access_token: query.get("access_token") ?? undefined, }
  // if (!para.access_token || !para.shop_cipher)
  //   return ResponseHandle.error("data required", "orderawb-tiktok-shop", 400)

  try {

    const nowTime = new Date()
    const yesTime = new Date()
    yesTime.setDate(yesTime.getDate())
    yesTime.setHours(0, 0, 0, 0)

    const shop = await prisma.tiktok_ShopInfo.findMany({ select: { ShopName: true, Cipher: true } })
    const shopProm = shop.map(async (i) => {
      const access = await prisma.tikTok_AccessToken.findFirst({ where: { SellerName: i.ShopName }, select: { AccessToken: true }, orderBy: { CreationDate: "desc" } })
      return {
        shop_name: i.ShopName,
        shop_cipher: i.Cipher,
        access_token: access?.AccessToken,
      }
    })
    const shopPromRes = await Promise.allSettled(shopProm)

    const shopStore = shopPromRes.filter(i => i.status === "fulfilled").map(s => s.value)
    const orderAllShopStore: Record<string, IResTiktokOrderSDK[]> = {}
    const orderProm = shopStore.map(async (i) => {
      const stateFetch = Object.values(EnumTiktokOrderStatus)
        .filter(s => s != "UNKNOWN" && s != "PRE_ORDER" && s != "COMPLETED")
        .map(async (b) => {
          const para = { shop_cipher: i.shop_cipher, access_token: i.access_token }
          const body = new Order202309GetOrderListRequestBody();
          body.createTimeGe = Math.floor(yesTime.getTime() / 1000);
          body.createTimeLt = Math.floor(nowTime.getTime() / 1000);
          body.orderStatus = b;
          // body.updateTimeGe = "";
          // body.updateTimeLt = "";
          // body.shippingType = "TIKTOK";
          // body.buyerUserId = "";
          // body.isBuyerRequestCancel = false;
          // body.warehouseIds = [""];
          const resData = await TiktokGetOrderListRecursive(para, body, undefined)
          const resDataCheck = resData.map(async (order) => {
            const state = order.status ?? "UNKNOWN"
            orderAllShopStore[state] ??= []
            const data: IResTiktokOrderSDK = order
            if (order.packages && order.packages.length > 0) {
              const onServ = await prisma.b2C_OrderAWB.findFirst({ where: { OrderId: order.id }, select: { OrderId: true } })
              data.on_server = onServ && onServ.OrderId.length > 0 ? true : false
            }
            data.shop_name = i.shop_name
            data.cipher_id = i.shop_cipher
            orderAllShopStore[state].push(data)
          })

          await Promise.allSettled(resDataCheck)
        })
      await Promise.allSettled(stateFetch)
    })
    await Promise.allSettled(orderProm)

    // const orderAllShopRes = orderAllShop.filter(i => i.status === "fulfilled").forEach((o) => {
    //   const data = o.value
    //   if (data.length > 0) {
    //     data.forEach((a) => {

    //       const state = a.status ?? EnumTiktokOrderStatus.UNKNOWN
    //       const orderOpts: IResTiktokOrderSDK = a
    //       orderOpts.shop_name =

    //         orderAllShopStore[state] ??= []
    //       orderAllShopStore[state].push(a)

    //     })
    //   }
    // })



    // const nowTime = new Date()
    // const yesTime = new Date()
    // yesTime.setDate(yesTime.getDate() - 1)
    // yesTime.setHours(0, 0, 0, 0)
    // const body = new Order202309GetOrderListRequestBody();
    // body.createTimeGe = Math.floor(yesTime.getTime() / 1000);
    // body.createTimeLt = Math.floor(nowTime.getTime() / 1000);
    // body.orderStatus = EnumTiktokOrderStatus.CANCELLED;
    // body.updateTimeGe = "";
    // body.updateTimeLt = "";
    // body.shippingType = "TIKTOK";
    // body.buyerUserId = "";
    //     body.isBuyerRequestCancel = false;
    // body.warehouseIds = [""];
    // const res = await api.api.OrderV202309Api.OrdersSearchPost(100, para.shop_cipher, para.access_token, "application/json", "DESC", "", "create_time", body)
    // const resData = await TiktokGetOrderListRecursive(para, body, undefined)

    return ResponseHandle.success(orderAllShopStore, "[GET]-Tiktok_Order_All", 200)
    // http://localhost:3001/api/tiktok/order?shop_cipher=ROW_ru38XgAAAAB1gQ09LeILx2-ZsC2JdH1t&access_token=ROW_EAM8GQAAAACVgvgLtQnuUA1zHVqvKfYyPDJLHJOUtirA9AHtrA9L8NaG-LCvvGEyfoZ6r7LXXiAo_UzVzuxGYUJNBQBt_7K3rtMO9-0E1P3xJTc0a_t6XdH1sITCPp9WsQEwtYrDAlI
  } catch (error) {
    const err = error as ErrorEvent
    return ResponseHandle.error(err.error, "[GET]-Tiktok_Order_All", 400)
  }
}



import { NextRequest, NextResponse } from "next/server"
import { IResShopeeAPI, ResponseHandle } from "@/app/api/utility"
import crypto from "crypto"
import { PrismaClient } from "@prisma/client"

export interface IResShopee_GetShippingDoc_Struct {
  order_sn: string
  status: "READY" | "FAILED" | "PROCESSING",
  onServer?: boolean
}


// interface IResShopAccess {
//   ShopId: string
//   CreationDate: Date
//   AccessToken: string
// }


// for response json 
export interface IResShopee_GetShippingDoc {
  result_list: IResShopee_GetShippingDoc_Struct[]
}


export interface IResShopee_GetOrderList_Struct {
  order_sn: string
  order_status: string
  booking_sn: string
  shop_id?: string
}

export interface IResShopee_GetOrderList {
  more: boolean
  order_list: IResShopee_GetOrderList_Struct[]
  next_cursor: string
}


// interface IResGETOrderList {
//   shop_id: string
//   order_sn: string
//   order_status?: string
//   booking_sn: string
// }

export enum EnumShopee_GetOrderList {
  UNPAID = "UNPAID",
  READY_TO_SHIP = "READY_TO_SHIP",
  PROCESSED = "PROCESSED",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  IN_CANCEL = "IN_CANCEL",
  CANCELLED = "CANCELLED"
}

const prisma = new PrismaClient()

// new func get order from shopee
async function ShopeeGetOrderList({ shopID, accessToken, from, to, cursor, status }: { shopID: string, accessToken: string, from?: number, to?: number, cursor?: string, status?: EnumShopee_GetOrderList }) {

  const baseAPI = process.env.SHOPEE_BASE_API ?? "https://partner.shopeemobile.com"
  const pathAPI = "/api/v2/order/get_order_list"
  const partnerID = process.env.SHOPEE_PARTNER_ID ?? "2003362"
  const secretKey = process.env.SHOPEE_SECRET_KEY ?? "fdcdd1bfe5f7a28d3ed7d3702b75ff1e69a5cc91f38cc6cdd5ea8170b2f04891"
  const timestamp = Math.floor(new Date().getTime() / 1000)

  const url = new URL(baseAPI)
  url.pathname = pathAPI
  url.searchParams.append("partner_id", partnerID)
  url.searchParams.append("timestamp", timestamp.toString())
  url.searchParams.append("access_token", accessToken)
  url.searchParams.append("shop_id", shopID)

  // generate sign
  const baseSign = `${partnerID}${pathAPI}${timestamp}${accessToken}${shopID}`
  const sign = crypto.createHmac("sha256", secretKey).update(baseSign).digest("hex")
  url.searchParams.append("sign", sign)

  // set params : time_range_field, time_from, time_to, page_size 
  const secPerDay = 24 * 60 * 60
  const timeTo = to ?? Math.floor((new Date).getTime() / 1000);
  const timeFrom = from ?? timeTo - (1 * secPerDay)

  url.searchParams.append("response_optional_fields", "order_status")
  url.searchParams.append("time_range_field", "create_time")
  url.searchParams.append("time_from", timeFrom.toString())
  url.searchParams.append("time_to", timeTo.toString())
  url.searchParams.append("page_size", (100).toString())

  if (cursor)
    url.searchParams.append("cursor", cursor)

  if (status)
    url.searchParams.append("order_status", status)

  try {
    const seen = new Set<string>()
    const res = await fetch(url.toString(), { method: "GET", headers: { "Content-Type": "application/json" }, })
    const data: IResShopeeAPI<IResShopee_GetOrderList> = await res.json()
    if (data && data.response.order_list.length > 0) {
      data.response.order_list = data.response.order_list
        .map(o => ({ shop_id: shopID, ...o })).filter((order => {
          return (o => {
            if (seen.has(o.order_sn)) return false
            seen.add(o.order_sn)
            return true
          })(order)
        }))
    }

    return data
  } catch {
    return null
  }
}


export async function GET() {
  // get shop data
  const excludes = [
    "358708695",
    "652574555",
    "796958689",
    "980017606",
    "219173758",
    "133460598",
    "139562069",
    "95456363",
    "95300527"
  ]

  // demo
  // const shopList = await prisma.shopee_ShopInfo.findMany({ where: { ShopId: { in: [parseInt("15300402")] } }, select: { ShopId: true } })

  const excludesParse = excludes.map(i => { return (parseInt(i)) })
  const shopList = await prisma.shopee_ShopInfo.findMany({ where: { ShopId: { notIn: excludesParse } }, select: { ShopId: true } })

  if (shopList.length > 0) {
    const shopListOnlyID = shopList.map(i => { return i.ShopId.toString() })
    const FuncshopListAccess = async (shop: string[]) => {
      return Promise.all(
        shop.map((shop) =>
          prisma.shopee_AccessToken.findFirst({
            where: { ShopId: shop },
            select: {
              ShopId: true,
              AccessToken: true,
              CreationDate: true
            },
            orderBy: { CreationDate: "desc" }
          })
        )
      )
    }

    const shopListAccessResult = await FuncshopListAccess(shopListOnlyID)

    //old
    // const shopWithOrderListResult: { [key: string]: { count: number, data: (IResShopee_GetOrderList_Struct[] | []) } } = {}
    // new
    const shopWithOrderListResult: Record<string, { count: number, data: IResShopee_GetOrderList_Struct[] }> = {}

    async function ShopeeGetOrderListRecursive(
      shop: { ShopId: string, CreationDate: Date, AccessToken: string } | null,
      state: EnumShopee_GetOrderList,
      cursor?: string,
      store: { state: string, success: boolean, data: IResShopee_GetOrderList_Struct[] } = { state: "", success: false, data: [] }
    ): Promise<{ state: string, success: boolean, data: IResShopee_GetOrderList_Struct[] }> {
      // console.log(`[LOG] res-recursive-state : ${state}\n`)
      return ShopeeGetOrderList({ shopID: shop?.ShopId ?? "", accessToken: shop?.AccessToken ?? "", status: state, cursor: cursor })
        .then(res => {
          // console.log(`[LOG] res-recursive : ${JSON.stringify(res)}\n`)
          store.state = state
          store.success = true
          if (res && res.error === "" && res?.response.order_list.length > 0)
            store.data?.push(...res?.response.order_list)

          if (res?.response.more && res?.response.next_cursor != "")
            return ShopeeGetOrderListRecursive(shop, state, res.response.next_cursor, store)
          return store
        })
    }


    const promiseShopList = Object.values(shopListAccessResult).map(async (s) => {
      const promiseList = Object.values(EnumShopee_GetOrderList)
        .filter(i => i != EnumShopee_GetOrderList.CANCELLED
          && i != EnumShopee_GetOrderList.UNPAID
          && i != EnumShopee_GetOrderList.COMPLETED
          && i != EnumShopee_GetOrderList.SHIPPED
          && i != EnumShopee_GetOrderList.PROCESSED
          && i != EnumShopee_GetOrderList.IN_CANCEL
        )
        .map(state =>
          ShopeeGetOrderListRecursive(s, state)

        )
      const res = await Promise.allSettled(promiseList)
      for (const r of res) {
        if (r.status === "fulfilled" && r.value.data) {
          const oldData = shopWithOrderListResult[r.value.state] ??= { count: 0, data: [] }
          oldData.count += r.value.data.length
          oldData.data = oldData.data?.concat(r.value.data)
          // shopWithOrderListResult[r.value.state].push({ count: oldData.count+= r.value.data.length, data: oldData.data?.concat( ...r.value.data) })
        }
      }
    })


    await Promise.allSettled(promiseShopList)

    // loop on each shop 
    // for (const shop of shopListAccessResult) {
    //   // loop on each status 
    //   // for (const state of Object.values(Shopee_GetOrderList)) { }
    //   const promiseList = Object.values(EnumShopee_GetOrderList).filter(i => i != "COMPLETED" && i != "CANCELLED" && i != "SHIPPED").map(s =>
    //     // replace with recursive
    //     ShopeeGetOrderListRecursive(shop, s)
    //     // original 
    //     // ShopeeGetOrderList({ shopID: shop?.ShopId ?? "", accessToken: shop?.AccessToken ?? "", status: s })
    //     //   .then(data => ({ state: s, success: true, data: data?.response.order_list }))
    //     //   .catch(data => ({ state: s, success: false, data: data }))
    //   )

    //   // old way
    //   // const res = await ShopeeGetOrderList({ shopID: shop?.ShopId ?? "", accessToken: shop?.AccessToken ?? "" })
    //   // new way

    //   const res = await Promise.allSettled(promiseList)

    //   for (const r of res) {
    //     if (r.status === "fulfilled" && r.value.data) {
    //       const oldData = shopWithOrderListResult[r.value.state] ??= { count: 0, data: [] }
    //       oldData.count += r.value.data.length
    //       oldData.data = oldData.data?.concat(r.value.data)
    //       // shopWithOrderListResult[r.value.state].push({ count: oldData.count+= r.value.data.length, data: oldData.data?.concat( ...r.value.data) })
    //     }
    //   }

    // console.log(`[LOG] res : ${JSON.stringify(res)}`)
    // if (res?.error != "") continue
    // if (res?.response && res?.response.order_list.length > 0) {
    //   let loopString = ""
    //   if (res.response.next_cursor != "") loopString = res.response.next_cursor
    //   console.log(`[LOG] loopString : ${loopString}`)
    //   const orderList: IResGETOrderList[] = res.response.order_list.map((i) => {
    //     return {
    //       shop_id: shop?.ShopId ?? "",
    //       order_sn: i.order_sn,
    //       order_status: i.order_status,
    //       booking_sn: i.booking_sn
    //     }
    //   })

    //   shopWithOrderListResut.push(...orderList)


    //   // let retry: number = 0
    //   while (loopString != "") {
    //     const res = await ShopeeGetOrderList({ shopID: shop?.ShopId ?? "", accessToken: shop?.AccessToken ?? "", cursor: loopString })
    //     console.log(`[LOG] res in loops : ${JSON.stringify(res)}\n`)
    //     // retry++

    //     if (res?.error != "") break
    //     loopString = res.response.more && res?.response.next_cursor ? res?.response.next_cursor : ("")

    //     const orderList: IResGETOrderList[] | undefined = res?.response.order_list.map((i) => {
    //       return {
    //         shop_id: shop?.ShopId ?? "",
    //         order_sn: i.order_sn,
    //         order_status: i.order_status,
    //         booking_sn: i.booking_sn
    //       }
    //     })

    //     if (orderList && orderList?.length > 0)
    //       shopWithOrderListResut.push(...orderList)

    //   }
    // }
    // }

    return ResponseHandle.success(shopWithOrderListResult, "success", 200)
  }
  return ResponseHandle.error("error fetch order", `${"1"}`, 400)
}

export async function POST(req: NextRequest) {

  const query = req.nextUrl.searchParams

  const body: string[] = await req.json().then((i) => i.order_list)

  console.log("body:", body)

  if (body.length < 1) {
    return NextResponse.json(
      { message: "Bad Request in params" },
      { status: 400 }
    )
  }

  const shopQuerry = query.get("shop_id") ?? ""
  const accessQuery = query.get("access_token") ?? ""

  // find in open api
  const baseAPI = process.env.SHOPEE_BASE_API ?? "https://partner.shopeemobile.com"
  const pathAPI = "/api/v2/logistics/get_shipping_document_result"
  const partnerID = process.env.SHOPEE_PARTNER_ID ?? "2003362"
  const secretKey = process.env.SHOPEE_SECRET_KEY ?? undefined
  const timestamp = Math.floor(new Date().getTime() / 1000)

  if (shopQuerry === "" || accessQuery === "" || secretKey === undefined) return ResponseHandle.error("[GET]-api/shopee/order", "Bad request", 400)

  const url = new URL(baseAPI)
  url.pathname = pathAPI
  url.searchParams.append("partner_id", partnerID)
  url.searchParams.append("timestamp", timestamp.toString())
  url.searchParams.append("shop_id", shopQuerry)
  url.searchParams.append("access_token", accessQuery)

  // generate sign
  const baseSign = `${partnerID}${pathAPI}${timestamp}${accessQuery}${shopQuerry}`
  const sign = crypto.createHmac("sha256", secretKey).update(baseSign).digest("hex")
  url.searchParams.append("sign", sign)

  // get shopee open API
  console.log("url to ShopeeAPI: ", url.toString())

  // parse body to json

  const bodyParse: { order_sn: string }[] = body.map((b) => ({ order_sn: b.trim() }))


  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_list: bodyParse
      })
    })

    // console.log("url to ShopeeAPI-------------: ", await res.json())
    // if (!res.ok) {
    //   return ResponseHandle.error("[GET]api/Shopee/Order", "response cant fetch", 400)
    // }

    const data: IResShopeeAPI<IResShopee_GetShippingDoc> = await res.json()
    console.log("[POST] ShopeeOrderCheckStatus : ", data)
    if (data.message != "") {
      return ResponseHandle.error("error", `${data.message}`, 400)
    }

    // check on server
    // if (data.response.result_list.length > 0) {
    //   for (let i = 0; i < data.response.result_list.length; i++) {
    //     const order = data.response.result_list[i]
    //     const resServ = await prisma.b2C_OrderAWB.findFirst({
    //       where: { OrderId: order.order_sn },
    //       select: { OrderId: true }
    //     })

    //     if (resServ != null && resServ?.OrderId.length > 0) {
    //       data.response.result_list[i].onServer = true
    //     }
    //   }
    // }

    const orderSNs = data.response.result_list.map(o => o.order_sn)
    const existOrders = await prisma.b2C_OrderAWB.findMany({
      where: { OrderId: { in: orderSNs } },
      select: { OrderId: true }
    })
    const existSet = new Set(existOrders.map(o => o.OrderId))
    data.response.result_list = data.response.result_list.map(o => ({
      ...o,
      onServer: existSet.has(o.order_sn)
    }))

    // const init: ResponseInit = { }
    return ResponseHandle.success(data.response.result_list, "succes-shopee-shop", 200, 0, 0, {
      headers: {
        "Cache-Control": "private, max-age=3600, stale-while-validate=60"
      }
    })

  } catch {

    return ResponseHandle.error("error", "[GET]api/Shopee/Order", 400)
  }
}

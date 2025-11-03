import crypto from "crypto"

import { EnumShopee_GetOrderList, IResShopeeAPI, ResponseHandle } from "@/app/api/utility"
import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export interface IReqShopeeOrderDetails {
  shop_id: string
  access_token: string
  order_sn_list: string[]
}

export interface IResShopee_GetOrderWithDetailsList_Struct_ItemList {
  item_id: number
  item_name: string
  item_sku: string
  model_id: number
  model_name: string
  model_sku: string
  model_quantity_purchased: number
  model_original_price: number
  model_discounted_price: number
  wholesale: boolean
  weight: number
  add_on_deal: boolean
  main_item: boolean
  add_on_deal_id: number
  promotion_type: "product_promotion" | "flash_sale" | "bundle_deal" | "add_on_deal_main" | "add_on_deal_sub";
  promotion_id: number
  order_item_id: number
  promotion_group_id: number
  image_info?: {
    image_url: string
  }
  product_location_id?: string
  is_prescription_item?: boolean
  is_b2c_owned_item?: boolean
  consultation_id?: string
}

export interface IResShopee_GetOrderWithDetailsList_Struct {
  order_sn: string
  booking_sn: string
  order_status: string
  shipping_carrier: string
  cod: boolean
  total_amount: number
  payment_method: string
  item_list: IResShopee_GetOrderWithDetailsList_Struct_ItemList[]
  create_time: Date | number
  update_time: Date | number
  pickup_done_time: Date
  shop_id?: string
}

export type ShopeeOrderRequestBody = {
  [key in EnumShopee_GetOrderList]?: IReqShopeeOrderDetails[]
}

async function FetchShopeeGetOrderWithDetailsList(url: string) {
  try {
    const res = await fetch(url, { method: "GET", headers: { "Conten-Type": "application/json" } })
    const response: IResShopeeAPI<{ order_list: IResShopee_GetOrderWithDetailsList_Struct[] }> = await res.json()
    // console.log(`[FetchShopeeGetOrderWithDetailsList]- ${JSON.stringify(response)}\n`)
    return response
  } catch (err) {
    console.log(`[GET]: FetchShopeeGetOrderWithDetailsList ${err}\n`)
    return null
  }
}

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

  // const query = req.nextUrl.searchParams
  const orderListInBody: ShopeeOrderRequestBody = await req.json().then((i) => i.order_list)
  console.log("body:", orderListInBody)

  if (orderListInBody === null) return NextResponse.json({ message: "Bad Request in params" }, { status: 400 })

  // find in open api
  const baseAPI = process.env.SHOPEE_BASE_API ?? "https://partner.shopeemobile.com"
  const pathAPI = "/api/v2/order/get_order_detail"
  const partnerID = process.env.SHOPEE_PARTNER_ID ?? "2003362"
  const secretKey = process.env.SHOPEE_SECRET_KEY ?? "fdcdd1bfe5f7a28d3ed7d3702b75ff1e69a5cc91f38cc6cdd5ea8170b2f04891"
  const timestamp = Math.floor(new Date().getTime() / 1000)



  const resOrderWithDetailsList: Record<string, { count: number, data: IResShopee_GetOrderWithDetailsList_Struct[] }> = {}

  const promiseOrder = Object.entries(orderListInBody).flatMap(([state, orders]) =>
    orders.map(async (shop) => {

      resOrderWithDetailsList[state] ??= { count: 0, data: [] }
      const url = new URL(baseAPI)
      url.pathname = pathAPI
      url.searchParams.append("partner_id", partnerID)
      url.searchParams.append("timestamp", timestamp.toString())
      // loop getDetails
      url.searchParams.append("shop_id", shop.shop_id)
      url.searchParams.append("access_token", shop.access_token)
      // generate sign
      const baseSign = `${partnerID}${pathAPI}${timestamp}${shop.access_token}${shop.shop_id}`
      console.log(`[baseSign]-FetchShopeeGetOrderWithDetailsList : ${JSON.stringify(baseSign) + "+" + shop.order_sn_list.length + "+" + state} \n`)

      const sign = crypto.createHmac("sha256", secretKey).update(baseSign).digest("hex")
      url.searchParams.append("sign", sign)
      // parse body to json

      const opts: string[] = [
        "shipping_carrier",
        "total_amount",
        "payment_method",
        "item_list",
        "pickup_done_time",
      ]

      url.searchParams.append("response_optional_fields", opts.join(","))

      // let resStore: IResShopee_GetOrderWithDetailsList_Struct[] | null = []
      const bathSize = 50;
      const orderSNList = shop.order_sn_list

      const tasks = []
      for (let i = 0; i < orderSNList.length; i += bathSize) {
        // resStore ??= []
        const bath = orderSNList.slice(i, i + bathSize)
        url.searchParams.set("order_sn_list", bath.join(","))
        // const res = await FetchShopeeGetOrderWithDetailsList(url.toString())
        // if (res && res?.error != "") { console.log(`[Error]-[POST]-FetchShopeeGetOrderWithDetailsList : ${res?.message}`) }

        tasks.push(FetchShopeeGetOrderWithDetailsList(url.toString()))

        // refac
        // if (res && res?.response.order_list.length > 0) {
        //   // resStore.push(...res.response.order_list)
        //   const newOrderList = res.response.order_list
        //     .map(i => ({ ...i, shop_id: shop.shop_id }))
        //     .filter(o => !resOrderWithDetailsList[state].data.some(ext => ext.order_sn === o.order_sn))

        //   resOrderWithDetailsList[state] = {
        //     count: resOrderWithDetailsList[state].count + newOrderList.length,
        //     data: [...resOrderWithDetailsList[state].data, ...newOrderList]
        //   }
        // }
      }

      const resTask = await Promise.allSettled(tasks)
      resTask.forEach((res, idx) => {
        if (res.status === "fulfilled"
          && res.value?.response
          && res.value?.response.order_list.length > 0) {
          const newOrderList = res.value.response.order_list
            .map(i => ({ ...i, shop_id: shop.shop_id }))
            .filter(o => !resOrderWithDetailsList[state].data.some(ext => ext.order_sn === o.order_sn))

          resOrderWithDetailsList[state] = {
            count: resOrderWithDetailsList[state].count + newOrderList.length,
            data: [...resOrderWithDetailsList[state].data, ...newOrderList]
          }
        } else {
          console.warn(`[fetch:ShopeeAPI]-OrderDetails :${idx} - ${JSON.stringify(res)}`)
        }
      })
    })
  )

  await Promise.allSettled(promiseOrder)

  // console.log(`ressss ------- ${JSON.stringify(resOrderWithDetailsList)}\n`)
  return ResponseHandle.success(resOrderWithDetailsList, "[GET]api/Shopee/Order/details", 200, 0, 0, {
    headers: { "Cache-Control": "private, max-age=3600, stale-while-validate=60" }
  })
}

export async function GET(req: NextRequest) {

  const query = req.nextUrl.searchParams

  const shopQuerry = query.get("shop_id") ?? ""
  const accessQuery = query.get("access_token") ?? ""

  // Example : xxxx,xxxx
  const orderListQuery = (query.get("order_list") ?? "").split(",")

  // find in open api
  const baseAPI = process.env.SHOPEE_BASE_API ?? "https://partner.shopeemobile.com"
  const pathAPI = "/api/v2/order/get_order_detail"
  const partnerID = process.env.SHOPEE_PARTNER_ID ?? "2003362"
  const secretKey = process.env.SHOPEE_SECRET_KEY ?? undefined
  const timestamp = Math.floor(new Date().getTime() / 1000)
  if (shopQuerry === "" || accessQuery === "" || secretKey === undefined) return ResponseHandle.error("[GET]-api/shopee/order/details", "Bad request", 400)

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
  url.searchParams.append("order_sn_list", orderListQuery.toString())


  console.log("url to ShopeeAPI: ", url.toString())


  try {
    const res = await fetch(url.toString(), {
      method: "GET", headers: { "Content-Type": "application/json" },
    })



    const data: IResShopeeAPI<{ order_list: IResShopee_GetOrderWithDetailsList_Struct[] }> = await res.json()
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

    const orderSNs = data.response.order_list.map(o => o.order_sn)
    const existOrders = await prisma.b2C_SalesOrderTable.findMany({
      where: { OrderId: { in: orderSNs } },
      select: { OrderId: true, OrderStatus: true }
    })

    const existSet = new Map(existOrders.map(o => [o.OrderId, { status: o.OrderStatus }]))
    data.response.order_list = data.response.order_list.map(o => ({
      ...o,
      b2cStatus: existSet.get(o.order_sn.toString())?.status
    }))

    // const init: ResponseInit = { }
    return ResponseHandle.success(data.response.order_list, "succes-shopee-shop", 200, 0, 0, {
      headers: {
        "Cache-Control": "private, max-age=3600, stale-while-validate=60"
      }
    })

  } catch {

    return ResponseHandle.error("error", "[GET]api/Shopee/Order", 400)
  }
}

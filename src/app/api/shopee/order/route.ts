import { NextRequest, NextResponse } from "next/server"
import { IResShopeeAPI, ResponseHandle } from "@/app/api/utility"
import crypto from "crypto"
import { PrismaClient } from "@prisma/client"

export interface IResShopee_GetShippingDoc_Struct {
  order_sn: string
  status: "READY" | "FAILED" | "PROCESSING",
  onServer?: boolean
}

export interface IResShopee_GetShippingDoc {
  result_list: IResShopee_GetShippingDoc_Struct[]
}

const prisma = new PrismaClient()

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

// import { NextRequest, NextResponse } from "next/server"
// import crypto from "crypto"
// import { ResponseHandle } from "@/app/api/utility"

// export async function GET(req: NextRequest, { params }: { params: Promise<{ orderID: string }> }) {

//   const query = req.nextUrl.searchParams
//   const { orderID } = await params
//   if (orderID === "") {
//     return NextResponse.json(
//       { message: "Bad Request in params" },
//       { status: 400 }
//     )
//   }

//   const shopQuerry = query.get("shop_id") ?? ""
//   const accessQuery = query.get("access_token") ?? ""

//   // find in open api
//   const baseAPI = process.env.SHOPEE_BASE_API ?? "https://partner.shopeemobile.com"
//   const pathAPI = "/api/v2/logistics/download_shipping_document"
//   const partnerID = process.env.SHOPEE_PARTNER_ID ?? "2003362"
//   const secretKey = process.env.SHOPEE_SECRET_KEY ?? undefined
//   const timestamp = Math.floor(new Date().getTime() / 1000)

//   if (shopQuerry === "" || accessQuery === "" || secretKey === undefined) return ResponseHandle.error("[GET]-api/shopee/order", "Bad request", 400)

//   const url = new URL(baseAPI)
//   url.pathname = pathAPI
//   url.searchParams.append("partner_id", partnerID)
//   url.searchParams.append("timestamp", timestamp.toString())
//   url.searchParams.append("shop_id", shopQuerry)
//   url.searchParams.append("access_token", accessQuery)

//   // generate sign
//   const baseSign = `${partnerID}${pathAPI}${timestamp}${accessQuery}${shopQuerry}`
//   const sign = crypto.createHmac("sha256", secretKey).update(baseSign).digest("hex")
//   url.searchParams.append("sign", sign)

//   // get shopee open API
//   console.log("url to ShopeeAPI: ", url.toString())

//   try {
//     const res = await fetch(url.toString(), {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         order_list: [
//           { order_sn: orderID }
//         ]
//       })
//     })

//     if (!res.ok) {
//       return ResponseHandle.error("[GET]api/Shopee/Order-awb", "response cant fetch", 400)
//     }

//     const data: ArrayBuffer = await res.arrayBuffer()

//     return new NextResponse(Buffer.from(data), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename=SHOPEE_AWB_-${orderID}.pdf`
//       },
//     })

//     // return ResponseHandle.success(data, "succes-shopee-shop-order-awb", 200)

//   } catch {
//     return ResponseHandle.error("error", "[GET]api/Shopee/Order-awb", 400)
//   }

// }

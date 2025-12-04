import { EnumTiktokOrderStatus, ResponseHandle } from "@/app/api/utility"
import prisma from "@/lib/prisma/client";
import { TikTokShopNodeApiClient } from "@/lib/sdk/tiktok";
import { AxiosError } from "axios";
import crypto from "crypto";
import { NextRequest } from "next/server";



export interface IResTiktokOrderInformationAWB {
  order_id: string
  order_type: string | undefined
  payment_method: string | undefined
  tracking_number: string | undefined
  shipping_provider: string | undefined
  status: EnumTiktokOrderStatus
  shipping_duetime: Date | undefined
  packages: (string | undefined)[] | undefined
  created_time: Date | undefined
  updated_time: Date | undefined
  cancel_reason: string | undefined
  canceled_time: Date | undefined
  on_server: boolean
  on_b2c: boolean
}



function GenerateSignTiktok(url: URL, appSecret: string, body?: unknown) {
  const sorted = Array.from(url.searchParams.entries()).sort(([a], [b]) => a.localeCompare(b));
  let signString = url.pathname + sorted.map(([k, v]) => `${k}${v}`).join("");

  if (body && Object.keys(body).length > 0) {
    signString += JSON.stringify(body);
  }

  signString = `${appSecret}${signString}${appSecret}`;
  return crypto.createHmac("sha256", appSecret).update(signString).digest("hex");
}
type IReqTiktokAWBFromOrder = { shop_cipher: string | undefined, access_token: string | undefined, order_list: string[] | undefined }

export async function GET(req: NextRequest) {

  const query = req.nextUrl.searchParams
  const json: IReqTiktokAWBFromOrder = {
    order_list: query.get("order_list")?.split(","),
    shop_cipher: query.get("shop_cipher") ?? undefined,
    access_token: query.get("access_token") ?? undefined
  }

  if (!json.order_list || !json.access_token || !json.shop_cipher)
    return ResponseHandle.error("data required", "orderawb-tiktok-shop", 400)

  try {
    // 1. get order detail fot package_id
    const time = new Date()
    const urlTiktok = new URL("/order/202507/orders", "https://open-api.tiktokglobalshop.com")
    urlTiktok.searchParams.append("app_key", "6e8psek8amb3m")
    urlTiktok.searchParams.append("timestamp", Math.floor(time.getTime() / 1000).toString())
    urlTiktok.searchParams.append("ids", json.order_list.join(","))
    urlTiktok.searchParams.append("shop_cipher", json.shop_cipher)
    const sign = GenerateSignTiktok(urlTiktok, "f40cbbcdb704ac1fc6b1ca69fc3e19ebdbb7d9f8")
    urlTiktok.searchParams.append("sign", sign)
    console.log(urlTiktok.searchParams)
    const api = new TikTokShopNodeApiClient({ config: { app_key: "6e8psek8amb3m", app_secret: "f40cbbcdb704ac1fc6b1ca69fc3e19ebdbb7d9f8" } })
    const c = await api.api.OrderV202507Api.OrdersGet(json.order_list, json.shop_cipher, json.access_token, "application/json")
    // 2. get awb from package_id
    const resStore = c.body.data?.orders
    // console.log(`[Log] c : ${JSON.stringify(c.body)}\n`)
    if (resStore && resStore.length > 0) {
      const prom = resStore.map(async (i) => {
        const onServer = await prisma.b2C_OrderAWB.findFirst({ where: { OrderId: i.id }, orderBy: { CreationDate: "desc" }, select: { OrderId: true } })
        const onB2C = await prisma.b2C_SalesOrderTable.findFirst({ where: { OrderId: i.id }, orderBy: { CreationDate: "desc" }, select: { OrderId: true } })
        console.log(`[onB2C] : ${JSON.stringify(onB2C)}\n`)
        const res: IResTiktokOrderInformationAWB = {
          order_id: i.id ?? "",
          order_type: i.orderType,
          payment_method: i.paymentMethodName,
          tracking_number: i.trackingNumber,
          shipping_provider: i.shippingProvider,
          status:
            i.status
              && EnumTiktokOrderStatus[i.status as keyof typeof EnumTiktokOrderStatus]
              ? EnumTiktokOrderStatus[i.status as keyof typeof EnumTiktokOrderStatus]
              : EnumTiktokOrderStatus["UNKNOWN"],
          shipping_duetime: i.shippingDueTime ? new Date(i.shippingDueTime) : undefined,
          packages: i.packages && i.packages?.length > 0 ? i.packages?.map(c => c.id) : undefined,
          created_time: i.createTime ? new Date(i.createTime) : undefined,
          updated_time: i.updateTime ? new Date(i.updateTime) : undefined,
          cancel_reason: i.cancelReason,
          canceled_time: i.cancelTime ? new Date(i.cancelTime) : undefined,
          on_server: (onServer && onServer?.OrderId.length > 0) ?? false,
          on_b2c: (onB2C && onB2C?.OrderId.length > 0) ?? false,
        }
        return res
      })

      const orderStoreProm = await Promise.allSettled(prom)
      const orderStore = orderStoreProm ? orderStoreProm.filter(i => i.status === "fulfilled").map(i => i.value) : []
      return ResponseHandle.success(orderStore, "succes-tiktok-shop", 200)
    }
    return ResponseHandle.error("fetch failed", "succes-tiktok-shop")
  } catch (error) {
    const err = error as AxiosError;
    const errorMsg = {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data as string,
    };
    return ResponseHandle.error(errorMsg.data, "[GET]-Tiktok_Order", 400)
  }
}



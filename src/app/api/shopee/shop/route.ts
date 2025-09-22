import { PrismaClient } from "@prisma/client"
import { ResponseHandle } from "@/app/api/utility"

const prisma = new PrismaClient()

export interface IResShopeeShopList {
  ShopID: string
  ShopName: string
  Description: string
}

export async function GET() {
  // find in db
  // const filter = Prisma.Shopee_AccessToken_LogScalarFieldEnum
  const excludes = [
    "358708695",
    "652574555",
    "796958689",
    "980017606",
    "219173758",
    "139562069",
    "95456363",
    "95300527"
  ]
  const res = await prisma.shopee_ShopInfo.findMany()

  if (res.length > 0) {
    const parseRes: IResShopeeShopList[] = []
    for (const item of res) {
      const i: IResShopeeShopList = {
        ShopID: item.ShopId.toString(),
        ShopName: item.Shop_name,
        Description: item.Shop_description
      }

      if (!excludes.includes(i.ShopID))
        parseRes.push(i)
    }
    return ResponseHandle.success(parseRes, "succes-shopee-shop", 200)
  }
  return ResponseHandle.error("error-shopee-shop", "fetch incomplete", 400)
}

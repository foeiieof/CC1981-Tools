import { ResponseHandle } from "@/app/api/utility"
import prisma from "@/lib/prisma/client"


export interface IResTiktokShopList {
  ShopID: string
  ShopName: string
  IsActive: boolean
  CipherID: string
  AccessToken: string
  OpenID: string
}

export async function GET() {

  try {

    const res = await prisma.tiktok_ShopInfo.findMany()

    if (res.length > 0) {
      const shopList = await Promise.allSettled(res.map(async (item) => {
        const access = await prisma.tikTok_AccessToken.findFirst({ where: { SellerName: item.ShopName }, orderBy: { CreationDate: "desc" } })
        if (access === null) return ResponseHandle.error("error-tiktok-shop", "[GET]-Tiktok_ShopInfo not found", 200)
        return {
          ShopID: item.ShopId,
          ShopName: item.ShopName,
          IsActive: item.IsActive,
          CipherID: item.Cipher,
          AccessToken: access.AccessToken,
          OpenID: access.OpenId
        } as IResTiktokShopList
      }))

      const parseShop = shopList.map(i => {
        if (i.status === "fulfilled") return i.value
      })

      return ResponseHandle.success(parseShop, "succes-tiktok-shop", 200)
    }

  } catch {
    return ResponseHandle.error("error-tiktok-shop", "[GET]-Tiktok_ShopInfo", 400)
  }

}




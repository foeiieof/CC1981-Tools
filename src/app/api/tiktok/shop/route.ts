import { PrismaClient } from "@prisma/client"
import { ResponseHandle } from "@/app/api/utility"

const prisma = new PrismaClient()

export interface IResTiktokShopList {
  ShopID: string
  ShopName: string
  IsActive: boolean
  CipherID: string
}

export async function GET() {
  const res = await prisma.tiktok_ShopInfo.findMany()
  if (res.length > 0) {
    const resParse: IResTiktokShopList[] = []
    for (const item of res) {
      const i: IResTiktokShopList = {
        ShopID: item.ShopId,
        ShopName: item.ShopName,
        IsActive: item.IsActive,
        CipherID: item.Cipher
      }
      resParse.push(i)
    }

    return ResponseHandle.success(resParse, "succes-tiktok-shop", 200)
  }
  return ResponseHandle.error("error-tiktok-shop", "[GET]-Tiktok_ShopInfo", 200)
}




import { ResponseHandle } from "@/app/api/utility"
import prisma from "@/lib/prisma/client"


export interface IResShopeeShopList {
  ShopID: string
  ShopName: string
  Description: string
  AccessToken?: string
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


  try {
    const res = await prisma.shopee_ShopInfo.findMany()

    if (res.length > 0) {
      const parseRes: IResShopeeShopList[] = []

      const prom = Object.values(res).map(async (item) => {
        const access = await prisma.shopee_AccessToken.findFirst({ where: { ShopId: (item.ShopId).toString() }, orderBy: { CreationDate: "desc" } })
        // if(!access) 
        console.log(access)
        const i: IResShopeeShopList = {
          ShopID: item.ShopId.toString(),
          ShopName: item.Shop_name,
          Description: item.Shop_description,
          AccessToken: access?.AccessToken ?? "no-access"
        }

        if (!excludes.includes(i.ShopID))
          parseRes.push(i)
      })

      await Promise.allSettled(prom)
      return ResponseHandle.success(parseRes, "succes-shopee-shop", 200)
    }
  } catch (error) {

    return ResponseHandle.error(error as string, "fetch incomplete", 400)
  }
}

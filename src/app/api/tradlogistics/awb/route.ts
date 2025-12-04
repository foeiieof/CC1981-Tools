import { IResponse, ResponseHandle } from "@/app/api/utility"
import { NextRequest } from "next/server"


export async function GET(req: NextRequest) {
  // return ResponseHandle.error("data required", "orderawb-tiktok-shop", 400)
  try {
    // const awb = await prisma 

  } catch (error) {
    const err = error as IResponse<unknown>
    return ResponseHandle.error("[Tiktok] GetOrderAWB", err.message, 400)
  }
}

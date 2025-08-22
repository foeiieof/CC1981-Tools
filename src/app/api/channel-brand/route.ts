import { ResponseHandle } from "../utility";
import { PrismaClient } from "@prisma/client"

// import { NextRequest } from 'next/server'
// import { PrismaClient } from '@prisma/client'
// export async function GET() {
//   return ResponseHandle.success("data", "success-channelbrand", 200)
// } 

const prisma = new PrismaClient()

export async function GET() {
  try {
    const channels = await prisma.b2C_ChannelTable.findMany()
    // Bigint -> string
    const convChannels = channels.map((item) => ({
      ...item,
      Partition: item.Partition.toString(),
    }))

    const opts: ResponseInit = {
      status: (200),
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=60",
      },
    }
    return ResponseHandle.success(convChannels, "success-channelbrand", 200, undefined, undefined, opts)
  }
  catch (err) {
    return ResponseHandle.error("Cannot Get: Channel table", `${err}`)
    // return NextResponse.json({ success: false, error: `Cannot fetch : ${err}` })
  }
  finally {
    await prisma.$disconnect()
  }
  // return ResponseHandle.success("data", "success-channelbrand", 200)
}


import { NextRequest } from "next/server";
import { ResponseHandle } from "../utility";
import { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma/client"


export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams
  const channel = param.get("channel") ?? undefined

  try {
    const findConf: Prisma.B2C_ChannelProcessWhereInput = {}
    if (channel) findConf.ChannelId = Number(channel)

    const channelsProcess = await prisma.b2C_ChannelProcess.findMany({ where: findConf })
    // Bigint -> string
    const convChannels = channelsProcess.map((item) => ({
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
  }
  finally {
    await prisma.$disconnect()
  }
}


import { Prisma, PrismaClient } from "@prisma/client"
import { ResponseHandle } from "../utility"
import { NextRequest } from "next/server"
import { z } from "zod"
const prisma = new PrismaClient()


export async function GET(req: NextRequest) {
  try {

    // const schema = z.looseObject({
    //   WorkTimeStartTime: z.coerce.date(),
    //   WorkTimeEndTime: z.coerce.date(),
    // })

    console.log(req.url)

    const { searchParams } = new URL(req.url)
    const sizeParam = parseInt(searchParams.get("size") || "20")
    const pageParam = parseInt(searchParams.get("page") || "1")

    const channelParam = searchParams.get("channel")
    const brandParam = searchParams.get("brand")

    const dayTypeParams = searchParams.get("daytype")
    const remarkParams = searchParams.get("remark")
    const fromParams = searchParams.get("from")
    const toParams = searchParams.get("to")

    // console.log(dayTypeParams)

    const cmSearch: Prisma.B2C_ChannelProcessWorkingSetupWhereInput = {}
    if (channelParam != null && channelParam != "ALL")
      cmSearch.ChannelType = channelParam

    if (brandParam != null && brandParam != "ALL")
      cmSearch.Brand = brandParam

    if (dayTypeParams != null && dayTypeParams != "ALL")
      cmSearch.DayType = dayTypeParams

    if (remarkParams != null && remarkParams != "")
      cmSearch.Remark = { contains: remarkParams, }

    if (fromParams != null)
      cmSearch.StartDate = { gte: new Date(fromParams) }

    if (toParams != null && toParams != "")
      cmSearch.EndDate = { lte: new Date(toParams) }

    const skipSize = (pageParam - 1) * sizeParam

    // console.log(`param - prisma : ${JSON.stringify(cmSearch)}`)

    const res = await prisma.b2C_ChannelProcessWorkingSetup.findMany(
      {
        where: cmSearch,
        take: sizeParam, skip: skipSize, orderBy: { RecId: "desc" }
      }
    )

    const allRes = await prisma.b2C_ChannelProcessWorkingSetup.count({
      where: cmSearch
    })


    return ResponseHandle.success(res, "success-channel-process-working", 200, Math.ceil(allRes / sizeParam), pageParam)
  } catch (err) {
    return ResponseHandle.error("Cannot Get: Channel brand", `${err}`)
  }
}

// const ChannelSchema = z.object({
//   ChannelId: z.string(),
//   Brand: z.string().optional(),
//   WorkTimeStartTime: z.coerce.date().optional(),
//   WorkTimeEndTime: z.coerce.date().optional(),
//   Remark: z.string().optional()
// })

function toDateTime(time: string): Date {
  const [h, m, s] = time.split(":").map(Number);
  const d = new Date(Date.UTC(1970, 0, 1, h, m, s));
  return d;
}

function toDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number)
  const r = new Date(Date.UTC(y, m - 1, d, 0, 0))
  return r
}


const ChannelSchema = z.object({
  ChannelId: z.string().optional(),
  Brand: z.string().optional(),
  WorkDays: z.string().nonempty(),
  WorkTimeStartTime: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
    message: "Invalid time format, expected HH:mm:ss",
  }),
  WorkTimeEndTime: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
    message: "Invalid time format, expected HH:mm:ss",
  }),
  DayType: z.string().nonempty(),
  IsWorkOnHolidays: z.preprocess(
    (val) => (val === "true" || val === true),
    z.boolean()
  ),
  ChannelType: z.string().nonempty(),
  Remark: z.string().optional(),
  StartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date format, expected yyyy-MM-dd",
  }),
  EndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date format, expected yyyy-MM-dd",
  }),
  CreatedBy: z.string().nonempty(),
  ModifiedBy: z.string().nonempty(),
});


export async function POST(req: Request) {
  try {

    const body = await req.json()

    const json = ChannelSchema.parse(body)

    const workStart = toDateTime(json.WorkTimeStartTime + ":00")
    const workEnd = toDateTime(json.WorkTimeEndTime + ":00")
    const brandParse = json.Brand != "ALL" ? json.Brand : ""
    const channelTypeParse = json.ChannelType != "ALL" ? json.ChannelType : ""

    const jsonParse = {
      ...json,
      ChannelId: -1,

      Brand: brandParse,
      ChannelType: channelTypeParse,

      StartDate: toDate(json.StartDate),
      EndDate: toDate(json.EndDate),
      IsWorkOnHolidays: (json.IsWorkOnHolidays),
      WorkTimeStartTime: workStart,
      WorkTimeEndTime: workEnd,

      CreationDate: new Date(),
      ModifiedDate: new Date(),
    }

    // const res = await prisma.b2C_ChannelProcessWorkingSetup.create({ data: jsonParse })

    const res = jsonParse
    console.log("[Server] - POST:success-channel-process-working:", res)
    // const res = { status: "success-channel-table : post", data: body.Brand }

    if (!res) return ResponseHandle.error("Cannot Post: Chanenl brand", `...`)
    return ResponseHandle.success(res, "success", 201)
  }
  catch (err) {
    console.log("Cannot Post: Chanenl brand", `${err}`)
    return ResponseHandle.error("Cannot Post: Chanenl brand", `${err}`)
  }
}

export async function DELETE(req: Request) {
  try {
    const json = await req.json()

    const { id } = json

    const res = await prisma.b2C_ChannelProcessWorkingSetup.delete({ where: { RecId: id } })

    // const res = id
    // console.log("[Server] - POST:success-channel-process-working:", res)
    // const res = { status: "success-channel-table : post", data: body.Brand }

    if (!res) return ResponseHandle.error("Cannot Post: Chanenl brand", `...`)
    return ResponseHandle.success(res, "success", 200)
  }
  catch (err) {
    console.log("Cannot DELETE: Chanenl brand", `${err}`)
    return ResponseHandle.error("Cannot DELETE: Chanenl brand", `${err}`)
  }
}


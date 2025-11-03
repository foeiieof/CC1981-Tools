import { NextResponse } from "next/server";
import pino from "pino";
import type ResponseInit from "url"


export type IResponse<T> = {
  status: number
  data?: T;
  count_data?: number
  message: string;
  error?: string;
  total_page?: number;
  current_page?: number;
}

export interface IResShopeeAPI<T = unknown> {
  request_id: string
  error: string
  message: string
  response: T
}

export class ResponseHandle {
  static success<T>(data: T, message = "success", status?: number, total?: number, page?: number, opts?: ResponseInit, other?: object) {
    const res: IResponse<T> = {
      status: (status ?? 200),
      data,
      count_data: Array.isArray(data) ? data.length : undefined,
      message,
      total_page: total,
      current_page: page,
      ...other
    }

    // const optReq: ResponseInit = opts != null
    //   ? opts
    //   : {
    //     status: (status ?? 200),
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Cache-Control": "public, max-age=3600, s-maxage=1800, stale-while-revalidate=60",
    //     },
    //   }

    return NextResponse.json(res, {
      status: (status ?? 200),
      headers: opts?.headers ?? {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=1800, stale-while-revalidate=60",
      }
    })

    // return new Response(JSON.stringify(res), optReq)
  }

  static error<T>(detail: string, message: string, status?: number) {
    const res: IResponse<T> = {
      status: (status ?? 401),
      error: detail,
      message: message
    }
    return new Response(JSON.stringify(res),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
  }

}


export const Lgr = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  },
  level: "debug"
});


export enum EnumShopee_GetOrderList {
  UNPAID = "UNPAID",
  READY_TO_SHIP = "READY_TO_SHIP",
  PROCESSED = "PROCESSED",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  IN_CANCEL = "IN_CANCEL",
  CANCELLED = "CANCELLED"
}


export enum EnumTiktokOrderStatus {
  CANCELLED = "CANCELLED",
  UNPAID = "UNPAID",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  DELIVERED = "DELIVERED",
  PRE_ORDER = "PRE_ORDER",
  IN_TRANSIT = "IN_TRANSIT",
  AWAITING_COLLECTION = "AWAITING_COLLECTION",
  AWAITING_SHIPMENT = "AWAITING_SHIPMENT",
  PARTIALLY_SHIPPING = "PARTIALLY_SHIPPING",
  UNKNOWN = "UNKNOWN"
}

import { NextResponse } from "next/server";
import type ResponseInit from "url"

export type IResponse<T> = {
  status: number;
  data?: T;
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
  static success<T>(data: T, message = "success", status?: number, total?: number, page?: number, opts?: ResponseInit) {
    const res: IResponse<T> = {
      status: (status ?? 200),
      data,
      message,
      total_page: total,
      current_page: page
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

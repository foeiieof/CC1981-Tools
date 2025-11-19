import { B2C_SalesOrderTable } from "@prisma/client"

export type B2CSaleOrderWithBrand = B2C_SalesOrderTable & {
  Brand?: string,
  Platform?: string
}

export interface IReqOrderGroup {
  order_sn: string;
  order_groups: number;
  order_group_items: Record<string, number>
}

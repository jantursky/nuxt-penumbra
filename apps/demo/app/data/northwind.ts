export interface Kpi {
  label: string
  value: string
  delta: string
}

export interface RevenuePoint {
  label: string
  /** Thousands of dollars. */
  value: number
}

export interface Order {
  id: string
  customer: string
  status: 'Paid' | 'Shipped' | 'Pending'
  total: string
}

export const kpis: Kpi[] = [
  { label: 'Revenue', value: '$48,260', delta: '+12.4%' },
  { label: 'Orders', value: '1,284', delta: '+6.1%' },
  { label: 'Conversion', value: '3.8%', delta: '-0.4%' },
  { label: 'Average order', value: '$37.60', delta: '+2.2%' },
]

export const revenue: RevenuePoint[] = [
  { label: 'Dec', value: 31.2 },
  { label: 'Jan', value: 29.8 },
  { label: 'Feb', value: 33.5 },
  { label: 'Mar', value: 36.1 },
  { label: 'Apr', value: 35.4 },
  { label: 'May', value: 39 },
  { label: 'Jun', value: 41.7 },
  { label: 'Jul', value: 40.2 },
  { label: 'Aug', value: 43.8 },
  { label: 'Sep', value: 44.6 },
  { label: 'Oct', value: 43 },
  { label: 'Nov', value: 48.3 },
]

export const orders: Order[] = [
  { id: 'NW-4821', customer: 'Harbor & Pine Co.', status: 'Shipped', total: '$412.00' },
  { id: 'NW-4820', customer: 'Lantern Row Studio', status: 'Paid', total: '$96.50' },
  { id: 'NW-4819', customer: 'Alder Mills', status: 'Pending', total: '$1,280.00' },
  { id: 'NW-4818', customer: 'Quarry Lane Goods', status: 'Paid', total: '$248.75' },
  { id: 'NW-4817', customer: 'Tidewater Supply', status: 'Shipped', total: '$73.20' },
]

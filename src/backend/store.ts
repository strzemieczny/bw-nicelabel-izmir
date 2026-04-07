import Store from 'electron-store'

export interface PrinterConfig {
  type: 'IP'
  ip?: string
  port?: number
}

export const store = new Store<{
  printer: PrinterConfig
}>({
  defaults: {
    printer: {
      type: 'IP',
      ip: '',
      port: 9100
    }
  }
})

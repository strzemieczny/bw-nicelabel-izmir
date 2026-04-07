import { Socket } from 'net'
import { store } from './store'
import { ipcMain } from 'electron'

interface PrinterConfig {
  type: 'IP' | 'COM'
  ip?: string
  port?: number
  comPort?: string
}

export default async function IsOnline(): Promise<void> {
  ipcMain.handle('Get-PrinterStatus', async () => {
    try {
      const config = store.get('printer') as PrinterConfig

      if (!config || !config.type) {
        return { status: false, message: 'backend.printer.no_config' }
      }

      return new Promise((resolve) => {
        const socket = new Socket()

        socket.setTimeout(3000)

        socket.connect(config.port!, config.ip!, () => {
          socket.end()
          resolve({ status: true, message: 'backend.printer.connected_ip' })
        })

        socket.on('error', (err) => {
          socket.destroy()
          resolve({
            status: false,
            message: 'backend.printer.connection_error',
            rawError: err.message
          })
        })

        socket.on('timeout', () => {
          socket.destroy()
          resolve({
            status: false,
            message: 'backend.printer.timeout'
          })
        })
      })
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      return { status: false, message: errMsg }
    }
  })
}

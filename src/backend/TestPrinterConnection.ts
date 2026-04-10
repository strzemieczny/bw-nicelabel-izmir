import { app, ipcMain } from 'electron'
import { PrinterConfig, store } from './store'
import IpConnection from './PrinterConnections/IpConnection'
import path from 'node:path'
import { readFile } from 'node:fs/promises'

export default function TestPrinterConnection(): void {
  ipcMain.handle('test-printer-connection', async () => {
    const config: PrinterConfig = store.get('printer')
    let templatesPath: string

    if (app.isPackaged) {
      templatesPath = path.join(process.resourcesPath, 'zpl_templates')
    } else {
      templatesPath = path.join(app.getAppPath(), 'zpl_templates')
    }
    const fullPath = path.join(templatesPath, 'Test_Print_label.zpl')
    const template = await readFile(fullPath, 'utf-8')

    return await IpConnection(config, template)
  })
}

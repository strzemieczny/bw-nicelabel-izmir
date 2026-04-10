import GetJulianDate from './GetJulianDate'
import { fillZplTemplate } from './LabelProcessor'
import { app } from 'electron'
import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'

interface Part {
  Part_Number: string
  Serial_Prefix: string
  Label_Format: string
  Part_Description: string
}

interface GenerateZPLResult {
  status: boolean
  message: string
  data?: string
  rawError?: string
}

export async function getZplTemplate(formatName: string): Promise<GenerateZPLResult> {
  let templatesPath: string, rawTemplate: string
  try {
    if (app.isPackaged) {
      templatesPath = path.join(process.resourcesPath, 'zpl_templates')
    } else {
      templatesPath = path.join(app.getAppPath(), 'zpl_templates')
    }

    const fileName =
      formatName.toLowerCase().endsWith('.zpl') || formatName.toLowerCase().endsWith('.txt')
        ? formatName
        : `${formatName}.zpl`

    const fullPath = path.join(templatesPath, fileName)
    rawTemplate = await readFile(fullPath, 'utf-8')
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return {
      status: false,
      message: 'backend.print.template_not_found',
      rawError: `${formatName} (${errMsg})`
    }
  }
  return { status: true, message: 'OK', data: rawTemplate }
}

export async function SaveZplTemplate(
  formatName: string,
  data: string
): Promise<GenerateZPLResult> {
  let templatesPath: string
  try {
    if (app.isPackaged) {
      templatesPath = path.join(process.resourcesPath, 'zpl_templates')
    } else {
      templatesPath = path.join(app.getAppPath(), 'zpl_templates')
    }

    const fileName =
      formatName.toLowerCase().endsWith('.zpl') || formatName.toLowerCase().endsWith('.txt')
        ? formatName
        : `${formatName}.zpl`

    const fullPath = path.join(templatesPath, fileName)

    await writeFile(fullPath, data)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return {
      status: false,
      message: 'backend.print.template_not_found',
      rawError: `${formatName} (${errMsg})`
    }
  }
  return { status: true, message: 'OK' }
}

export async function generatePrintZPL(
  part: Part,
  quantity: number = 1
): Promise<GenerateZPLResult> {
  try {
    const templateResult = await getZplTemplate(part.Label_Format)
    if (!templateResult.status) {
      return templateResult
    }
    const rawTemplate = templateResult.data!
    let fullBatchZpl = ''

    for (let i = 0; i < quantity; i++) {
      const printData = {
        PARTNUM: part.Part_Number,
        JDATE: GetJulianDate(''),
        NUMCOPIES: 1
      }
      fullBatchZpl += fillZplTemplate(rawTemplate, printData)
    }

    return {
      status: true,
      message: 'backend.print.print_success',
      data: fullBatchZpl
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    if (errorMsg.startsWith('backend.')) {
      return { status: false, message: errorMsg }
    }
    return { status: false, message: 'backend.db.error', rawError: errorMsg }
  }
}

export async function generatePreviewZPL(part: Part): Promise<GenerateZPLResult> {
  try {
    const templateResult = await getZplTemplate(part.Label_Format)
    if (!templateResult.status) {
      return templateResult
    }
    const rawTemplate = templateResult.data!

    const printData = {
      PARTNUM: part.Part_Number,
      JDATE: GetJulianDate(''),
      NUMCOPIES: 1
    }

    return {
      status: true,
      message: 'backend.print.preview_success',
      data: fillZplTemplate(rawTemplate, printData)
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    if (errorMsg.startsWith('backend.')) {
      return { status: false, message: errorMsg }
    }
    return { status: false, message: 'backend.db.error', rawError: errorMsg }
  }
}

import { ChangeEvent, useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Part, PartOption, UiMessage } from '../types'
import { extractError } from '../utils/errorUtils'

interface UsePrintLabelStatus {
  isLoading: boolean
  isPrinting: boolean
  isPreviewLoading: boolean
  criticalError: string | null
  uiMessage: UiMessage | null
}

interface UsePrintLabelData {
  parts: Part[]
  selectedPart: Part | null
  labelQuantity: number | ''
  date: string
  serialNumber: string
  options: PartOption[]
  previewImage: string | null
}

interface UsePrintLabelActions {
  handleSelectChange: (option: PartOption | null) => Promise<void>
  handleQuantityChange: (e: ChangeEvent<HTMLInputElement>) => void
  handlePrint: (e: React.FormEvent) => Promise<void>
  clearUiMessage: () => void
  handleSerialNumberChange: (serialNumber: string) => void
  handleDateChange: (date: string) => void
}

interface UsePrintLabelReturn {
  data: UsePrintLabelData
  status: UsePrintLabelStatus
  actions: UsePrintLabelActions
  isValid: boolean
}

// --- CONFIGURATION: Add your manual parts here ---
const MANUAL_PARTS: Part[] = [
  {
    id: 1,
    Part_Number: '5 B3C 455',
    Description: 'NiceLabel for BMW (5 B3C 455)',
    Serial_Prefix: '5 B3C 455',
    Part_Description: 'BMW',
    Label_Format: 'BMW_nicelabel'
  },
  {
    id: 2,
    Part_Number: '5 A93 8F4',
    Description: 'NiceLabel for BMW (5 A93 8F4)',
    Serial_Prefix: '5 A93 8F4',
    Part_Description: 'BMW',
    Label_Format: 'BMW_nicelabel'
  },
  {
    id: 3,
    Part_Number: '5 A93 8F5',
    Description: 'NiceLabel for BMW (5 A93 8F5)',
    Serial_Prefix: '5 A93 8F5',
    Part_Description: 'BMW',
    Label_Format: 'BMW_nicelabel'
  },
  {
    id: 4,
    Part_Number: '5 A93 8F6',
    Description: 'NiceLabel for BMW (5 A93 8F6)',
    Serial_Prefix: '5 A93 8F6',
    Part_Description: 'BMW',
    Label_Format: 'BMW_nicelabel'
  }
]

export const usePrintLabel = (mode: string, parts: Part[] = []): UsePrintLabelReturn => {
  const { t } = useTranslation()

  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [labelQuantity, setLabelQuantity] = useState<number | ''>(1)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [date, setDate] = useState<string>('')
  const [serialNumber, setSerialNumber] = useState<string>('')

  const previewCache = useRef<Record<string, string>>({})

  const [status, setStatus] = useState<UsePrintLabelStatus>({
    isLoading: false,
    isPrinting: false,
    isPreviewLoading: false,
    criticalError: null,
    uiMessage: null
  })

  // Merge manual parts with incoming parts
  const allAvailableParts = useMemo(() => {
    const safeIncoming = Array.isArray(parts) ? parts : []
    return [...MANUAL_PARTS, ...safeIncoming]
  }, [parts])

  // Transform merged list into dropdown options
  const options: PartOption[] = useMemo(() => {
    return allAvailableParts.map((part) => ({
      value: part.id.toString(),
      label: `${part.Part_Number} - ${part.Description}`
    }))
  }, [allAvailableParts])

  async function generateLabelPreview(
    part: Part,
    targetDate: string,
    targetSerial: string
  ): Promise<void> {
    setStatus((prev) => ({ ...prev, isPreviewLoading: true }))
    try {
      // Use part.id + Serial_Prefix for a unique cache key
      const cacheKey = `${part.id}-${part.Serial_Prefix}`

      if (previewCache.current[cacheKey] && mode !== 'reprint') {
        setPreviewImage(previewCache.current[cacheKey])
        return
      }
      const response = await window.electron.ipcRenderer.invoke('get-label-preview', {
        part,
        date: targetDate,
        serialNumber: targetSerial
      })

      if (response.status && response.data) {
        if (mode !== 'reprint') previewCache.current[cacheKey] = response.data
        setPreviewImage(response.data)
      } else {
        setStatus((prev) => ({
          ...prev,
          uiMessage: {
            type: 'error',
            text: response.message ? t(response.message) : t('backend.print.generate_error'),
            details: t(response.rawError)
          }
        }))
      }
    } catch (err: unknown) {
      const { message, details } = extractError(err)
      setStatus((prev) => ({
        ...prev,
        uiMessage: { type: 'error', text: t(message), details: t(details ?? '') }
      }))
    } finally {
      setStatus((prev) => ({ ...prev, isPreviewLoading: false }))
    }
  }

  const handleSelectChange = async (option: PartOption | null): Promise<void> => {
    if (!option) {
      setSelectedPart(null)
      setPreviewImage(null)
      return
    }

    // Look for the part in our merged list
    const part = allAvailableParts.find((p) => p.id.toString() === option.value) || null
    setSelectedPart(part)

    if (part) {
      await generateLabelPreview(part, date, serialNumber)
    }
  }

  const handleDateChange = async (newDate: string): Promise<void> => {
    setDate(newDate)
    if (selectedPart) await generateLabelPreview(selectedPart, newDate, serialNumber)
  }

  const handleSerialNumberChange = async (newSerial: string): Promise<void> => {
    setSerialNumber(newSerial)
    if (selectedPart) await generateLabelPreview(selectedPart, date, newSerial)
  }

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value
    if (val === '') {
      setLabelQuantity('')
      return
    }
    const num = parseInt(val)
    if (!isNaN(num)) {
      setLabelQuantity(Math.min(100, Math.max(1, num)))
    }
  }

  const handlePrint = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setStatus((prev) => ({ ...prev, uiMessage: null }))

    const qty = typeof labelQuantity === 'number' ? labelQuantity : 1
    if (!selectedPart || qty < 1) return

    const now = new Date()
    const isMidnightBlock =
      (now.getHours() === 23 && now.getMinutes() >= 55) ||
      (now.getHours() === 0 && now.getMinutes() <= 5)

    if (isMidnightBlock) {
      setStatus((prev) => ({
        ...prev,
        uiMessage: { type: 'error', text: t('print_view.printing_blocked_midnight') }
      }))
      return
    }

    setStatus((prev) => ({ ...prev, isPrinting: true }))

    try {
      const payload =
        mode === 'reprint'
          ? { part: selectedPart, quantity: qty, date, serialNumber }
          : { part: selectedPart, quantity: qty }

      const channel = mode === 'reprint' ? 'reprint-label' : 'print-label'
      const response = await window.electron.ipcRenderer.invoke(channel, payload)

      if (!response || response.status === false) {
        setStatus((prev) => ({
          ...prev,
          uiMessage: {
            type: 'error',
            text: response?.message ? t(response.message) : t('backend.print.error'),
            details: t(response?.rawError)
          }
        }))
        return
      }

      setStatus((prev) => ({
        ...prev,
        uiMessage: { type: 'success', text: t('print_view.print_success') }
      }))
    } catch (err: unknown) {
      const { message, details } = extractError(err)
      setStatus((prev) => ({
        ...prev,
        uiMessage: { type: 'error', text: t(message), details: t(details ?? '') }
      }))
    } finally {
      setStatus((prev) => ({ ...prev, isPrinting: false }))
    }
  }

  const clearUiMessage = () => setStatus((prev) => ({ ...prev, uiMessage: null }))

  const isValid =
    selectedPart !== null &&
    typeof labelQuantity === 'number' &&
    labelQuantity >= 1 &&
    (mode !== 'reprint' || (date.trim() !== '' && serialNumber.trim() !== ''))

  return {
    data: {
      parts: allAvailableParts, // Return the merged list
      selectedPart,
      labelQuantity,
      options,
      previewImage,
      date,
      serialNumber
    },
    status,
    actions: {
      handleSelectChange,
      handleSerialNumberChange,
      handleDateChange,
      handleQuantityChange,
      handlePrint,
      clearUiMessage
    },
    isValid
  }
}

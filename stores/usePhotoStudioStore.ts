import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import svgTemplatesData from '../db/svg-templates.json'
import sampleImagesData from '../db/sample-images.json'
import pdfTemplatesData from '../db/pdf-templates.json'
import photobook8PagesData from '../db/photobook-8-pages.json'

export interface PhotoAsset {
  id: string
  name: string
  url: string
  aspectRatio: 'landscape' | 'portrait' | 'square'
  category?: string
  isUsed?: boolean
}

export interface SvgSlot {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  shape?: string
  borderRadius?: number
  aspectRatio?: string
  label?: string
}

export interface SvgTemplate {
  id: string
  name: string
  description?: string
  type: string
  width: number
  height: number
  background: string
  headerTitle: string
  slots: SvgSlot[]
}

export type PaperSizeFormat = 'a4-portrait' | 'a4-landscape' | 'square' | 'a5-portrait' | 'a5-landscape' | 'custom'

export interface PaperSizePreset {
  id: PaperSizeFormat
  name: string
  width: number
  height: number
  description: string
}

export const PAPER_SIZE_PRESETS: PaperSizePreset[] = [
  { id: 'a4-portrait', name: 'A4 Dọc (Chuẩn)', width: 800, height: 1130, description: '800 × 1130 px (Khổ chuẩn in ấn)' },
  { id: 'a4-landscape', name: 'A4 Ngang', width: 1130, height: 800, description: '1130 × 800 px (Toàn cảnh)' },
  { id: 'square', name: 'Album Vuông', width: 900, height: 900, description: '900 × 900 px (Photobook 1:1)' },
  { id: 'a5-portrait', name: 'A5 Dọc', width: 600, height: 850, description: '600 × 850 px (Nhỏ gọn)' },
  { id: 'a5-landscape', name: 'A5 Ngang', width: 850, height: 600, description: '850 × 600 px' },
  { id: 'custom', name: 'Tùy Chỉnh', width: 800, height: 1130, description: 'Tự nhập kích cỡ' }
]

export interface PdfSuggestedSlot {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
}

export interface PdfTemplate {
  id: string
  name: string
  description?: string
  type: string
  width: number
  height: number
  background: string
  documentTitle: string
  documentSubtitle: string
  watermark?: string
  suggestedSlots: PdfSuggestedSlot[]
}

export interface SlotTransform {
  imageId: string
  imageUrl: string
  zoom: number
  offsetX: number
  offsetY: number
  rotation: number
}

export interface PdfPlacement {
  id: string
  imageId: string
  imageUrl: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
}

export interface CanvasTextItem {
  id: string
  text: string
  x: number
  y: number
  width?: number
  fontSize: number
  color: string
  fontWeight: 'normal' | 'bold' | '600' | '700'
  fontStyle?: 'normal' | 'italic'
  textAlign?: 'left' | 'center' | 'right'
  zIndex: number
}

export interface PhotobookPage {
  id: string
  pageNumber: number
  title: string
  type: 'cover' | 'inner' | 'back'
  headerTitle: string
  background: string
  backgroundImage?: string // When imported from PDF
  slots: SvgSlot[]
  assignments?: Record<string, SlotTransform>
  texts: CanvasTextItem[]
  pdfPlacements?: PdfPlacement[]
}

// Fallback safe objects
const defaultSvgTemplate: SvgTemplate = (svgTemplatesData as SvgTemplate[])[0] ?? {
  id: 'svg-4-grid',
  name: 'Bố cục 4 Ảnh - Lưới Hiện Đại',
  type: 'svg',
  width: 800,
  height: 1130,
  background: '#f8fafc',
  headerTitle: 'PHOTO COLLECTION 2026',
  slots: []
}

const defaultPdfTemplate: PdfTemplate = (pdfTemplatesData as PdfTemplate[])[0] ?? {
  id: 'pdf-doc-1',
  name: 'Tài Liệu Báo Cáo Khổ A4 (PDF)',
  type: 'pdf',
  width: 800,
  height: 1130,
  background: '#ffffff',
  documentTitle: 'BÁO CÁO KHẢO SÁT & HÌNH ẢNH HIỆN TRƯỜNG',
  documentSubtitle: 'Dự án: Đô Thị Xanh 2026',
  suggestedSlots: []
}

export const usePhotoStudioStore = defineStore('photoStudio', () => {
  // Modes: 'svg' (Auto-Fill), 'pdf' (Manual PDF), 'builder' (Canva Designer), 'photobook' (Multi-page 8 Pages)
  const activeMode = ref<'svg' | 'pdf' | 'builder' | 'photobook'>('photobook')
  
  // 3D Flipbook Viewer State
  const is3DPreviewMode = ref<boolean>(false)
  const isPdfImportModalOpen = ref<boolean>(false)

  // Multi-Page Photobook System (8 Pages)
  const pages = ref<PhotobookPage[]>(
    (photobook8PagesData as PhotobookPage[]).map(p => ({
      ...p,
      assignments: {},
      pdfPlacements: []
    }))
  )
  const activePageIndex = ref<number>(0)

  // Templates Data
  const svgTemplates = ref<SvgTemplate[]>(svgTemplatesData as SvgTemplate[])
  const selectedSvgTemplateId = ref<string>(defaultSvgTemplate.id)
  
  const pdfTemplates = ref<PdfTemplate[]>(pdfTemplatesData as PdfTemplate[])
  const selectedPdfTemplateId = ref<string>(defaultPdfTemplate.id)

  const sampleImages = ref<PhotoAsset[]>(sampleImagesData as PhotoAsset[])
  const userImages = ref<PhotoAsset[]>([])

  // Assignments for current active template in SVG Mode
  const svgSlotAssignments = ref<Record<string, SlotTransform>>({})

  // Placements for PDF Mode
  const pdfPlacements = ref<PdfPlacement[]>([])
  const selectedPdfPlacementId = ref<string | null>(null)

  // Text Elements for single SVG/PDF mode
  const canvasTextItems = ref<CanvasTextItem[]>([
    {
      id: 'text-demo-1',
      text: 'Ghi chú: Khảo sát hiện trường tháng 08/2026',
      x: 60,
      y: 445,
      fontSize: 13,
      color: '#0f172a',
      fontWeight: '600',
      zIndex: 50
    }
  ])
  const selectedTextItemId = ref<string | null>(null)

  // Builder Mode State (Canva Designer)
  const builderTitle = ref<string>('BỐ CỤC TÙY CHỈNH MỚI')
  const builderBackground = ref<string>('#ffffff')
  const builderSlots = ref<SvgSlot[]>([
    {
      id: 'slot-b-1',
      name: 'Khung Ảnh 01',
      x: 40,
      y: 100,
      width: 345,
      height: 450,
      borderRadius: 16,
      label: 'Ảnh 01'
    },
    {
      id: 'slot-b-2',
      name: 'Khung Ảnh 02',
      x: 415,
      y: 100,
      width: 345,
      height: 450,
      borderRadius: 16,
      label: 'Ảnh 02'
    },
    {
      id: 'slot-b-3',
      name: 'Khung Ảnh 03 (Ngang)',
      x: 40,
      y: 580,
      width: 720,
      height: 450,
      borderRadius: 16,
      label: 'Ảnh 03'
    }
  ])
  const selectedBuilderSlotId = ref<string | null>(null)

  // Canvas Dimensions & Paper Size Settings
  const paperFormat = ref<PaperSizeFormat>('a4-portrait')
  const canvasWidth = ref<number>(800)
  const canvasHeight = ref<number>(1130)

  function setPaperSize(format: PaperSizeFormat, customW?: number, customH?: number) {
    paperFormat.value = format
    if (format === 'custom') {
      if (customW) canvasWidth.value = Math.max(400, Math.min(1800, customW))
      if (customH) canvasHeight.value = Math.max(400, Math.min(1800, customH))
    } else {
      const preset = PAPER_SIZE_PRESETS.find(p => p.id === format)
      if (preset) {
        canvasWidth.value = preset.width
        canvasHeight.value = preset.height
      }
    }
  }

  function updateCanvasDimensions(w: number, h: number) {
    paperFormat.value = 'custom'
    canvasWidth.value = Math.max(400, Math.min(1800, Math.round(w)))
    canvasHeight.value = Math.max(400, Math.min(1800, Math.round(h)))
  }

  // Computed Getters
  const currentPage = computed<PhotobookPage>(() => {
    return pages.value[activePageIndex.value] ?? pages.value[0]
  })

  const totalPages = computed(() => pages.value.length)

  const currentSvgTemplate = computed<SvgTemplate>(() => {
    if (activeMode.value === 'photobook') {
      const p = currentPage.value
      return {
        id: p.id,
        name: p.title,
        type: 'svg',
        width: canvasWidth.value,
        height: canvasHeight.value,
        background: p.background,
        headerTitle: p.headerTitle,
        slots: p.slots
      }
    }
    const tpl = svgTemplates.value.find(t => t.id === selectedSvgTemplateId.value) ?? defaultSvgTemplate
    return {
      ...tpl,
      width: canvasWidth.value,
      height: canvasHeight.value
    }
  })

  const currentPdfTemplate = computed<PdfTemplate>(() => {
    return pdfTemplates.value.find(t => t.id === selectedPdfTemplateId.value) ?? defaultPdfTemplate
  })

  const allAvailableImages = computed(() => {
    return [...userImages.value, ...sampleImages.value]
  })

  const filledSvgSlotCount = computed(() => {
    if (activeMode.value === 'photobook') {
      return Object.keys(currentPage.value.assignments || {}).length
    }
    return Object.keys(svgSlotAssignments.value).length
  })

  // Multi-Page Actions
  function setPageIndex(index: number) {
    if (index >= 0 && index < pages.value.length) {
      activePageIndex.value = index
    }
  }

  function nextPage() {
    if (activePageIndex.value < pages.value.length - 1) {
      activePageIndex.value++
    }
  }

  function prevPage() {
    if (activePageIndex.value > 0) {
      activePageIndex.value--
    }
  }

  function toggle3DPreview() {
    is3DPreviewMode.value = !is3DPreviewMode.value
  }

  function addNewPage() {
    const pageNum = pages.value.length + 1
    const newPage: PhotobookPage = {
      id: `page-${Date.now()}`,
      pageNumber: pageNum,
      title: `Trang ${pageNum} (Tùy Chỉnh)`,
      type: 'inner',
      headerTitle: `BỘ SƯU TẬP TRANG ${pageNum}`,
      background: '#ffffff',
      slots: [
        {
          id: `p${pageNum}-s1`,
          name: 'Ảnh Lớn',
          x: 50,
          y: 140,
          width: 700,
          height: 440,
          borderRadius: 14,
          label: 'ẢNH CHÍNH'
        },
        {
          id: `p${pageNum}-s2`,
          name: 'Ảnh Nhỏ 1',
          x: 50,
          y: 610,
          width: 335,
          height: 400,
          borderRadius: 12,
          label: 'ẢNH 1'
        },
        {
          id: `p${pageNum}-s3`,
          name: 'Ảnh Nhỏ 2',
          x: 415,
          y: 610,
          width: 335,
          height: 400,
          borderRadius: 12,
          label: 'ẢNH 2'
        }
      ],
      assignments: {},
      texts: []
    }
    pages.value.push(newPage)
    activePageIndex.value = pages.value.length - 1
  }

  function removePage(index: number) {
    if (pages.value.length <= 1) return
    pages.value.splice(index, 1)
    pages.value.forEach((p, idx) => {
      p.pageNumber = idx + 1
    })
    if (activePageIndex.value >= pages.value.length) {
      activePageIndex.value = pages.value.length - 1
    }
  }

  // Import PDF pages into Photobook
  function importPdfPages(extractedPageDataUrls: string[]) {
    if (!extractedPageDataUrls || extractedPageDataUrls.length === 0) return

    const newPages: PhotobookPage[] = extractedPageDataUrls.map((dataUrl, idx) => {
      const pageNum = idx + 1
      return {
        id: `pdf-page-${Date.now()}-${pageNum}`,
        pageNumber: pageNum,
        title: idx === 0 ? 'Bìa Trước (PDF Import)' : idx === extractedPageDataUrls.length - 1 ? 'Bìa Sau (PDF Import)' : `Trang PDF ${pageNum}`,
        type: idx === 0 ? 'cover' : idx === extractedPageDataUrls.length - 1 ? 'back' : 'inner',
        headerTitle: `TÀI LIỆU PDF • TRANG ${pageNum}`,
        background: '#ffffff',
        backgroundImage: dataUrl,
        slots: [
          {
            id: `pdf-slot-${pageNum}-1`,
            name: `Khung ảnh trang ${pageNum}`,
            x: 60,
            y: 120,
            width: 680,
            height: 880,
            borderRadius: 8,
            label: `TRANG ${pageNum}`
          }
        ],
        assignments: {},
        texts: []
      }
    })

    pages.value = newPages
    activePageIndex.value = 0
    activeMode.value = 'photobook'
    isPdfImportModalOpen.value = false
  }

  // Auto-fill all pages sequentially
  function autoFillAllPages() {
    const pool = allAvailableImages.value
    if (pool.length === 0) return

    let imageCounter = 0

    pages.value.forEach((page) => {
      if (!page.assignments) {
        page.assignments = {}
      }

      page.slots.forEach((slot) => {
        const img = pool[imageCounter % pool.length]
        if (img) {
          page.assignments![slot.id] = {
            imageId: img.id,
            imageUrl: img.url,
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            rotation: 0
          }
          imageCounter++
        }
      })
    })

    // Also update single mode assignments if on page
    if (currentPage.value.assignments) {
      svgSlotAssignments.value = { ...currentPage.value.assignments }
    }
  }

  // Navigation & Base Actions
  function setMode(mode: 'svg' | 'pdf' | 'builder' | 'photobook') {
    activeMode.value = mode
    is3DPreviewMode.value = false
  }

  function selectSvgTemplate(id: string) {
    selectedSvgTemplateId.value = id
    svgSlotAssignments.value = {}
  }

  function addUploadedFiles(files: FileList | File[]) {
    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file)
      const id = `user-img-${Date.now()}-${index}`
      userImages.value.unshift({
        id,
        name: file.name,
        url,
        aspectRatio: 'landscape',
        category: 'Ảnh tải lên'
      })
    })
  }

  function autoFillSvg() {
    if (activeMode.value === 'photobook') {
      const p = currentPage.value
      const pool = allAvailableImages.value
      if (pool.length === 0) return

      const newAssignments: Record<string, SlotTransform> = {}
      p.slots.forEach((slot, index) => {
        const img = pool[(activePageIndex.value * 3 + index) % pool.length]
        if (img) {
          newAssignments[slot.id] = {
            imageId: img.id,
            imageUrl: img.url,
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            rotation: 0
          }
        }
      })
      p.assignments = newAssignments
      svgSlotAssignments.value = newAssignments
      return
    }

    const template = currentSvgTemplate.value
    if (!template) return
    const pool = allAvailableImages.value
    if (pool.length === 0) return

    const newAssignments: Record<string, SlotTransform> = {}
    template.slots.forEach((slot, index) => {
      const img = pool[index % pool.length]
      if (img) {
        newAssignments[slot.id] = {
          imageId: img.id,
          imageUrl: img.url,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
          rotation: 0
        }
      }
    })
    svgSlotAssignments.value = newAssignments
  }

  function shuffleSvg() {
    if (activeMode.value === 'photobook') {
      const p = currentPage.value
      const currentImages = Object.values(p.assignments || {})
      if (currentImages.length < 2) {
        autoFillSvg()
        return
      }
      const shuffled = [...currentImages].sort(() => Math.random() - 0.5)
      const newAssignments: Record<string, SlotTransform> = {}
      p.slots.forEach((slot, idx) => {
        if (shuffled[idx]) {
          newAssignments[slot.id] = { ...shuffled[idx] }
        }
      })
      p.assignments = newAssignments
      svgSlotAssignments.value = newAssignments
      return
    }

    const template = currentSvgTemplate.value
    if (!template) return
    const currentImages = Object.values(svgSlotAssignments.value)
    if (currentImages.length < 2) {
      autoFillSvg()
      return
    }
    const shuffled = [...currentImages].sort(() => Math.random() - 0.5)
    const newAssignments: Record<string, SlotTransform> = {}
    template.slots.forEach((slot, idx) => {
      if (shuffled[idx]) {
        newAssignments[slot.id] = { ...shuffled[idx] }
      }
    })
    svgSlotAssignments.value = newAssignments
  }

  function assignImageToSlot(slotId: string, image: PhotoAsset) {
    const transform: SlotTransform = {
      imageId: image.id,
      imageUrl: image.url,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0
    }
    if (activeMode.value === 'photobook') {
      if (!currentPage.value.assignments) {
        currentPage.value.assignments = {}
      }
      currentPage.value.assignments[slotId] = transform
    }
    svgSlotAssignments.value[slotId] = transform
  }

  function swapSlots(slotIdA: string, slotIdB: string) {
    const targetObj = activeMode.value === 'photobook' ? (currentPage.value.assignments || {}) : svgSlotAssignments.value
    const itemA = targetObj[slotIdA]
    const itemB = targetObj[slotIdB]

    if (itemA && itemB) {
      targetObj[slotIdA] = itemB
      targetObj[slotIdB] = itemA
    } else if (itemA && !itemB) {
      targetObj[slotIdB] = itemA
      delete targetObj[slotIdA]
    } else if (!itemA && itemB) {
      targetObj[slotIdA] = itemB
      delete targetObj[slotIdB]
    }

    if (activeMode.value === 'photobook') {
      currentPage.value.assignments = { ...targetObj }
    }
    svgSlotAssignments.value = { ...targetObj }
  }

  function removeSlotImage(slotId: string) {
    if (activeMode.value === 'photobook' && currentPage.value.assignments) {
      delete currentPage.value.assignments[slotId]
    }
    delete svgSlotAssignments.value[slotId]
  }

  function clearSvgAssignments() {
    if (activeMode.value === 'photobook') {
      currentPage.value.assignments = {}
    }
    svgSlotAssignments.value = {}
  }

  // PDF Placement Actions
  function addPhotoToPdf(image: PhotoAsset, customX?: number, customY?: number) {
    const id = `pdf-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const width = 280
    const height = 210
    const x = customX ?? Math.max(60, Math.floor(Math.random() * 300) + 100)
    const y = customY ?? Math.max(180, Math.floor(Math.random() * 400) + 200)

    const newPlacement: PdfPlacement = {
      id,
      imageId: image.id,
      imageUrl: image.url,
      x,
      y,
      width,
      height,
      rotation: 0,
      zIndex: pdfPlacements.value.length + 1
    }

    pdfPlacements.value.push(newPlacement)
    selectedPdfPlacementId.value = id
  }

  function autoFillPdfGuides() {
    const guides = currentPdfTemplate.value.suggestedSlots
    const pool = allAvailableImages.value
    if (!guides || pool.length === 0) return

    pdfPlacements.value = []
    guides.forEach((guide: any, index: number) => {
      const img = pool[index % pool.length]
      if (img) {
        pdfPlacements.value.push({
          id: `pdf-item-guide-${guide.id}`,
          imageId: img.id,
          imageUrl: img.url,
          x: guide.x,
          y: guide.y,
          width: guide.width,
          height: guide.height,
          rotation: 0,
          zIndex: index + 1
        })
      }
    })
  }

  function updatePdfPlacement(id: string, updates: Partial<PdfPlacement>) {
    const item = pdfPlacements.value.find(p => p.id === id)
    if (item) {
      Object.assign(item, updates)
    }
  }

  function removePdfPlacement(id: string) {
    pdfPlacements.value = pdfPlacements.value.filter(p => p.id !== id)
    if (selectedPdfPlacementId.value === id) {
      selectedPdfPlacementId.value = null
    }
  }

  function clearPdfPlacements() {
    pdfPlacements.value = []
    selectedPdfPlacementId.value = null
  }

  // Builder Mode Actions
  function addNewBuilderSlot() {
    const count = builderSlots.value.length + 1
    const newSlot: SvgSlot = {
      id: `slot-b-${Date.now()}`,
      name: `Khung Ảnh 0${count}`,
      x: 100 + (count % 3) * 40,
      y: 200 + (count % 3) * 40,
      width: 320,
      height: 240,
      borderRadius: 14,
      label: `0${count}`
    }
    builderSlots.value.push(newSlot)
    selectedBuilderSlotId.value = newSlot.id
  }

  function updateBuilderSlot(id: string, updates: Partial<SvgSlot>) {
    const slot = builderSlots.value.find(s => s.id === id)
    if (slot) {
      Object.assign(slot, updates)
    }
  }

  function removeBuilderSlot(id: string) {
    builderSlots.value = builderSlots.value.filter(s => s.id !== id)
    if (selectedBuilderSlotId.value === id) {
      selectedBuilderSlotId.value = null
    }
  }

  function saveCustomTemplate(customName?: string): string {
    const name = customName || builderTitle.value || `Template Tự Thiết Kế #${svgTemplates.value.length + 1}`
    const newId = `custom-svg-${Date.now()}`

    const newTemplate: SvgTemplate = {
      id: newId,
      name,
      description: `Mẫu tùy chỉnh ${builderSlots.value.length} khung ảnh được tạo bởi bạn`,
      type: 'svg',
      width: 800,
      height: 1130,
      background: builderBackground.value,
      headerTitle: builderTitle.value || 'CUSTOM TEMPLATE',
      slots: JSON.parse(JSON.stringify(builderSlots.value))
    }

    svgTemplates.value.push(newTemplate)
    selectedSvgTemplateId.value = newId
    activeMode.value = 'svg'
    svgSlotAssignments.value = {}

    return newId
  }

  function importTemplateJson(templateData: any): string {
    const template: SvgTemplate = {
      id: templateData.id || `imported-svg-${Date.now()}`,
      name: templateData.name || 'Template Import Tùy Chỉnh',
      description: templateData.description || 'Template được import từ file',
      type: 'svg',
      width: templateData.width || 800,
      height: templateData.height || 1130,
      background: templateData.background || '#ffffff',
      headerTitle: templateData.headerTitle || 'IMPORTED TEMPLATE',
      slots: Array.isArray(templateData.slots) ? templateData.slots : []
    }

    svgTemplates.value.push(template)
    selectedSvgTemplateId.value = template.id
    activeMode.value = 'svg'
    svgSlotAssignments.value = {}

    return template.id
  }

  // Text Actions
  function addCanvasText(defaultText?: string, x?: number, y?: number) {
    const id = `text-${Date.now()}`
    const newTextItem: CanvasTextItem = {
      id,
      text: defaultText || 'Nhấp đúp để chỉnh sửa văn bản...',
      x: x ?? 100,
      y: y ?? 520,
      width: 450,
      fontSize: 15,
      color: '#0f172a',
      fontWeight: '600',
      fontStyle: 'normal',
      textAlign: 'left',
      zIndex: 50
    }
    if (activeMode.value === 'photobook') {
      if (!currentPage.value.texts) {
        currentPage.value.texts = []
      }
      currentPage.value.texts.push(newTextItem)
    } else {
      canvasTextItems.value.push(newTextItem)
    }
    selectedTextItemId.value = id
  }

  function updateCanvasText(id: string, updates: Partial<CanvasTextItem>) {
    const list = activeMode.value === 'photobook' ? (currentPage.value.texts || []) : canvasTextItems.value
    const item = list.find(t => t.id === id)
    if (item) {
      Object.assign(item, updates)
    }
  }

  function removeCanvasText(id: string) {
    if (activeMode.value === 'photobook') {
      if (currentPage.value.texts) {
        currentPage.value.texts = currentPage.value.texts.filter(t => t.id !== id)
      }
    } else {
      canvasTextItems.value = canvasTextItems.value.filter(t => t.id !== id)
    }
    if (selectedTextItemId.value === id) {
      selectedTextItemId.value = null
    }
  }

  function clearCanvasTexts() {
    if (activeMode.value === 'photobook') {
      currentPage.value.texts = []
    } else {
      canvasTextItems.value = []
    }
    selectedTextItemId.value = null
  }

  // Background Color Management
  const activeCanvasBackground = computed<string>(() => {
    if (activeMode.value === 'photobook') {
      return currentPage.value.background || '#ffffff'
    } else if (activeMode.value === 'svg') {
      return currentSvgTemplate.value.background || '#f8fafc'
    } else if (activeMode.value === 'pdf') {
      return currentPdfTemplate.value.background || '#ffffff'
    } else {
      return builderBackground.value || '#ffffff'
    }
  })

  function setCanvasBackground(color: string, applyToAllPages: boolean = false) {
    if (activeMode.value === 'photobook') {
      if (applyToAllPages) {
        pages.value.forEach(p => {
          p.background = color
        })
      } else {
        currentPage.value.background = color
      }
    } else if (activeMode.value === 'svg') {
      const tpl = svgTemplates.value.find(t => t.id === selectedSvgTemplateId.value)
      if (tpl) tpl.background = color
    } else if (activeMode.value === 'pdf') {
      const tpl = pdfTemplates.value.find(t => t.id === selectedPdfTemplateId.value)
      if (tpl) tpl.background = color
    } else {
      builderBackground.value = color
    }
  }

  return {
    activeMode,
    setMode,
    is3DPreviewMode,
    toggle3DPreview,
    isPdfImportModalOpen,
    // Background Color
    activeCanvasBackground,
    setCanvasBackground,
    // Multi-Page
    pages,
    activePageIndex,
    currentPage,
    totalPages,
    setPageIndex,
    nextPage,
    prevPage,
    addNewPage,
    removePage,
    autoFillAllPages,
    importPdfPages,
    // Templates
    svgTemplates,
    selectedSvgTemplateId,
    currentSvgTemplate,
    selectSvgTemplate,
    pdfTemplates,
    selectedPdfTemplateId,
    currentPdfTemplate,
    sampleImages,
    userImages,
    allAvailableImages,
    svgSlotAssignments,
    filledSvgSlotCount,
    addUploadedFiles,
    autoFillSvg,
    shuffleSvg,
    assignImageToSlot,
    swapSlots,
    removeSlotImage,
    clearSvgAssignments,
    pdfPlacements,
    selectedPdfPlacementId,
    addPhotoToPdf,
    autoFillPdfGuides,
    updatePdfPlacement,
    removePdfPlacement,
    clearPdfPlacements,
    // Canvas Dimensions & Paper Formats
    paperFormat,
    canvasWidth,
    canvasHeight,
    setPaperSize,
    updateCanvasDimensions,
    // Builder
    builderTitle,
    builderBackground,
    builderSlots,
    selectedBuilderSlotId,
    addNewBuilderSlot,
    updateBuilderSlot,
    removeBuilderSlot,
    saveCustomTemplate,
    importTemplateJson,
    // Text Elements
    canvasTextItems,
    selectedTextItemId,
    addCanvasText,
    updateCanvasText,
    removeCanvasText,
    clearCanvasTexts
  }
})


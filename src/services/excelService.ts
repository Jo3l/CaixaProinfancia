import * as XLSX from 'xlsx'
import type { Actividad, ExcelData } from '../types'

export function parseExcelFile(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const result = extractData(workbook)
        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Error leyendo el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

export function parseExcelFromUrl(url: string): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const data = new Uint8Array(buffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const result = extractData(workbook)
        resolve(result)
      })
      .catch(reject)
  })
}

function extractData(workbook: XLSX.WorkBook): ExcelData {
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rawData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

  // Find the header row (contains "Competencia trabajada")
  let headerRowIndex = -1
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i]
    if (row && row[0] && String(row[0]).includes('Competencia')) {
      headerRowIndex = i
      break
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('No se encontró la fila de encabezados en el Excel')
  }

  const actividades: Actividad[] = []
  const competenciasSet = new Set<string>()
  const edadesSet = new Set<string>()
  const entidadesSet = new Set<string>()

  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || !row[0]) continue

    const competencia = String(row[0] || '').trim()
    const edades = String(row[1] || '').trim()
    const nombre = String(row[2] || '').trim()
    const objetivos = String(row[3] || '').trim()
    const descripcion = String(row[4] || '').trim()
    const materiales = String(row[5] || '').trim()
    const enlace = String(row[6] || '').trim()
    const entidad = String(row[7] || '').trim()
    const notas = String(row[8] || '').trim()
    const fechaRaw = row[9]
    const fecha = fechaRaw != null ? Number(fechaRaw) || null : null

    if (!competencia && !nombre) continue

    actividades.push({
      competencia,
      edades,
      nombre,
      objetivos,
      descripcion,
      materiales,
      enlace,
      entidad,
      notas,
      fecha,
    })

    if (competencia) competenciasSet.add(competencia)
    if (edades) edadesSet.add(edades)
    if (entidad) entidadesSet.add(entidad)
  }

  return {
    actividades,
    competencias: [...competenciasSet].sort(),
    edades: [...edadesSet].sort(),
    entidades: [...entidadesSet].sort(),
  }
}

export function filterActividades(
  actividades: Actividad[],
  filters: { competencias: string[]; edades: string[]; entidades: string[]; searchText: string }
): Actividad[] {
  return actividades.filter((a) => {
    // Filter by competencia
    if (filters.competencias.length > 0 && !filters.competencias.includes(a.competencia)) {
      return false
    }

    // Filter by edades
    if (filters.edades.length > 0 && !filters.edades.includes(a.edades)) {
      return false
    }

    // Filter by entidad
    if (filters.entidades.length > 0 && !filters.entidades.includes(a.entidad)) {
      return false
    }

    // Filter by search text
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase()
      const searchable = [
        a.nombre,
        a.competencia,
        a.edades,
        a.entidad,
        a.objetivos,
        a.descripcion,
        a.materiales,
        a.notas,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!searchable.includes(search)) {
        return false
      }
    }

    return true
  })
}

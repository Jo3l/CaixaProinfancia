export interface Actividad {
  competencia: string
  edades: string
  nombre: string
  objetivos: string
  descripcion: string
  materiales: string
  enlace: string
  entidad: string
  notas: string
  fecha: number | null
}

export interface FiltersState {
  competencias: string[]
  edades: string[]
  entidades: string[]
  searchText: string
}

export interface ExcelData {
  actividades: Actividad[]
  competencias: string[]
  edades: string[]
  entidades: string[]
}

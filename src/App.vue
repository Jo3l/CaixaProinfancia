<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import type { FiltersState, Actividad } from './types'
import { parseExcelFile, parseExcelFromUrl, filterActividades } from './services/excelService'
import FileUploader from './components/FileUploader.vue'
import FilterBar from './components/FilterBar.vue'
import ResultsTable from './components/ResultsTable.vue'

const toast = useToast()

// Drag-and-drop overlay
const dragging = ref(false)
let dragCounter = 0

function onDragEnter(e: DragEvent) {
  if (!e.dataTransfer?.types.includes('Files')) return
  dragCounter++
  if (dragCounter === 1) dragging.value = true
}

function onDragLeave() {
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    dragging.value = false
  }
}

function onDragOver(e: DragEvent) {
  if (!e.dataTransfer?.types.includes('Files')) return
  e.preventDefault()
}

function onGlobalDrop(e: DragEvent) {
  dragCounter = 0
  dragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) {
    onFileSelected(file)
  }
  e.preventDefault()
}

// Data state
const actividades = ref<Actividad[]>([])
const competencias = ref<string[]>([])
const edades = ref<string[]>([])
const entidades = ref<string[]>([])
const loading = ref(false)
const loaded = ref(false)
const autoLoading = ref(true) // trying to auto-load default file
const noDefaultFile = ref(false) // true if default file not found
const excelData = computed(() =>
  loaded.value
    ? {
        actividades: actividades.value,
        competencias: competencias.value,
        edades: edades.value,
        entidades: entidades.value,
      }
    : null
)

// Filter state
const filters = ref<FiltersState>({
  competencias: [],
  edades: [],
  entidades: [],
  searchText: '',
})

// Filtered results
const filteredActividades = computed(() => filterActividades(actividades.value, filters.value))

const EXCEL_FILENAME = 'Repositorio%20actividades%20Competencias.xlsx'

// On mount, try to auto-load the default Excel file
onMounted(async () => {
  // Global drag-and-drop listeners for the overlay
  document.addEventListener('dragenter', onDragEnter)
  document.addEventListener('dragleave', onDragLeave)
  document.addEventListener('dragover', onDragOver)
  document.addEventListener('drop', onGlobalDrop)

  const DEFAULT_FILE = `${import.meta.env.BASE_URL}${EXCEL_FILENAME}`
  try {
    const data = await parseExcelFromUrl(DEFAULT_FILE)
    applyData(data)
    toast.add({
      severity: 'success',
      summary: 'Datos cargados',
      detail: `${data.actividades.length} actividades cargadas`,
      life: 3000,
    })
  } catch {
    noDefaultFile.value = true
  } finally {
    autoLoading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('dragenter', onDragEnter)
  document.removeEventListener('dragleave', onDragLeave)
  document.removeEventListener('dragover', onDragOver)
  document.removeEventListener('drop', onGlobalDrop)
})

// Handle file upload via drag & drop
async function onFileSelected(file: File) {
  loading.value = true
  try {
    const data = await parseExcelFile(file)
    applyData(data)
    toast.add({
      severity: 'success',
      summary: 'Archivo cargado',
      detail: `${data.actividades.length} actividades cargadas desde "${file.name}"`,
      life: 3000,
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error al leer el archivo',
      detail: 'Asegúrate de que sea un archivo Excel válido (.xlsx)',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

function applyData(data: {
  actividades: Actividad[]
  competencias: string[]
  edades: string[]
  entidades: string[]
}) {
  actividades.value = data.actividades
  competencias.value = data.competencias
  edades.value = data.edades
  entidades.value = data.entidades
  loaded.value = true
}

function clearFilters() {
  filters.value = {
    competencias: [],
    edades: [],
    entidades: [],
    searchText: '',
  }
}
</script>

<template>
  <Toast />

  <!-- Global drag-and-drop overlay -->
  <Transition name="fade">
    <div v-if="dragging" class="drag-overlay">
      <div class="drag-overlay-content">
        <i class="pi pi-file-excel" style="font-size: 4rem; color: #2d8a4e"></i>
        <p class="drag-overlay-title">Suelta tu archivo Excel aquí</p>
        <p class="drag-overlay-hint">Formatos: .xlsx, .xls</p>
      </div>
    </div>
  </Transition>

  <header class="app-header">
    <div class="header-content">
      <div class="header-brand">
        <img src="/assets/img/caixabank-logo-1.svg" alt="CaixaBank" class="header-logo" />
        <div class="header-text">
          <h1 class="header-title">CaixaProinfancia Madrid</h1>
          <p class="header-subtitle">Repositorio colaborativo de actividades formativas</p>
        </div>
      </div>
    </div>
  </header>

  <main class="app-main">
    <div class="container">
      <!-- File Upload Section (only shown if no default Excel file found) -->
      <FileUploader
        v-if="noDefaultFile && !loaded"
        :loading="loading"
        @file-selected="onFileSelected"
      />

      <!-- Loading state while checking for default file -->
      <div v-if="autoLoading" class="loading-default">
        <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem"></i>
        <p>Buscando archivo de datos...</p>
      </div>

      <!-- Filters -->
      <FilterBar
        :filters="filters"
        :data="excelData"
        @update:filters="(val) => (filters = val)"
        @clear="clearFilters"
      />

      <!-- Results -->
      <ResultsTable :actividades="filteredActividades" :loading="loading" />
    </div>
  </main>

  <footer class="app-footer">
    <div class="container footer-content">
      <p>CaixaProinfancia Madrid &copy; 2025</p>
      <p class="footer-credits">
        Desarrollado con Vue 3 + PrimeVue | Datos del repositorio colaborativo
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #003d7a 0%, #0059b3 50%, #0073e6 100%);
  color: white;
  padding: 1.5rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
  width: 100%;
}

.header-logo {
  height: 40px;
  filter: brightness(0) invert(1);
}

.header-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.header-subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.9rem;
  opacity: 0.85;
  font-weight: 400;
}

.app-main {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
  background: #f0f2f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.loading-default {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6c757d;
  gap: 0.75rem;
}

.loading-default p {
  margin: 0;
  font-size: 1rem;
}

.app-footer {
  background: #1a1a2e;
  color: rgba(255, 255, 255, 0.7);
  padding: 1.5rem 0;
  text-align: center;
  font-size: 0.85rem;
}

.footer-content p {
  margin: 0.25rem 0;
}

.footer-credits {
  opacity: 0.6;
  font-size: 0.8rem;
}

@media (max-width: 600px) {
  .header-brand {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .header-title {
    font-size: 1.2rem;
  }
}

/* Drag-and-drop overlay */
.drag-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 61, 122, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem;
  background: white;
  border-radius: 20px;
  border: 3px dashed #2d8a4e;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.drag-overlay-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #212529;
}

.drag-overlay-hint {
  margin: 0;
  font-size: 0.9rem;
  color: #868e96;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

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

// Modal state
const showCaixaModal = ref(false)

function openCaixaModal() {
  showCaixaModal.value = true
}

function closeCaixaModal() {
  showCaixaModal.value = false
}

// Modal state — Modelo de Éxito Educativo
const showModeloModal = ref(false)

function openModeloModal() {
  showModeloModal.value = true
}

function closeModeloModal() {
  showModeloModal.value = false
}

// Modal state — Cuadro de competencias del modelo
const showCompetenciasModal = ref(false)

function openCompetenciasModal() {
  showCompetenciasModal.value = true
}

function closeCompetenciasModal() {
  showCompetenciasModal.value = false
}

// Modal state — CaixaProinfancia en Madrid
const showCaixaMadridModal = ref(false)

function openCaixaMadridModal() {
  showCaixaMadridModal.value = true
}

function closeCaixaMadridModal() {
  showCaixaMadridModal.value = false
}

// Data state
const actividades = ref<Actividad[]>([])
const competencias = ref<string[]>([])
const edades = ref<string[]>([])
const objetivos = ref<string[]>([])
const loading = ref(false)
const loaded = ref(false)
const searched = ref(false)
const autoLoading = ref(true) // trying to auto-load default file
const noDefaultFile = ref(false) // true if default file not found
const excelData = computed(() =>
  loaded.value
    ? {
        actividades: actividades.value,
        competencias: competencias.value,
        edades: edades.value,
        objetivos: objetivos.value,
      }
    : null
)

// Filter state
const filters = ref<FiltersState>({
  competencias: [],
  edades: [],
  searchText: '',
})

// Filtered results
const filteredActividades = computed(() =>
  searched.value ? filterActividades(actividades.value, filters.value) : []
)

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
      detail: 'Asegúrate de que sea un archivo Excel v\u00e1lido (.xlsx)',
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
  objetivos: string[]
}) {
  actividades.value = data.actividades
  competencias.value = data.competencias
  edades.value = data.edades
  objetivos.value = data.objetivos
  loaded.value = true
}

function clearFilters() {
  filters.value = {
    competencias: [],
    edades: [],
    searchText: '',
  }
  searched.value = false
}
</script>

<template>
  <Toast />

  <!-- Global drag-and-drop overlay -->
  <Transition name="fade">
    <div v-if="dragging" class="drag-overlay">
      <div class="drag-overlay-content">
        <i class="pi pi-file-excel" style="font-size: 4rem; color: #2d8a4e"></i>
        <p class="drag-overlay-title">Suelta tu archivo Excel aqu\u00ed</p>
        <p class="drag-overlay-hint">Formatos: .xlsx, .xls</p>
      </div>
    </div>
  </Transition>

  <header class="app-header">
    <div class="header-content">
      <div class="header-brand">
        <img src="/assets/img/logo-la-caixa_w.png" alt="CaixaBank" class="header-logo" />
        <div class="header-text">
          <h1 class="header-title">Modero de éxito educativo de CaixaProinfancia en Madrid</h1>
          <p class="header-subtitle">RECURSOS PARA LA MEJORA DE LAS COMPETENCIAS</p>
        </div>
        <img src="/assets/img/Logo_CaixaProinfancia-w.png" alt="CaixaBank" class="header-logo" />
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

      <!-- Nav buttons -->
      <div class="nav-buttons">
        <button class="nav-btn" @click="openCaixaModal">CaixaProinfancia</button>
        <button class="nav-btn" @click="openModeloModal">Modelo de Éxito Educativo</button>
        <button class="nav-btn" @click="openCompetenciasModal">
          Cuadro de competencias del modelo
        </button>
        <button class="nav-btn" @click="openCaixaMadridModal">CaixaProinfancia en Madrid</button>
      </div>

      <!-- CaixaProinfancia modal -->
      <Transition name="modal-fade">
        <div v-if="showCaixaModal" class="modal-overlay" @click.self="closeCaixaModal">
          <div class="modal-card">
            <button class="modal-close" aria-label="Cerrar" @click="closeCaixaModal">
              &times;
            </button>
            <div class="modal-body">
              <p class="modal-text">
                En CaixaProinfancia trabajamos para ofrecer una vida mejor a niños, niñas y
                adolescentes que viven en entornos desfavorecidos, a través de un modelo de acción
                social y educativa que ayuda a impulsar su integración social, y la de sus familias,
                con el objetivo de:
              </p>
              <ul class="modal-list">
                <li>
                  Favorecer el desarrollo de las competencias de los niños, niñas y adolescentes y
                  sus familias que permitan mejorar sus procesos de integración social y autonomía.
                </li>
                <li>
                  Promover el desarrollo social y educativo de la infancia y adolescencia en su
                  contexto familiar, escolar y social.
                </li>
                <li>
                  Desarrollar e implementar un modelo de acción social y educativa integral que
                  contribuya a mejorar las oportunidades de desarrollo social y educativo de la
                  infancia y sus familias.
                </li>
                <li>
                  Contribuir a sensibilizar y movilizar a la sociedad en la erradicación de la
                  pobreza infantil.
                </li>
              </ul>
              <a
                href="https://fundacionlacaixa.org/es/pobreza-infantil"
                target="_blank"
                rel="noopener noreferrer"
                class="modal-link-btn"
              >
                Más información
              </a>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modelo de Éxito Educativo modal -->
      <Transition name="modal-fade">
        <div v-if="showModeloModal" class="modal-overlay" @click.self="closeModeloModal">
          <div class="modal-card">
            <button class="modal-close" aria-label="Cerrar" @click="closeModeloModal">
              &times;
            </button>
            <div class="modal-body">
              <p class="modal-text">
                Hace algún tiempo... varios compañeros y compañeras de los diferentes territorios
                que trabajamos en el universo CPI, formamos un grupo de trabajo sobre éxito
                educativo, junto a las asesoras de la Universidad de Comillas y el coordinador de
                Ciudad. Nuestra misión es promover el logro educativo de los niños, niñas y
                adolescentes con los que intervenimos desde una mirada nueva común.
              </p>
              <p class="modal-text">
                Para ello, hemos reflexionado sobre nuestras funciones como profesionales, la
                intervención que hacemos, hemos revisado autores y modelos, y hemos elaborado una
                propuesta de trabajo a través de competencias. Nuestro objetivo es trabajar de
                manera transversal desde distintos subprogramas las competencias.
              </p>
              <p class="modal-text modal-text-caption">(¿Presentación de las jornadas?)</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Cuadro de competencias modal -->
      <Transition name="modal-fade">
        <div
          v-if="showCompetenciasModal"
          class="modal-overlay"
          @click.self="closeCompetenciasModal"
        >
          <div class="modal-card">
            <button class="modal-close" aria-label="Cerrar" @click="closeCompetenciasModal">
              &times;
            </button>
            <div class="modal-body">
              <div class="ctable-wrapper">
                <table class="ctable">
                  <thead>
                    <tr>
                      <th>Competencia</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="ctable-section">
                      <td colspan="2">DESARROLLO PERSONAL</td>
                    </tr>
                    <tr>
                      <td>Autoconciencia</td>
                      <td>
                        Conciencia y conocimiento de uno mismo, de sus fortalezas y limitaciones
                      </td>
                    </tr>
                    <tr>
                      <td>Resiliencia</td>
                      <td>Capacidad de enfrentarse a las dificultades y salir fortalecido</td>
                    </tr>
                    <tr>
                      <td>Autoestima</td>
                      <td>Valoración positiva de uno mismo</td>
                    </tr>
                    <tr>
                      <td>Autoeficacia</td>
                      <td>Confianza en las propias capacidades para alcanzar una meta</td>
                    </tr>
                    <tr>
                      <td>Autocontrol</td>
                      <td>
                        Capacidad para regular la conducta o los propios impulsos de una forma
                        voluntaria
                      </td>
                    </tr>
                    <tr>
                      <td>Autonomía personal</td>
                      <td>Capacidad para decidir y actuar por una misma</td>
                    </tr>
                    <tr>
                      <td>Sentido de Pertenencia</td>
                      <td>
                        Identificación y vinculación con el grupo, sintiéndose parte del mismo.
                      </td>
                    </tr>
                    <tr>
                      <td>Iniciativa Personal</td>
                      <td>
                        Emprendimiento, capacidad para inventar, crear, poner en marcha cosas.
                      </td>
                    </tr>
                    <tr>
                      <td>Autocuidado</td>
                      <td>
                        Conjunto de acciones que emprende una persona en beneficio de su salud y
                        bienestar
                      </td>
                    </tr>

                    <tr class="ctable-section">
                      <td colspan="2">EMOCIONAL</td>
                    </tr>
                    <tr>
                      <td>Empatía</td>
                      <td>
                        Conciencia de las emociones, experiencias y valores de otra persona.<br />
                        Reconocimiento y gestión de las emociones de los demás<br />
                        Conciencia y gestión de las emociones de las otras personas
                      </td>
                    </tr>
                    <tr>
                      <td>Conocimiento y gestión de las propias emociones</td>
                      <td>
                        Conocimiento de nuestras emociones, análisis y modificación de nuestras
                        reacciones emocionales
                      </td>
                    </tr>
                    <tr>
                      <td>Tolerancia a la frustración</td>
                      <td>
                        Capacidad de afrontar y gestionar de manera adecuada la imposibilidad de
                        satisfacer deseos o necesidades.
                      </td>
                    </tr>
                    <tr>
                      <td>Optimismo y sentido del humor</td>
                      <td>Visión positiva de la vida</td>
                    </tr>

                    <tr class="ctable-section">
                      <td colspan="2">COGNITIVA</td>
                    </tr>
                    <tr>
                      <td>Capacidad de análisis crítico</td>
                      <td>
                        Evaluación de información y argumentos para respaldar conclusiones razonadas
                      </td>
                    </tr>
                    <tr>
                      <td>Capacidad de pensamiento analítico</td>
                      <td>
                        Comparar, analizar, evaluar y sintetizar datos e informaciones para sacar
                        conclusiones lógicas
                      </td>
                    </tr>
                    <tr>
                      <td>Creatividad/Curiosidad</td>
                      <td>
                        Capacidad e interés por conocer, adoptar y desarrollar ideas y soluciones
                        innovadoras para adaptarse a contextos cambiantes y resolver problemas.
                      </td>
                    </tr>
                    <tr>
                      <td>Capacidad de planificación y revisión, organización y seguimiento</td>
                      <td>
                        Capacidad para identificar, establecer y llevar a cabo las acciones
                        necesarias para alcanzar sus metas, evaluando los resultados de forma
                        sistemática.
                      </td>
                    </tr>
                    <tr>
                      <td>Capacidad para tomar decisiones</td>
                      <td>
                        Capacidad para seleccionar una opción entre varias posibles, ponderando los
                        aspectos positivos y negativos de cada una de ellas, para determinar cuál es
                        la mejor en una situación concreta y hacerse responsable de las
                        consecuencias.
                      </td>
                    </tr>
                    <tr>
                      <td>Mentalidad de crecimiento</td>
                      <td>
                        Creencia en el potencial propio y de los demás para aprender y progresar
                        continuamente
                      </td>
                    </tr>
                    <tr>
                      <td>Conocimiento de las áreas curriculares</td>
                      <td>
                        Dominio de los contenidos académicos que corresponden a su nivel curricular
                      </td>
                    </tr>

                    <tr class="ctable-section">
                      <td colspan="2">SOCIAL</td>
                    </tr>
                    <tr>
                      <td>Asertividad</td>
                      <td>
                        Capacidad para expresar de forma adecuada opiniones y sentimientos, tanto
                        positivos como negativos, sin hostilidad ni agresividad
                      </td>
                    </tr>
                    <tr>
                      <td>Habilidades relacionales</td>
                      <td>
                        Capacidad para establecer y mantener relaciones positivas y saludables con
                        otras personas.
                      </td>
                    </tr>
                    <tr>
                      <td>Habilidades para la resolución de conflictos interpersonales</td>
                      <td>
                        Capacidad para seleccionar y desarrollar estrategias adecuadas en
                        situaciones de conflicto con otras personas.
                      </td>
                    </tr>
                    <tr>
                      <td>Habilidades comunicativas</td>
                      <td>
                        Capacidad para desarrollar un proceso de comunicación satisfactorio
                        atendiendo tanto al contenido expresado como a las emociones e intenciones.
                      </td>
                    </tr>

                    <tr class="ctable-section">
                      <td colspan="2">COLABORACI&Oacute;N Y COMPROMISO</td>
                    </tr>
                    <tr>
                      <td>Compromiso social</td>
                      <td>
                        Responsabilidad social de la persona hacia su comunidad, que se expresa en
                        una búsqueda voluntaria del bienestar general por encima del particular.
                      </td>
                    </tr>
                    <tr>
                      <td>Responsabilidad</td>
                      <td>
                        Capacidad para reconocer y aceptar las consecuencias de un hecho realizado
                        libremente.
                      </td>
                    </tr>
                    <tr>
                      <td>Prosocialidad</td>
                      <td>
                        Capacidad para desarrollar acciones que favorecen a las personas y la
                        comunidad contribuyendo a su bienestar.
                      </td>
                    </tr>
                    <tr>
                      <td>Justicia (social)</td>
                      <td>
                        Búsqueda de un reparto equitativo de los bienes sociales, asegurando la
                        dignidad de las personas, la equidad, los derechos humanos y la cohesión
                        social.
                      </td>
                    </tr>
                    <tr>
                      <td>Igualdad (género, social…)</td>
                      <td>
                        Respeto y reconocimiento de los derechos de las personas sin discriminación
                        por género, raza o condición social.
                      </td>
                    </tr>
                    <tr>
                      <td>Respeto a la diversidad.</td>
                      <td>
                        Tolerancia y comprensión de derechos y libertades de todas las personas, sin
                        importar las diferencias y con aceptación mutua.
                      </td>
                    </tr>
                    <tr>
                      <td>Respeto al medio ambiente</td>
                      <td>
                        Cuidado ético, responsable y sostenible del medio ambiente para disminuir
                        los efectos negativos de la actividad humana.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- CaixaProinfancia en Madrid modal -->
      <Transition name="modal-fade">
        <div v-if="showCaixaMadridModal" class="modal-overlay" @click.self="closeCaixaMadridModal">
          <div class="modal-card">
            <button class="modal-close" aria-label="Cerrar" @click="closeCaixaMadridModal">
              &times;
            </button>
            <div class="modal-body">
              <p class="modal-text">
                Presentación de las redes, volúmenes, etc. (ver presentaciones)
                <br />
                <a
                  href="https://www.google.com/maps/d/edit?mid=1qoR9qVPUu6gn-FK7jRcJE8ebI8Y&amp;usp=usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="modal-link-btn"
                >
                  Mapa
                </a>
              </p>
              <div class="ctable-wrapper">
                <table class="ctable ctable--entities">
                  <thead>
                    <tr>
                      <th style="width: 45%">Entidad</th>
                      <th style="width: 55%">Web / Enlace</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="entidad-cell">Acais Comunidad y desarrollo, S.Coop.Madrid</td>
                      <td class="web-cell">
                        <a href="https://acais.net" target="_blank" rel="noopener noreferrer"
                          >acais.net</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Achalay España</td>
                      <td class="web-cell">
                        <a href="https://www.achalay.es" target="_blank" rel="noopener noreferrer"
                          >www.achalay.es</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Alucinos La Salle</td>
                      <td class="web-cell">
                        <a href="https://www.alucinos.net" target="_blank" rel="noopener noreferrer"
                          >www.alucinos.net</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Barró</td>
                      <td class="web-cell">
                        <a
                          href="https://www.asociacionbarro.org.es"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.asociacionbarro.org.es</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Creando Huellas</td>
                      <td class="web-cell">
                        <a
                          href="https://creandohuellas.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >creandohuellas.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Cultural La Kalle</td>
                      <td class="web-cell">
                        <a href="https://www.lakalle.org" target="_blank" rel="noopener noreferrer"
                          >www.lakalle.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación de Solidaridad con Madres Solteras</td>
                      <td class="web-cell">
                        <a
                          href="https://madresolteras.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >madresolteras.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación El Fanal</td>
                      <td class="web-cell">
                        <a
                          href="https://asociacionelfanal.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >asociacionelfanal.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Juvenil Citycentro</td>
                      <td class="web-cell">
                        <a
                          href="https://www.citycentro.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.citycentro.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Krecer</td>
                      <td class="web-cell">
                        <a href="https://krecer.org" target="_blank" rel="noopener noreferrer"
                          >krecer.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Nazaret</td>
                      <td class="web-cell">
                        <a
                          href="https://www.nazaretasociacion.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.nazaretasociacion.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">
                        Asociación para la Promoción del Plan Comunitario de Carabanchel Alto
                      </td>
                      <td class="web-cell">
                        <a
                          href="https://www.plancomunitariocarabanchel.net/es"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.plancomunitariocarabanchel.net/es</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Primera Prevención</td>
                      <td class="web-cell">
                        <a
                          href="https://primeraprevencion.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >primeraprevencion.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Cultural San Pablo</td>
                      <td class="web-cell">
                        <a
                          href="https://www.asociacionsanpablo.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.asociacionsanpablo.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Valdeperales</td>
                      <td class="web-cell">
                        <a
                          href="https://www.valdeperales.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.valdeperales.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Valponasca</td>
                      <td class="web-cell">
                        <a href="https://valponasca.org" target="_blank" rel="noopener noreferrer"
                          >valponasca.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Asociación Yuna</td>
                      <td class="web-cell">
                        <a
                          href="https://asociacionyuna.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          >asociacionyuna.com</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Cáritas Diocesana de Madrid</td>
                      <td class="web-cell">
                        <a
                          href="https://caritasmadrid.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >caritasmadrid.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">
                        Coordinadora Infantil y Juvenil de Tiempo Libre de Vallecas
                      </td>
                      <td class="web-cell">
                        <a
                          href="https://www.coordinadora.org.es"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.coordinadora.org.es</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Educación, Cultura y Solidaridad</td>
                      <td class="web-cell">
                        <a href="https://eculturas.org" target="_blank" rel="noopener noreferrer"
                          >eculturas.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Federación de Plataformas Sociales Pinardi</td>
                      <td class="web-cell">
                        <a href="https://www.pinardi.com" target="_blank" rel="noopener noreferrer"
                          >www.pinardi.com</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Fundación Amigó</td>
                      <td class="web-cell">
                        <a
                          href="https://fundacionamigo.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >fundacionamigo.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Fundación Amoverse</td>
                      <td class="web-cell">
                        <a
                          href="https://fundacionamoverse.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >fundacionamoverse.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Fundación José María de Llanos</td>
                      <td class="web-cell">
                        <a
                          href="https://www.fundacionjosemariadellanos.es"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.fundacionjosemariadellanos.es</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Fundación Naif</td>
                      <td class="web-cell">
                        <a
                          href="https://fundacionnaif.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >fundacionnaif.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Fundación Aspacia</td>
                      <td class="web-cell">
                        <a
                          href="https://fundacion-aspacia.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >fundacion-aspacia.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Fundación Secretariado Gitano</td>
                      <td class="web-cell">
                        <a href="https://www.gitanos.org" target="_blank" rel="noopener noreferrer"
                          >www.gitanos.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Fundación Tomillo</td>
                      <td class="web-cell">
                        <a href="https://tomillo.org" target="_blank" rel="noopener noreferrer"
                          >tomillo.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Fundación Valsé</td>
                      <td class="web-cell">
                        <a
                          href="https://www.fundacionvalse.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.fundacionvalse.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Fundación Villena La Salle</td>
                      <td class="web-cell">
                        <a
                          href="https://www.lasallesagradocorazon.es"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.lasallesagradocorazon.es</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">La Rueca Asociación</td>
                      <td class="web-cell">
                        <a href="https://larueca.info" target="_blank" rel="noopener noreferrer"
                          >larueca.info</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Madres Escolapias. Proyecto Paula Montal</td>
                      <td class="web-cell">
                        <a
                          href="https://www.ppaulamontal.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.ppaulamontal.org</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Parroquia Sta. María del Pozo</td>
                      <td class="web-cell"><span class="web-na">(sitio no especificado)</span></td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Redes Sociedad Cooperativa</td>
                      <td class="web-cell">
                        <a href="https://redes.coop" target="_blank" rel="noopener noreferrer"
                          >redes.coop</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">Save the Children Madrid</td>
                      <td class="web-cell">
                        <a
                          href="https://www.savethechildren.es/sedes-ong/madrid"
                          target="_blank"
                          rel="noopener noreferrer"
                          >www.savethechildren.es/sedes-ong/madrid</a
                        >
                      </td>
                    </tr>
                    <tr>
                      <td class="entidad-cell">YMCA</td>
                      <td class="web-cell">
                        <a href="https://www.ymca.es" target="_blank" rel="noopener noreferrer"
                          >www.ymca.es</a
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Filters -->
      <FilterBar
        :filters="filters"
        :data="excelData"
        @update:filters="
          (val) => {
            filters = val
            searched = false
          }
        "
        @search="searched = true"
        @clear="clearFilters"
      />

      <!-- Results -->
      <ResultsTable :actividades="filteredActividades" :loading="loading" />
    </div>
  </main>

  <footer class="app-footer">
    <div class="container footer-content">
      <p>CaixaProinfancia Madrid © 2025</p>
    </div>
  </footer>
</template>

<style scoped>
.app-header {
  background-color: black;
  background-image: url('/assets/img/bg.jpg');
  background-size: cover;
  background-position: center;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  min-height: 10rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 2rem;
  justify-content: space-between;
  font-family: 'Weiss Std', serif;
}

.header-logo {
  max-width: 220px;
  filter: drop-shadow(2px 2px 2px black);
}

.header-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-align: center;
  color: #00a3e0;
}

.header-subtitle {
  margin: 0.15rem 0 0;
  font-size: 1.5rem;
  opacity: 0.85;
  font-weight: 400;
  text-align: center;
  color: #00a3e0;
}

.app-main {
  min-height: calc(100vh - 200px);
  padding: 1.5rem 0;
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

/* Nav buttons */
.nav-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
}

.nav-btn {
  padding: 2rem;
  border: none;
  background: #00a3e0;
  color: white;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-btn:hover {
  background: #0088c4;
  color: white;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 16px;
  max-width: 720px;
  width: 100%;
  max-height: 90vh;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #6c757d;
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem;
  transition: color 0.15s ease;
}

.modal-close:hover {
  color: #212529;
}

.modal-body {
  padding: 2.5rem 2rem;
}

.modal-text {
  margin: 0 0 1.25rem;
  font-size: 1rem;
  line-height: 1.7;
  color: #212529;
}

.modal-list {
  margin: 0 0 1.5rem;
  padding: 0 0 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-list li {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #495057;
}

.modal-link-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #00a3e0;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s ease;
}

.modal-link-btn:hover {
  background: #0088c4;
}

.modal-text-caption {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9rem;
  margin-bottom: 0;
}

/* Competencias table */
.ctable {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  line-height: 1.5;
}

.ctable thead th {
  background: #00a3e0;
  color: white;
  font-weight: 600;
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  position: sticky;
  top: 0;
  z-index: 1;
}

.ctable thead th:first-child {
  width: 36%;
}

.ctable tbody tr.ctable-section td {
  background: #6c757d;
  color: white !important;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  padding: 0.6rem 1rem;
}

.ctable tbody tr td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
}

.ctable tbody tr td:first-child {
  font-weight: 600;
  color: #212529;
}

.ctable tbody tr td:last-child {
  color: #495057;
}

.ctable-wrapper {
  overflow-y: auto;
  max-height: calc(90vh - 11rem);
}

/* Entity table */
.ctable--entities .entidad-cell {
  font-weight: 600;
  color: #212529;
}

.ctable--entities .web-cell a {
  color: #00a3e0;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}

.ctable--entities .web-cell a:hover {
  color: #0088c4;
  text-decoration: underline;
}

.web-na {
  color: #8899aa;
  font-style: italic;
  font-size: 0.85rem;
}

.modal-inline-link {
  color: #00a3e0;
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
}

.modal-inline-link:hover {
  color: #0088c4;
  text-decoration: underline;
}

/* Modal fade transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .app-header {
    min-height: 14rem;
  }

  .header-brand {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }

  .header-title {
    font-size: 1rem;
  }

  .header-subtitle {
    font-size: 0.85rem;
  }

  .header-logo {
    max-width: 140px;
  }

  .header-logo:last-child {
    display: none;
  }

  .container {
    padding: 0 1rem;
  }

  .nav-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .nav-btn {
    max-width: calc(50% - 10px);
    flex: 1 1 calc(50% - 10px);
    padding: 1rem;
    font-size: 0.95rem;
    white-space: normal;
    text-align: center;
    white-space: initial;
    padding: 1rem;
  }

  .app-main {
    padding: 1rem 0;
  }

  .modal-body {
    padding: 1.75rem 1.25rem;
  }

  .modal-text {
    font-size: 0.95rem;
  }

  .modal-list li {
    font-size: 0.9rem;
  }

  .modal-link-btn {
    width: 100%;
    text-align: center;
  }

  .ctable {
    font-size: 0.8rem;
  }

  .ctable thead th,
  .ctable tbody tr.ctable-section td,
  .ctable tbody tr td {
    padding: 0.5rem 0.65rem;
  }

  .ctable thead th:first-child {
    width: 30%;
  }
}
</style>

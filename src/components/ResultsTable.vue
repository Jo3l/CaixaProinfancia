<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import { ref, computed } from 'vue'
import type { Actividad } from '../types'

const props = defineProps<{
  actividades: Actividad[]
  loading: boolean
}>()

const expandedRows = ref<Record<string, boolean>>({})
const globalFilter = ref('')

const columns = [
  { field: 'nombre', header: 'Nombre de la actividad', sortable: true },
  { field: 'competencia', header: 'Competencia', sortable: true },
  { field: 'edades', header: 'Edades', sortable: true },
  { field: 'entidad', header: 'Entidad', sortable: true },
]

const totalRecords = computed(() => props.actividades.length)

function hasDetails(act: Actividad): boolean {
  return !!(act.objetivos || act.descripcion || act.materiales || act.enlace || act.notas)
}
</script>

<template>
  <div class="results-section">
    <div class="results-header">
      <div class="results-count">
        <strong>{{ totalRecords }}</strong>
        {{ totalRecords === 1 ? 'actividad encontrada' : 'actividades encontradas' }}
      </div>
      <div class="p-input-icon-left search-table">
        <InputText
          v-model="globalFilter"
          placeholder="Filtrar en tabla..."
          class="table-search-input"
        />
      </div>
    </div>

    <DataTable
      v-model:expanded-rows="expandedRows"
      :value="actividades"
      :loading="loading"
      :global-filter-fields="[
        'nombre',
        'competencia',
        'edades',
        'entidad',
        'objetivos',
        'descripcion',
        'materiales',
        'notas',
      ]"
      :global-filter="globalFilter"
      striped-rows
      paginator
      :rows="25"
      :rows-per-page-options="[10, 25, 50, 100]"
      sort-field="competencia"
      :sort-order="1"
      data-key="nombre"
      class="results-table"
    >
      <Column header="Expandir" expander style="width: 3rem" />

      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="col.sortable"
        style="min-width: 120px"
      >
        <template #body="{ data }">
          <span v-if="col.field === 'nombre'" class="activity-name">{{ data[col.field] }}</span>
          <span v-else-if="col.field === 'competencia'">
            <Tag :value="data[col.field]" severity="info" rounded />
          </span>
          <span v-else-if="col.field === 'edades'">
            <Tag :value="data[col.field]" severity="warn" rounded />
          </span>
          <span v-else>{{ data[col.field] }}</span>
        </template>
      </Column>

      <template #expansion="{ data }">
        <div v-if="hasDetails(data)" class="expansion-panel">
          <div v-if="data.objetivos" class="exp-section">
            <h4 class="exp-title">Objetivos</h4>
            <p class="exp-text">{{ data.objetivos }}</p>
          </div>

          <div v-if="data.descripcion" class="exp-section">
            <h4 class="exp-title">Descripción</h4>
            <p class="exp-text">{{ data.descripcion }}</p>
          </div>

          <div v-if="data.materiales" class="exp-section">
            <h4 class="exp-title">Materiales</h4>
            <p class="exp-text">{{ data.materiales }}</p>
          </div>

          <div v-if="data.enlace" class="exp-section">
            <h4 class="exp-title">Enlace</h4>
            <a :href="data.enlace" target="_blank" rel="noopener noreferrer" class="exp-link">
              <i class="pi pi-external-link"></i> Abrir recurso
            </a>
          </div>

          <div v-if="data.notas" class="exp-section">
            <h4 class="exp-title">Notas y observaciones</h4>
            <p class="exp-text">{{ data.notas }}</p>
          </div>
        </div>
        <div v-else class="expansion-empty">
          <em>Sin detalles adicionales</em>
        </div>
      </template>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox" style="font-size: 2rem; opacity: 0.4"></i>
          <p>No hay actividades que coincidan con los filtros.</p>
          <p class="empty-hint">Prueba a ajustar los criterios de búsqueda.</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.results-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.results-count {
  font-size: 0.95rem;
  color: #495057;
}

.search-table {
  width: 280px;
}

.table-search-input {
  width: 100%;
}

.results-table {
  font-size: 0.9rem;
}

.activity-name {
  font-weight: 500;
  color: #1a73e8;
}

.expansion-panel {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exp-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.75rem;
}

.exp-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.exp-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0 0 0.35rem;
}

.exp-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #212529;
  white-space: pre-line;
}

.exp-link {
  color: #1a73e8;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.exp-link:hover {
  text-decoration: underline;
}

.expansion-empty {
  padding: 1rem 1.5rem;
  color: #adb5bd;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-state p {
  margin: 0.5rem 0 0;
}

.empty-hint {
  font-size: 0.85rem;
  color: #adb5bd;
}
</style>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import type { FiltersState, ExcelData } from '../types'

const props = defineProps<{
  filters: FiltersState
  data: ExcelData | null
}>()

const emit = defineEmits<{
  'update:filters': [filters: FiltersState]
  search: []
  clear: []
}>()

function updateFilter<K extends keyof FiltersState>(key: K, value: FiltersState[K]) {
  emit('update:filters', { ...props.filters, [key]: value })
}

function onSearchTextChange(val: unknown) {
  emit('update:filters', { ...props.filters, searchText: String(val ?? '') })
}
</script>

<template>
  <div v-if="data" class="filter-bar">
    <div class="filter-row">
      <div class="filter-item">
        <label class="filter-label">Edades</label>
        <MultiSelect
          :model-value="filters.edades"
          :options="data.edades"
          placeholder="Seleccionar edades..."
          :max-selected-labels="2"
          :selected-items-label="'{0} edades'"
          :show-toggle-all="false"
          class="filter-select"
          @update:model-value="(val) => updateFilter('edades', val)"
        />
      </div>

      <div class="filter-item">
        <label class="filter-label">Competencia trabajada</label>
        <MultiSelect
          :model-value="filters.competencias"
          :options="data.competencias"
          placeholder="Seleccionar competencias..."
          :max-selected-labels="2"
          :selected-items-label="'{0} competencias'"
          :show-toggle-all="false"
          class="filter-select"
          @update:model-value="(val) => updateFilter('competencias', val)"
        >
          <template #option="slotProps">
            <span>{{ slotProps.option }}</span>
          </template>
        </MultiSelect>
      </div>

      <div class="filter-item filter-search">
        <label class="filter-label">Búsqueda</label>
        <div class="search-wrapper">
          <InputText
            :model-value="filters.searchText"
            placeholder="Buscar en todos las columnas"
            class="search-input"
            @update:model-value="onSearchTextChange"
          />
        </div>
      </div>
    </div>

    <div class="filter-actions">
      <Button label="Buscar" class="btn-search" @click="$emit('search')" />
      <Button
        label="Borrar filtros"
        icon="pi pi-filter-slash"
        severity="secondary"
        @click="$emit('clear')"
      />
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

@media (max-width: 992px) {
  .filter-row {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    padding: 1rem;
  }

  .filter-actions {
    flex-direction: column;
  }

  .filter-actions .p-button {
    width: 100%;
  }
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.filter-select {
  width: 100%;
}

.search-wrapper {
  width: 100%;
}

.search-input {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.btn-search {
  background: #00a3e0 !important;
  border: none !important;
  color: white !important;
}

.btn-search:hover {
  background: #0088c4 !important;
}
</style>

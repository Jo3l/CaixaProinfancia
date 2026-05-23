<script setup lang="ts">
import FileUpload from 'primevue/fileupload'

const emit = defineEmits<{
  fileSelected: [file: File]
}>()

const _props = defineProps<{
  loading: boolean
}>()

function onFileSelect(event: { files: File[] }) {
  if (event.files.length > 0) {
    emit('fileSelected', event.files[0])
  }
}
</script>

<template>
  <div class="file-upload-section">
    <div class="upload-area">
      <FileUpload
        :auto="false"
        :custom-upload="true"
        :show-buttons="false"
        accept=".xlsx,.xls"
        :max-file-size="10485760"
        @select="onFileSelect"
        @invalid-file-size="console.error('Archivo demasiado grande')"
      >
        <template #empty>
          <div class="upload-placeholder">
            <i class="pi pi-file-excel" style="font-size: 3rem; color: #2d8a4e"></i>
            <p class="upload-text">Arrastra tu archivo Excel aquí o haz clic para seleccionarlo</p>
            <p class="upload-hint">Formatos: .xlsx, .xls (máx. 10MB)</p>
          </div>
        </template>
      </FileUpload>
    </div>
  </div>
</template>

<style scoped>
.file-upload-section {
  margin-bottom: 1rem;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.upload-placeholder {
  text-align: center;
  padding: 1rem;
}

.upload-text {
  font-size: 1.1rem;
  color: #495057;
  margin: 0.5rem 0 0.25rem;
  font-weight: 500;
}

.upload-hint {
  font-size: 0.85rem;
  color: #868e96;
  margin: 0;
}
</style>

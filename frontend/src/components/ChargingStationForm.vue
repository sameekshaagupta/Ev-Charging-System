<template>
  <div class="p-6">
    <h3 class="text-lg font-semibold mb-4">
      {{ editMode ? 'Edit' : 'Add New' }} Charging Station
    </h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Station Name *</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Enter station name"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Status *</label>
          <select
            v-model="form.status"
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Latitude *</label>
          <input
            v-model.number="form.location.latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            required
            placeholder="e.g., 23.0225"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Longitude *</label>
          <input
            v-model.number="form.location.longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            required
            placeholder="e.g., 72.5714"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Power Output (kW) *</label>
          <input
            v-model.number="form.powerOutput"
            type="number"
            min="1"
            max="350"
            required
            placeholder="e.g., 50"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Connector Type *</label>
          <select
            v-model="form.connectorType"
            required
          >
            <option value="">Select connector type</option>
            <option value="Type 1">Type 1</option>
            <option value="Type 2">Type 2</option>
            <option value="CHAdeMO">CHAdeMO</option>
            <option value="CCS">CCS</option>
            <option value="Tesla Supercharger">Tesla Supercharger</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Price per kWh</label>
          <input
            v-model.number="form.price"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g., 0.25"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Address</label>
        <textarea
          v-model="form.location.address"
          rows="2"
          placeholder="Enter full address"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Amenities</label>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <label
            v-for="amenity in availableAmenities"
            :key="amenity"
            class="flex items-center gap-2"
          >
            <input
              v-model="form.amenities"
              :value="amenity"
              type="checkbox"
              class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
            />
            <span class="text-sm">{{ amenity }}</span>
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary"
        >
          {{ loading ? 'Saving...' : (editMode ? 'Update' : 'Create') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      name: '',
      location: {
        latitude: null,
        longitude: null,
        address: ''
      },
      status: 'Active',
      powerOutput: null,
      connectorType: '',
      price: 0,
      amenities: []
    })
  },
  editMode: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const availableAmenities = [
  'WiFi', 'Parking', 'Restaurant', 'Shopping', 'Restroom', '24/7 Access'
]

const form = ref({ ...props.initialData })

watch(
  () => props.initialData,
  (newData) => {
    form.value = { ...newData }
  },
  { deep: true }
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
<template>
  <div class="lg:w-1/2 lg:pl-12 mt-8 lg:mt-0">
    <!-- Harga -->
    <div class="pb-4 mb-4">
      <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Harga</h3>
      <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-center">
        {{ formatCurrency(product.price) }}
      </p>
    </div>

    <!-- Catatan -->
    <div class="pb-4 mb-4">
      <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Catatan</h3>
      <textarea
        :value="note"
        @input="$emit('update:note', $event.target.value)"
        class="w-full sm:w-3/4 h-24 sm:h-28 border p-2 rounded-lg mt-2 text-sm sm:text-base lg:text-lg"
        placeholder="Masukkan catatan untuk produk Anda"
      ></textarea>
      <p class="text-gray-500 mt-1 text-xs sm:text-sm lg:text-base">
        Contoh: packing pakai selongsong
      </p>
    </div>

    <!-- Ukuran -->
    <div class="pb-4 mb-4">
      <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Variasi</h3>
      <div class="flex flex-wrap gap-2 mt-2">
        <button
          v-for="option in sizeOptions"
          :key="option.value"
          @click="$emit('select-size', option.value)"
          class="px-4 py-2 rounded-lg text-sm sm:text-base lg:text-lg border"
          :class="selectedSize === option.value ? 'bg-red-600 text-white' : 'border-gray-300'"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Finishing -->
    <div class="pb-4 mb-4">
      <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Finishing</h3>
      <select
        :value="selectedFinishing"
        @change="handleFinishingChange($event)"
        class="w-full sm:w-3/4 border p-2 mb-2 rounded-lg text-sm sm:text-base lg:text-lg"
      >
        <option value="">Tidak Ada yang Dipilih</option>
        <option v-for="option in finishingOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Jumlah -->
    <div class="pb-4 mb-4">
      <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Jumlah</h3>
      <div class="flex items-center mt-2">
        <button
          @click="$emit('decrease-quantity')"
          class="bg-white px-4 py-2 rounded-lg text-sm sm:text-base lg:text-lg border border-gray-300"
        >
          -
        </button>
        <span class="px-4 text-sm sm:text-base lg:text-lg">{{ quantity }}</span>
        <button
          @click="$emit('increase-quantity')"
          class="bg-white px-4 py-2 rounded-lg text-sm sm:text-base lg:text-lg border border-gray-300"
        >
          +
        </button>
      </div>
    </div>

    <!-- Harga Total -->
    <div class="pb-4 mb-4">
      <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Harga Total</h3>
      <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-red-600">
        {{ formatCurrency(totalPrice) }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      required: true,
    },
    sizeOptions: {
      type: Array,
      required: true,
    },
    finishingOptions: {
      type: Array,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    selectedSize: {
      type: String,
      required: true,
    },
    selectedFinishing: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  emits: [
    'update:note',
    'update:selectedSize',
    'update:selectedFinishing',
    'update:quantity',
    'select-size',
    'update-total-price',
    'increase-quantity',
    'decrease-quantity',
    'toggle-bookmark',
    'open-chat',
    'place-order',
    'report-product',
  ],
  setup(props, { emit }) {
    const formatCurrency = (value) => {
      return `Rp${value.toLocaleString('id-ID')}`
    }

    const handleFinishingChange = (event) => {
      emit('update:selectedFinishing', event.target.value)
      emit('update-total-price')
    }

    return { formatCurrency, handleFinishingChange }
  },
}
</script>

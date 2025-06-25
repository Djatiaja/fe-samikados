<template>
  <div class="overflow-auto rounded-lg shadow-md">
    <table class="w-full table-auto border-collapse border border-gray-300">
      <thead class="bg-red-600 text-white">
        <tr>
          <th class="p-4 text-center border-r border-gray-300">Kategori</th>
          <th class="p-4 text-center border-r border-gray-300">Nama</th>
          <th class="p-4 text-center border-r border-gray-300">Deskripsi</th>
          <th class="p-4 text-center border-r border-gray-300">Stok</th>
          <th class="p-4 text-center border-r border-gray-300">Harga</th>
          <th class="p-4 text-center border-r border-gray-300">Variasi</th>
          <th class="p-4 text-center border-r border-gray-300">Opsi Tambahan</th>
          <th class="p-4 text-center border-r border-gray-300">Thumbnail</th>
          <th class="p-4 text-center border-r border-gray-300">Gambar Produk</th>
          <th class="p-4 text-center border-r border-gray-300">Status</th>
          <th class="p-4 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading State -->
        <tr v-if="isLoading" class="border-b border-gray-300">
          <td colspan="11" class="p-4 text-center">
            <div class="flex justify-center items-center">
              <div
                class="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"
              ></div>
              <span class="ml-2 text-gray-600">Memuat produk...</span>
            </div>
          </td>
        </tr>
        <!-- Product Rows -->
        <tr
          v-else
          v-for="product in products"
          :key="product.id"
          class="border-b border-gray-300 hover:bg-gray-50"
        >
          <td class="p-4 text-center border-r border-gray-300">{{ product.category }}</td>
          <td class="p-4 text-center border-r border-gray-300">{{ product.name }}</td>
          <td class="p-4 text-center border-r border-gray-300">{{ product.description }}</td>
          <td class="p-4 text-center border-r border-gray-300">{{ product.stock_total }}</td>
          <td class="p-4 text-center border-r border-gray-300">
            Rp{{ product.price.toLocaleString('id-ID') }}
          </td>
          <td class="p-4 text-center border-r border-gray-300">
            <div v-if="product.variant_count && product.variant_count > 0">
              <span class="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-1 inline-block">
                {{ product.variant_count }} variasi
              </span>
            </div>
            <span v-else class="text-gray-400">-</span>
          </td>
          <td class="p-4 text-center border-r border-gray-300">
            <div v-if="product.finishing_count && product.finishing_count > 0">
              <span class="bg-green-100 text-green-700 text-xs rounded-full px-2 py-1 inline-block">
                {{ product.finishing_count }} opsi
              </span>
            </div>
            <span v-else class="text-gray-400">-</span>
          </td>
          <!-- Thumbnail Column -->
          <td class="p-4 text-center border-r border-gray-300">
            <div class="flex justify-center">
              <img
                :src="product.thumbnail_url || 'https://placehold.co/100x100'"
                alt="Thumbnail Produk"
                @click="$emit('preview-image', product, 0, 'thumbnail')"
                class="cursor-pointer w-12 h-12 object-cover rounded-lg border border-gray-200 hover:border-red-300 transition-all duration-200 hover:scale-105"
              />
            </div>
          </td>
          <!-- Product Images Column - Counter Only -->
          <td class="p-4 text-center border-r border-gray-300">
            <div v-if="product.images && product.images.length > 0">
              <span
                class="bg-purple-100 text-purple-700 text-xs rounded-full px-2 py-1 inline-block cursor-pointer hover:bg-purple-200 transition-colors"
                @click="$emit('preview-image', product, 0, 'gallery')"
                :title="`Klik untuk melihat ${product.images.length} gambar`"
              >
                {{ product.images.length }} gambar
              </span>
            </div>
            <span v-else class="text-gray-400">-</span>
          </td>
          <td class="p-4 text-center border-r border-gray-300">
            <select
              :class="[
                'status-dropdown w-28 text-white text-sm py-2 px-3 rounded-lg font-medium cursor-pointer transition-all duration-200',
                product.status === 'active'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600',
              ]"
              :value="product.status"
              @change="handleStatusChange($event, product)"
              id="product-status"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </td>
          <td class="p-4 text-center">
            <div class="flex justify-center gap-2">
              <button
                class="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                @click="$emit('edit-product', product)"
                title="Edit Produk"
              >
                <i class="fa-solid fa-pen-to-square fa-lg"></i>
              </button>
              <button
                class="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                @click="$emit('delete-product', product)"
                title="Hapus Produk"
              >
                <i class="fa-solid fa-trash fa-lg"></i>
              </button>
            </div>
          </td>
        </tr>
        <!-- No Products State -->
        <tr v-if="!isLoading && products.length === 0" class="border-b border-gray-300">
          <td colspan="11" class="p-4 text-center text-gray-500 py-8">
            <div class="flex flex-col items-center gap-2">
              <i class="fa-solid fa-box-open text-3xl text-gray-300"></i>
              <span>Tidak ada produk yang ditemukan</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ProductTable',
  props: {
    products: {
      type: Array,
      required: true,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['preview-image', 'change-status', 'edit-product', 'delete-product'],
  methods: {
    handleStatusChange(event, product) {
      console.log('ProductTable Change Status:', {
        id: product?.id,
        name: product?.name,
        newStatus: event.target.value,
      })
      this.$emit('change-status', product, event.target.value)
    },
  },
}
</script>

<style scoped>
.status-dropdown {
  transition: all 0.2s ease-in-out;
}

.status-dropdown:focus {
  outline: none;
  ring: 2px;
  ring-color: rgba(239, 68, 68, 0.5);
}

/* Smooth hover effects for images */
img {
  transition: all 0.2s ease-in-out;
}

img:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>

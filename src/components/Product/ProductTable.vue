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
          <th class="p-4 text-center border-r border-gray-300">Gambar</th>
          <th class="p-4 text-center border-r border-gray-300">Status</th>
          <th class="p-4 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading State -->
        <tr v-if="isLoading" class="border-b border-gray-300">
          <td colspan="10" class="p-4 text-center">
            <div class="flex justify-center items-center">
              <div
                class="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"
              ></div>
              <span class="ml-2 text-gray-600">Memuat produk...</span>
            </div>
          </td>
        </tr>
        <!-- Product Rows -->
        <tr v-else v-for="product in products" :key="product.id" class="border-b border-gray-300">
          <td class="p-4 text-center border-r border-gray-300">{{ product.category }}</td>
          <td class="p-4 text-center border-r border-gray-300">{{ product.name }}</td>
          <td class="p-4 text-center border-r border-gray-300">{{ product.description }}</td>
          <td class="p-4 text-center border-r border-gray-300">{{ product.stock_total }}</td>
          <td class="p-4 text-center border-r border-gray-300">
            Rp{{ product.price.toLocaleString('id-ID') }}
          </td>
          <td class="p-4 text-center border-r border-gray-300">
            <div v-if="product.variant_count && product.variant_count > 0">
              <span
                class="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1 mr-1 mb-1 inline-block"
              >
                {{ product.variant_count }} variasi
              </span>
            </div>
            <span v-else>-</span>
          </td>
          <td class="p-4 text-center border-r border-gray-300">
            <div v-if="product.finishing_count && product.finishing_count > 0">
              <span
                class="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1 mr-1 mb-1 inline-block"
              >
                {{ product.finishing_count }} opsi
              </span>
            </div>
            <span v-else>-</span>
          </td>
          <td class="p-4 text-center border-r border-gray-300">
            <div class="flex justify-center">
              <img
                :src="
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : 'https://placehold.co/48x48'
                "
                alt="Gambar Produk"
                @click="$emit('preview-image', product)"
                class="cursor-pointer w-12 h-12 object-cover"
              />
              <span
                v-if="product.images && product.images.length > 1"
                class="ml-1 bg-gray-200 text-gray-700 text-xs rounded-full px-1.5 py-0.5"
              >
                +{{ product.images.length - 1 }}
              </span>
            </div>
          </td>
          <td class="p-4 text-center border-r border-gray-300">
            <select
              :class="[
                'status-dropdown w-40 text-white py-2 px-4 rounded-lg',
                product.status === 'active' ? 'bg-green-500' : 'bg-red-600',
              ]"
              :value="product.status"
              @change="$emit('change-status', product, $event.target.value)"
            id="product-status">
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </td>
          <td class="p-4 text-center min-w-24">
            <button class="text-black-500 mr-2" @click="$emit('edit-product', product)">
              <i class="fa-solid fa-pen-to-square fa-lg"></i>
            </button>
            <button class="text-black-500" @click="$emit('delete-product', product)">
              <i class="fa-solid fa-trash fa-lg"></i>
            </button>
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
}
</script>

<style scoped>
.status-dropdown {
  cursor: pointer;
  transition: background-color 0.3s;
}
.status-dropdown:hover {
  filter: brightness(90%);
}
</style>

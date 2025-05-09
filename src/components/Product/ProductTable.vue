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
        <tr v-for="product in products" :key="product.id" class="border-b border-gray-300">
          <td class="p-4 text-center border-r border-gray-300">{{ product.category }}</td>
          <td class="p-4 text-center border-r border-gray-300">{{ product.name }}</td>
          <td class="p-4 text-center border-r border-gray-300">{{ product.description }}</td>
          <td class="p-4 text-center border-r border-gray-300">{{ product.stock }}</td>
          <td class="p-4 text-center border-r border-gray-300">
            Rp{{ product.price.toLocaleString('id-ID') }}
          </td>
          <td class="p-4 text-center border-r border-gray-300">
            <div v-if="product.variations && product.variations.length > 0">
              <span
                class="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1 mr-1 mb-1 inline-block"
              >
                {{ product.variations.length }} variasi
              </span>
            </div>
            <span v-else>-</span>
          </td>
          <td class="p-4 text-center border-r border-gray-300">
            <div v-if="product.additionalOptions && product.additionalOptions.length > 0">
              <span
                class="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1 mr-1 mb-1 inline-block"
              >
                {{ product.additionalOptions.length }} opsi
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
                product.status === 'aktif' ? 'bg-green-500' : 'bg-red-600',
              ]"
              :value="product.status"
              @change="$emit('change-status', product, $event.target.value)"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </td>
          <td class="p-4 text-center min-w-24">
            <button class="text-blue-500 mr-2" @click="$emit('edit-product', product)">
              <img src="/icon/edit-btn.svg" alt="Edit Icon" class="w-6 h-6" />
            </button>
            <button @click="$emit('delete-product', product)">
              <img src="/icon/delete-btn.svg" alt="Delete Icon" class="w-6 h-6" />
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
  },
}
</script>

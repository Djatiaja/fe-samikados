<template>
  <div class="flex flex-col min-h-screen">
    <!-- Overlay -->
    <div
      id="overlay"
      :class="{ block: isSidebarActive && isMobile, hidden: !isSidebarActive || !isMobile }"
      @click="toggleSidebar"
      class="fixed inset-0 bg-opacity-20 z-20"
    ></div>

    <!-- Header -->
    <HeaderSeller @toggle-sidebar="toggleSidebar" :showSearch="true">
      <template #search>
        <div class="relative w-full">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari produk..."
            class="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 bg-white text-black"
          />
          <div class="absolute left-4 top-3">
            <img
              src="/icon/magnifying-glass-solid.svg"
              alt="Search"
              class="h-4 w-4 text-gray-400"
            />
          </div>
        </div>
      </template>
    </HeaderSeller>

    <!-- Sidebar -->
    <SidebarSeller :isSidebarActive="isSidebarActive" />

    <!-- Content Wrapper -->
    <div
      class="content-wrapper bg-gray-100 flex-1 mt-32 sm:mt-32 md:mt-16"
      :class="{ 'lg:ml-64': isSidebarActive }"
    >
      <div class="p-4 md:p-6 lg:p-8">
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6 mt-12 lg:mt-3">
          Manajemen Produk
        </h2>

        <div class="flex justify-between items-center mb-4">
          <!-- Filter Dropdown -->
          <select
            v-model="statusFilter"
            class="block w-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Semua</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button
            @click="showAddProductModal"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <span class="mr-2">+</span> Tambah Produk
          </button>
        </div>

        <!-- Entries per page -->
        <div class="mb-4">
          <label for="entriesPerPage" class="mr-2">Entries per page:</label>
          <select
            v-model="entriesPerPage"
            class="p-2 border border-gray-300 rounded-md"
            @change="changeEntriesPerPage"
          >
            <option value="10">10</option>
            <option value="25" selected>25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <!-- Product Table Component -->
        <ProductTable
          :products="filteredProducts"
          @edit-product="handleEditProduct"
          @delete-product="handleDeleteProduct"
          @change-status="handleStatusChange"
          @preview-image="handleImagePreview"
        />
      </div>
    </div>

    <FooterSeller />

    <!-- Modal Components -->
    <ModalAddProduct ref="addProductModal" @save-product="handleSaveProduct" />

    <ModalEditProduct ref="editProductModal" @save-product="handleUpdateProduct" />

    <ModalProductImage ref="imagePreviewModal" />

    <ModalConfirmStatus
      ref="confirmStatusModal"
      @confirm-status-change="handleConfirmStatusChange"
    />

    <ModalConfirmDelete ref="confirmDeleteModal" @confirm-delete="handleConfirmDelete" />
  </div>
</template>

<script>
import HeaderSeller from '@/components/HeaderSeller.vue'
import SidebarSeller from '@/components/SidebarSeller.vue'
import FooterSeller from '@/components/FooterSeller.vue'
import ProductTable from '../components/Product/ProductTable.vue'
import ModalAddProduct from '../components/Product/ModalAddProduct.vue'
import ModalEditProduct from '../components/Product/ModalEditProduct.vue'
import ModalProductImage from '../components/Product/ModalProductImage.vue'
import ModalConfirmStatus from '../components/Product/ModalConfirmStatus.vue'
import ModalConfirmDelete from '../components/Product/ModalConfirmDelete.vue'
import Swal from 'sweetalert2'

export default {
  components: {
    HeaderSeller,
    SidebarSeller,
    FooterSeller,
    ProductTable,
    ModalAddProduct,
    ModalEditProduct,
    ModalProductImage,
    ModalConfirmStatus,
    ModalConfirmDelete,
  },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      statusFilter: 'all',
      entriesPerPage: 25,
      searchQuery: '',
      currentProduct: null,

      // Products data array
      products: [
        {
          id: 1,
          category: 'Merchandise',
          name: 'PIN PENITI 58mm',
          description: 'Temukan solusi praktis untuk kebutuhan promosi.',
          stock: 250,
          price: 4500,
          images: [
            'https://placehold.co/400x400/red/white?text=PIN+1',
            'https://placehold.co/400x400/blue/white?text=PIN+2',
            'https://placehold.co/400x400/green/white?text=PIN+3',
          ],
          status: 'aktif',
          variations: [
            { id: 1, name: 'Peniti', price: 4500 },
            { id: 2, name: 'Magnet', price: 5500 },
          ],
          additionalOptions: [{ id: 1, name: 'Packaging Box', price: 2000 }],
        },
        {
          id: 2,
          category: 'T-Shirt',
          name: 'Kaos Premium',
          description: 'Kaos katun premium dengan bahan berkualitas.',
          stock: 100,
          price: 85000,
          images: [
            'https://placehold.co/400x400/orange/white?text=Kaos+1',
            'https://placehold.co/400x400/purple/white?text=Kaos+2',
          ],
          status: 'aktif',
          variations: [
            { id: 1, name: 'S', price: 85000 },
            { id: 2, name: 'M', price: 85000 },
            { id: 3, name: 'L', price: 85000 },
            { id: 4, name: 'XL', price: 90000 },
          ],
          additionalOptions: [
            { id: 1, name: 'Sablon DTF', price: 15000 },
            { id: 2, name: 'Bordir', price: 20000 },
          ],
        },
        {
          id: 3,
          category: 'Accessories',
          name: 'Gantungan Kunci',
          description: 'Gantungan kunci custom dengan desain menarik.',
          stock: 150,
          price: 12000,
          images: ['https://placehold.co/400x400/yellow/black?text=Gantungan+1'],
          status: 'nonaktif',
          variations: [],
          additionalOptions: [],
        },
      ],
    }
  },
  computed: {
    filteredProducts() {
      let filtered = this.products

      // Filter by status
      if (this.statusFilter !== 'all') {
        filtered = filtered.filter((product) =>
          this.statusFilter === 'active'
            ? product.status === 'aktif'
            : product.status === 'nonaktif',
        )
      }

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query),
        )
      }

      return filtered
    },
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    toggleSidebar() {
      if (this.isMobile) {
        this.isSidebarActive = !this.isSidebarActive
      }
    },
    handleResize() {
      this.isMobile = window.innerWidth < 1024
      this.isSidebarActive = !this.isMobile
    },
    changeEntriesPerPage() {
      // Logic for changing entries per page
    },
    formatCurrency(amount) {
      return `Rp${amount.toLocaleString('id-ID')}`
    },

    // Modal Handlers
    showAddProductModal() {
      this.$refs.addProductModal.open()
    },
    handleEditProduct(product) {
      this.currentProduct = product
      this.$refs.editProductModal.open(product)
    },
    handleDeleteProduct(product) {
      this.currentProduct = product
      this.$refs.confirmDeleteModal.open(product)
    },
    handleStatusChange(product, newStatus) {
      this.currentProduct = product
      this.$refs.confirmStatusModal.open(product, newStatus)
    },
    handleImagePreview(product) {
      this.$refs.imagePreviewModal.open(product)
    },

    // Data Handlers
    handleSaveProduct(newProduct) {
      this.products.push(newProduct)
      this.showSuccessMessage('Produk berhasil ditambahkan')
    },
    handleUpdateProduct(updatedProduct) {
      const index = this.products.findIndex((p) => p.id === updatedProduct.id)
      if (index !== -1) {
        this.products.splice(index, 1, updatedProduct)
        this.showSuccessMessage('Produk berhasil diperbarui')
      }
    },
    handleConfirmDelete() {
      this.products = this.products.filter((p) => p.id !== this.currentProduct.id)
      this.showSuccessMessage('Produk berhasil dihapus')
    },
    handleConfirmStatusChange(newStatus) {
      const product = this.products.find((p) => p.id === this.currentProduct.id)
      if (product) {
        product.status = newStatus
        this.showSuccessMessage('Status produk berhasil diubah')
      }
    },

    // Helper Methods
    showSuccessMessage(message) {
      Swal.fire({
        title: 'Berhasil!',
        text: message,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    },
  },
}
</script>

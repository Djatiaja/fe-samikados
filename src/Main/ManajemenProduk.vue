<template>
  <div class="flex flex-col min-h-screen">
    <!-- Overlay -->
    <div
      v-if="isSidebarActive && isMobile"
      class="fixed inset-0 bg-opacity-20 z-20"
      @click="toggleSidebar"
    ></div>

    <!-- Header -->
    <HeaderSeller @toggle-sidebar="toggleSidebar" :showSearch="true">
      <template #search>
        <div class="relative w-full">
          <input
            v-model="searchQuery"
            placeholder="Cari nama produk atau SKU..."
            class="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 bg-white text-black"
            @input="debouncedSearch"
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
            @change="fetchProducts"
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
        <div class="mb-4 flex justify-between items-center">
          <div>
            <label for="entriesPerPage" class="mr-2">Entries per page:</label>
            <select
              v-model="entriesPerPage"
              id="entriesPerPage"
              class="p-2 border border-gray-300 rounded-md"
              @change="changeEntriesPerPage"
            >
              <option value="10">10</option>
              <option value="25" selected>25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center">
          <div
            class="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"
          ></div>
        </div>

        <!-- Product Table or No Products -->
        <div v-else>
          <ProductTable
            :products="products"
            :isLoading="isLoading"
            @edit-product="handleEditProduct"
            @delete-product="handleDeleteProduct"
            @change-status="handleStatusChange"
            @preview-image="handleImagePreview"
          />
          <div v-if="products.length === 0" class="text-center text-gray-600 mt-4">
            Tidak ada produk yang ditemukan
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination.total > 0"
          class="mt-6 flex flex-col md:flex-row justify-between items-center"
        >
          <div class="text-sm text-gray-600 mb-4 md:mb-0">
            Showing {{ paginationInfo.from }} to {{ paginationInfo.to }} of
            {{ pagination.total }} entries
          </div>
          <div class="flex justify-center items-center space-x-2">
            <!-- First Page -->
            <button
              @click="goToPage(1)"
              :disabled="pagination.page === 1"
              class="px-3 py-1 rounded-md border"
              :class="
                pagination.page === 1
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'border-gray-300 hover:bg-gray-100'
              "
            >
              «
            </button>

            <!-- Previous Page -->
            <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-3 py-1 rounded-md border"
              :class="
                pagination.page === 1
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'border-gray-300 hover:bg-gray-100'
              "
            >
              ‹
            </button>

            <!-- Page Numbers -->
            <div class="flex space-x-1">
              <template v-for="page in displayedPages" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="goToPage(page)"
                  class="w-8 h-8 flex items-center justify-center rounded-md"
                  :class="
                    pagination.page === page
                      ? 'bg-red-600 text-white'
                      : 'hover:bg-gray-100 border border-gray-300'
                  "
                >
                  {{ page }}
                </button>
                <span v-else class="w-8 h-8 flex items-center justify-center">...</span>
              </template>
            </div>

            <!-- Next Page -->
            <button
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page === totalPages"
              class="px-3 py-1 rounded-md border"
              :class="
                pagination.page === totalPages
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'border-gray-300 hover:bg-gray-100'
              "
            >
              ›
            </button>

            <!-- Last Page -->
            <button
              @click="goToPage(totalPages)"
              :disabled="pagination.page === totalPages"
              class="px-3 py-1 rounded-md border"
              :class="
                pagination.page === totalPages
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'border-gray-300 hover:bg-gray-100'
              "
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>

    <FooterSeller />

    <!-- Modal Components -->
    <ModalAddProduct
      ref="addProductModal"
      @save-product="handleSaveProduct"
      :categories="categories"
    />
    <ModalEditProduct
      ref="editProductModal"
      @save-product="handleUpdateProduct"
      :categories="categories"
    />
    <ModalProductImage ref="imagePreviewModal" />
    <ModalConfirmStatus
      ref="confirmStatusModal"
      @confirm-status-change="handleConfirmStatusChange"
    />
    <ModalConfirmDelete ref="confirmDeleteModal" @confirm-delete="handleConfirmDelete" />
  </div>
</template>

<script>
import { debounce } from 'lodash'
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
import axios from 'axios'

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
      products: [],
      categories: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 25,
      },
      isLoading: false,
      maxPageButtons: 5,
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.pagination.total / this.pagination.limit) || 1
    },
    paginationInfo() {
      const from = (this.pagination.page - 1) * this.pagination.limit + 1
      const to = Math.min(this.pagination.page * this.pagination.limit, this.pagination.total)
      return {
        from: from > this.pagination.total ? 0 : from,
        to: to > this.pagination.total ? this.pagination.total : to,
      }
    },
    displayedPages() {
      if (this.totalPages <= this.maxPageButtons) {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1)
      }

      let pages = []
      const halfMax = Math.floor(this.maxPageButtons / 2)
      const currentPage = this.pagination.page

      pages.push(1)

      if (currentPage > halfMax + 2) {
        pages.push('...')
      }

      const startPage = Math.max(2, currentPage - halfMax)
      const endPage = Math.min(this.totalPages - 1, currentPage + halfMax)

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== this.totalPages) {
          pages.push(i)
        }
      }

      if (currentPage < this.totalPages - halfMax - 1) {
        pages.push('...')
      }

      if (this.totalPages > 1) {
        pages.push(this.totalPages)
      }

      return pages
    },
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
    this.fetchCategories()
    this.fetchProducts()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    debouncedSearch: debounce(function () {
      this.pagination.page = 1
      this.fetchProducts()
    }, 300),
    async fetchCategories() {
      this.isLoading = true
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/categories', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        this.categories = response.data.data || []
        localStorage.setItem('categories', JSON.stringify(this.categories))
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal mengambil kategori',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
      } finally {
        this.isLoading = false
      }
    },
    getCategoryName(categoryId) {
      const category = this.categories.find((cat) => cat.id === categoryId)
      return category ? category.name : 'Tidak Diketahui'
    },
    async fetchVariants(productId) {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/seller/product/variant', {
          params: { product_id: productId },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        return response.data.data.map((variant) => ({
          id: variant.id,
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          weight: variant.weight,
          is_default: variant.is_default,
        }))
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal mengambil varian',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
        return []
      }
    },
    async fetchFinishing(productId) {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/seller/product/finishing', {
          params: { product_id: productId },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        return response.data.data.map((finishing) => ({
          id: finishing.id,
          name: finishing.finishing?.name || finishing.name,
          price: finishing.price,
          finishing_id: finishing.finishing_id,
          color_code: finishing.color_code || '#000000',
        }))
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal mengambil opsi finishing',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
        return []
      }
    },
    async fetchProducts() {
      this.isLoading = true
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/seller/products', {
          params: {
            status:
              this.statusFilter === 'all' ? undefined : this.statusFilter === 'active' ? 1 : 0,
            search: this.searchQuery,
            limit: this.pagination.limit,
            page: this.pagination.page,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })

        const {
          data: { products },
          meta,
        } = response.data.data
        // Update products and pagination
        this.products = products.map((product) => ({
          id: product.id,
          sku: product.sku,
          category: this.getCategoryName(product.category_id),
          category_id: product.category_id,
          name: product.name,
          description: product.description,
          stock_total: parseInt(product.stock_total, 10) || 0,
          unit: product.unit || 'pack',
          price: product.price || 0,
          weight: product.weight || 0,
          min_qty: product.min_qty || null,
          images: [product.thumbnail_url || 'https://placehold.co/1000x1000'],
          status: product.is_publish ? 'active' : 'inactive',
          variant_count: product.variant_count || 0,
          finishing_count: product.finishing_count || 0,
          variations: [],
          additionalOptions: [],
        }))
        this.pagination = {
          total: meta.total || 0,
          page: meta.current_page || 1,
          limit: meta.per_page || this.pagination.limit,
        }
        // Ensure DOM updates are complete before hiding loading state
        await this.$nextTick()
        this.isLoading = false
      } catch (error) {
        console.error('Error fetching products:', error)
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal mengambil produk',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
        this.products = []
        this.pagination.total = 0
        await this.$nextTick()
        this.isLoading = false
      }
    },
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
      this.pagination.limit = parseInt(this.entriesPerPage)
      this.pagination.page = 1
      this.fetchProducts()
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.page = page
        this.fetchProducts()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    showAddProductModal() {
      this.$refs.addProductModal.open()
    },
    async handleEditProduct(product) {
      this.currentProduct = product
      this.isLoading = true
      try {
        const [variations, additionalOptions] = await Promise.all([
          this.fetchVariants(product.id),
          this.fetchFinishing(product.id),
        ])
        const updatedProduct = { ...product, variations, additionalOptions }
        this.$refs.editProductModal.open(updatedProduct)
      } finally {
        this.isLoading = false
      }
    },
    handleDeleteProduct(product) {
      this.currentProduct = product
      this.$refs.confirmDeleteModal.open(product)
    },
    handleStatusChange(product, newStatus) {
      this.currentProduct = product
      this.$refs.confirmStatusModal.open(product, newStatus)
    },
    async handleImagePreview(product) {
      this.isLoading = true
      try {
        const [variations, additionalOptions] = await Promise.all([
          this.fetchVariants(product.id),
          this.fetchFinishing(product.id),
        ])
        const updatedProduct = { ...product, variations, additionalOptions }
        this.$refs.imagePreviewModal.open(updatedProduct)
      } finally {
        this.isLoading = false
      }
    },
    async handleSaveProduct(newProduct) {
      if (
        !newProduct.name ||
        !newProduct.description ||
        !newProduct.unit ||
        !newProduct.thumbnail
      ) {
        Swal.fire({
          title: 'Error!',
          text: 'Nama, deskripsi, unit, dan thumbnail wajib diisi',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
        return
      }

      this.isLoading = true
      try {
        const formData = new FormData()
        formData.append('category_id', newProduct.category_id)
        formData.append('name', newProduct.name)
        formData.append('description', newProduct.description)
        formData.append('unit', newProduct.unit)
        formData.append('is_publish', newProduct.is_publish ? 1 : 0)
        formData.append('thumbnail', newProduct.thumbnail)

        newProduct.product_variants.forEach((variant, index) => {
          formData.append(`product_variants[${index}][name]`, variant.name)
          formData.append(`product_variants[${index}][price]`, variant.price)
          formData.append(`product_variants[${index}][stock]`, variant.stock)
          formData.append(`product_variants[${index}][weight]`, variant.weight)
          formData.append(`product_variants[${index}][min_qty]`, variant.min_qty)
          formData.append(`product_variants[${index}][is_default]`, variant.is_default ? 1 : 0)
        })

        newProduct.product_finishing.forEach((finishing, index) => {
          formData.append(`product_finishing[${index}][name]`, finishing.name)
          formData.append(`product_finishing[${index}][price]`, finishing.price)
          formData.append(`product_finishing[${index}][color_code]`, finishing.color_code)
        })

        await axios.post('http://127.0.0.1:8000/api/seller/products', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        this.showSuccessMessage('Produk berhasil ditambahkan')
        this.fetchProducts()
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal menambah produk',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
      } finally {
        this.isLoading = false
      }
    },
    async handleUpdateProduct(updatedProduct) {
      this.isLoading = true
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication token is missing')
        }

        const originalProduct = this.products.find((p) => p.id === updatedProduct.id)
        if (!originalProduct) {
          throw new Error('Original product not found')
        }

        const formData = new FormData()
        formData.append('id', updatedProduct.id)
        formData.append('name', updatedProduct.name?.trim() || originalProduct.name)
        formData.append(
          'description',
          updatedProduct.description?.trim() || originalProduct.description,
        )
        formData.append('unit', updatedProduct.unit || originalProduct.unit || 'pack')
        formData.append('weight', parseInt(updatedProduct.weight) || originalProduct.weight || 0)
        formData.append(
          'quantity',
          parseInt(updatedProduct.stock_total) || originalProduct.stock_total || 0,
        )
        formData.append('price', parseInt(updatedProduct.price) || originalProduct.price || 0)
        formData.append(
          'buy_price',
          parseInt(updatedProduct.buy_price) || originalProduct.buy_price || 0,
        )
        formData.append('is_publish', updatedProduct.status === 'active' ? 1 : 0)
        formData.append(
          'category_id',
          this.categories.find((cat) => cat.name === updatedProduct.category)?.id ||
            updatedProduct.category_id ||
            originalProduct.category_id,
        )
        if (updatedProduct.thumbnail instanceof File) {
          formData.append('thumbnail', updatedProduct.thumbnail)
        }

        if (!updatedProduct.name || !updatedProduct.description || !updatedProduct.unit) {
          throw new Error('Nama, deskripsi, dan unit wajib diisi')
        }

        const productResponse = await axios.post(
          'http://127.0.0.1:8000/api/seller/product/update',
          formData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } },
        )

        const variantPromises =
          updatedProduct.variations?.map((variant) => {
            const originalVariant =
              originalProduct.variations?.find((v) => v.id === variant.id) || {}
            const variantPayload = {
              product_id: updatedProduct.id,
              name: variant.name?.trim(),
              price: parseInt(variant.price) || 0,
              stock: parseInt(variant.stock) || 0,
              weight: parseInt(variant.weight) || 0,
              is_default: variant.is_default ? 1 : 0,
            }

            if (!variantPayload.name) {
              return Promise.reject(new Error('Variant name is required'))
            }

            if (
              variant.id &&
              (variant.name !== originalVariant.name ||
                variant.price !== originalVariant.price ||
                variant.stock !== originalVariant.stock ||
                variant.weight !== originalVariant.weight ||
                variant.is_default !== originalVariant.is_default)
            ) {
              return axios.post(
                'http://127.0.0.1:8000/api/seller/product/variant/update',
                { id: variant.id, ...variantPayload },
                { headers: { Authorization: `Bearer ${token}` } },
              )
            } else if (!variant.id) {
              return axios.post(
                'http://127.0.0.1:8000/api/seller/product/variant',
                variantPayload,
                { headers: { Authorization: `Bearer ${token}` } },
              )
            }
            return Promise.resolve()
          }) || []

        const finishingPromises =
          updatedProduct.additionalOptions?.map((option) => {
            const originalOption =
              originalProduct.additionalOptions?.find((o) => o.id === option.id) || {}
            const finishingPayload = {
              product_id: updatedProduct.id,
              name: option.name?.trim(),
              price: parseInt(option.price) || 0,
              color_code: option.color_code || '#000000',
            }

            if (!finishingPayload.name) {
              return Promise.reject(new Error('Finishing name is required'))
            }

            if (
              option.id &&
              (option.name !== originalOption.name || option.price !== originalOption.price)
            ) {
              return axios.post(
                'http://127.0.0.1:8000/api/seller/product/finishing/update',
                { id: option.id, ...finishingPayload },
                { headers: { Authorization: `Bearer ${token}` } },
              )
            } else if (!option.id) {
              return axios.post(
                'http://127.0.0.1:8000/api/seller/product/finishing',
                finishingPayload,
                { headers: { Authorization: `Bearer ${token}` } },
              )
            }
            return Promise.resolve()
          }) || []

        const deletedVariants =
          originalProduct.variations?.filter(
            (original) => !updatedProduct.variations?.some((v) => v.id === original.id),
          ) || []
        const deletedFinishing =
          originalProduct.additionalOptions?.filter(
            (original) => !updatedProduct.additionalOptions?.some((o) => o.id === original.id),
          ) || []

        const deleteVariantPromises = deletedVariants.map((variant) =>
          axios.delete('http://127.0.0.1:8000/api/seller/product/variant/delete', {
            headers: { Authorization: `Bearer ${token}` },
            data: { id: variant.id },
          }),
        )

        const deleteFinishingPromises = deletedFinishing.map((option) =>
          axios.delete('http://127.0.0.1:8000/api/seller/product/finishing/delete', {
            headers: { Authorization: `Bearer ${token}` },
            data: { id: option.id },
          }),
        )

        await Promise.all([
          ...variantPromises,
          ...finishingPromises,
          ...deleteVariantPromises,
          ...deleteFinishingPromises,
        ])

        const index = this.products.findIndex((p) => p.id === updatedProduct.id)
        if (index !== -1) {
          this.products.splice(index, 1, {
            ...productResponse.data.data,
            category: this.getCategoryName(productResponse.data.data.category_id),
            category_id: productResponse.data.data.category_id,
            status: productResponse.data.data.is_publish ? 'active' : 'inactive',
            stock_total: parseInt(productResponse.data.data.quantity) || 0,
            unit: productResponse.data.data.unit || 'pack',
            weight: parseInt(productResponse.data.data.weight) || 0,
            price: parseInt(productResponse.data.data.price) || 0,
            buy_price: parseInt(productResponse.data.data.buy_price) || 0,
            images: [
              productResponse.data.data.thumbnail_url ||
                updatedProduct.images?.[0] || 'https://placehold.co/1000x1000',
            ],
            variant_count: updatedProduct.variations?.length || 0,
            finishing_count: updatedProduct.additionalOptions?.length || 0,
            variations: updatedProduct.variations || [],
            additionalOptions: updatedProduct.additionalOptions || [],
          })
          this.showSuccessMessage('Produk berhasil diperbarui')
        }
      } catch (error) {
        console.error('Update product error:', error.response?.data || error.message)
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || error.message || 'Gagal memperbarui produk',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false,
        })
      } finally {
        this.isLoading = false
        this.fetchProducts()
      }
    },
    async handleConfirmDelete() {
      this.isLoading = true
      try {
        await axios.delete(`http://127.0.0.1:8000/api/seller/products/${this.currentProduct.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        this.products = this.products.filter((p) => p.id !== this.currentProduct.id)
        this.showSuccessMessage('Produk berhasil dihapus')
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal menghapus produk',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
      } finally {
        this.isLoading = false
      }
    },
    async handleConfirmStatusChange(newStatus) {
      this.isLoading = true
      try {
        const isPublish = newStatus === 'active' ? 1 : 0
        await axios.patch(
          `http://127.0.0.1:8000/api/seller/products/${this.currentProduct.id}/status`,
          { is_publish: isPublish },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
        )
        const product = this.products.find((p) => p.id === this.currentProduct.id)
        if (product) {
          product.status = newStatus
          this.showSuccessMessage('Status produk berhasil diubah')
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal memperbarui status',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
      } finally {
        this.isLoading = false
      }
    },
    showSuccessMessage(message) {
      Swal.fire({
        title: 'Berhasil!',
        text: message,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
      })
    },
  },
}
</script>

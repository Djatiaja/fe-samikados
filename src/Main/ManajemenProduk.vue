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
      return Math.max(Math.ceil(this.pagination.total / this.pagination.limit), 1)
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
      const current = this.pagination.page
      const last = this.totalPages
      const delta = 2
      const left = current - delta
      const right = current + delta + 1
      const range = []
      const rangeWithDots = []
      let l

      for (let i = 1; i <= last; i++) {
        if (i === 1 || i === last || (i >= left && i < right)) {
          range.push(i)
        }
      }

      for (let i of range) {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1)
          } else if (i - l !== 1) {
            rangeWithDots.push('...')
          }
        }
        rangeWithDots.push(i)
        l = i
      }

      return rangeWithDots
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
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.categories = response.data.data || []
        localStorage.setItem('categories', JSON.stringify(this.categories))
        console.log('Fetched Categories:', this.categories) // Debug: Log categories
      } catch (error) {
        console.error('Error fetching categories:', error.response?.data || error.message)
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
      return category ? category.name : 'Tidak Ada'
    },
    async fetchVariants(productId) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/seller/product/variant`,
          {
            params: { product_id: productId },
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        const variants = response.data.data.map((variant) => ({
          id: variant.id,
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          weight: variant.weight,
          min_qty: variant.min_qty || 1,
          is_default: variant.is_default,
        }))
        console.log(`Fetched Variants for Product ${productId}:`, variants) // Debug: Log variants
        return variants
      } catch (error) {
        console.error('Error fetching variants:', error.response?.data || error.message)
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
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/seller/product/finishing`,
          {
            params: { product_id: productId },
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        const finishings = response.data.data.map((finishing) => ({
          id: finishing.id,
          name: finishing.finishing?.name || finishing.name,
          price: finishing.price,
          finishing_id: finishing.finishing_id,
          color_code: finishing.color_code || '#000000',
        }))
        console.log(`Fetched Finishings for Product ${productId}:`, finishings) // Debug: Log finishings
        return finishings
      } catch (error) {
        console.error('Error fetching finishing:', error.response?.data || error.message)
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
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication token is missing')
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/seller/products`, {
          params: {
            status:
              this.statusFilter === 'all' ? undefined : this.statusFilter === 'active' ? 1 : 0,
            search: this.searchQuery,
            limit: this.pagination.limit,
            page: this.pagination.page,
          },
          headers: { Authorization: `Bearer ${token}` },
        })

        const {
          data: { products },
          meta,
        } = response.data.data

        const productsWithImages = await Promise.all(
          products.map(async (product) => {
            try {
              const imagesResponse = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/seller/product/image`,
                {
                  params: { product_id: product.id },
                  headers: { Authorization: `Bearer ${token}` },
                },
              )

              return {
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
                thumbnail_url: product.thumbnail_url || 'https://placehold.co/1000x1000',
                images: imagesResponse.data.data || [],
                status: product.is_publish ? 'active' : 'inactive',
                variant_count: product.variants_count || 0,
                finishing_count: product.finishings_count || 0,
                variations: [],
                additionalOptions: [],
              }
            } catch (error) {
              console.error(`Error fetching images for product ${product.id}:`, error)
              return {
                ...product,
                thumbnail_url: product.thumbnail_url || 'https://placehold.co/1000x1000',
                images: [],
                status: product.is_publish ? 'active' : 'inactive',
                category: this.getCategoryName(product.category_id),
              }
            }
          }),
        )

        this.products = productsWithImages
        this.pagination = {
          total: meta.total || 0,
          page: meta.current_page || this.pagination.page,
          limit: meta.per_page || this.pagination.limit,
        }
        console.log('Fetched Products:', this.products) // Debug: Log products
      } catch (error) {
        console.error('Error fetching products:', error.response?.data || error.message)
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal mengambil produk',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
        this.products = []
        this.pagination.total = 0
      } finally {
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
      if (page >= 1 && page <= this.totalPages && page !== this.pagination.page) {
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
        console.log('Editing Product:', updatedProduct) // Debug: Log product to edit
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
        !newProduct.thumbnail ||
        newProduct.images.length === 0 ||
        newProduct.product_variants.length === 0
      ) {
        Swal.fire({
          title: 'Error!',
          text: 'Nama, deskripsi, unit, thumbnail, minimal satu gambar, dan minimal satu variasi wajib diisi',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
        return
      }
      this.isLoading = true
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication token is missing')
        }
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
          if (finishing.name && finishing.price >= 0) {
            formData.append(`product_finishing[${index}][name]`, finishing.name)
            formData.append(`product_finishing[${index}][price]`, finishing.price)
            formData.append(`product_finishing[${index}][color_code]`, finishing.color_code)
          }
        })
        newProduct.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image)
        })

        // Debug: Log FormData
        for (const [key, value] of formData.entries()) {
          console.log(`Save Product FormData ${key}:`, value instanceof File ? value.name : value)
        }

        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/seller/products`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        this.showSuccessMessage('Produk berhasil ditambahkan')
        this.fetchProducts()
      } catch (error) {
        console.error('Error saving product:', error.response?.data || error.message)
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

        console.log('Original Product:', originalProduct) // Debug: Log original product
        console.log('Updated Product:', updatedProduct) // Debug: Log updated product

        const formData = new FormData()

        // Product data
        formData.append('product[id]', updatedProduct.id)
        formData.append('product[name]', updatedProduct.name?.trim() || originalProduct.name)
        formData.append(
          'product[description]',
          updatedProduct.description?.trim() || originalProduct.description,
        )
        formData.append('product[unit]', updatedProduct.unit || originalProduct.unit || 'pack')
        formData.append('product[is_publish]', updatedProduct.status === 'active' ? 1 : 0)
        formData.append(
          'product[category_id]',
          updatedProduct.category_id || originalProduct.category_id,
        )

        // Thumbnail
        if (updatedProduct.thumbnail instanceof File) {
          formData.append('product[thumbnail]', updatedProduct.thumbnail)
          console.log('Thumbnail File:', updatedProduct.thumbnail.name) // Debug: Log thumbnail
        }

        // Variants
        const originalVariants = originalProduct.variations || []
        const updatedVariants = updatedProduct.variations || []

        console.log('Original Variants:', originalVariants) // Debug: Log original variants
        console.log('Updated Variants:', updatedVariants) // Debug: Log updated variants

        // Add new variants
        updatedVariants
          .filter((v) => !v.id)
          .forEach((variant, index) => {
            formData.append(`variants[add][${index}][name]`, variant.name?.trim() || '')
            formData.append(`variants[add][${index}][price]`, parseFloat(variant.price) || 0)
            formData.append(`variants[add][${index}][weight]`, parseFloat(variant.weight) || 0)
            formData.append(`variants[add][${index}][stock]`, parseInt(variant.stock) || 0)
            formData.append(`variants[add][${index}][min_qty]`, parseInt(variant.min_qty) || 1)
            formData.append(`variants[add][${index}][is_default]`, variant.is_default ? 1 : 0)
          })

        // Update existing variants
        updatedVariants
          .filter((variant) => variant.id)
          .forEach((variant, index) => {
            const originalVariant = originalVariants.find((v) => v.id === variant.id) || {}
            formData.append(`variants[update][${index}][id]`, variant.id)
            formData.append(
              `variants[update][${index}][name]`,
              variant.name?.trim() || originalVariant.name || '',
            )
            formData.append(
              `variants[update][${index}][price]`,
              parseFloat(variant.price) || originalVariant.price || 0,
            )
            formData.append(
              `variants[update][${index}][weight]`,
              parseFloat(variant.weight) || originalVariant.weight || 0,
            )
            formData.append(
              `variants[update][${index}][stock]`,
              parseInt(variant.stock) || originalVariant.stock || 0,
            )
            formData.append(
              `variants[update][${index}][min_qty]`,
              parseInt(variant.min_qty) || originalVariant.min_qty || 1,
            )
            formData.append(`variants[update][${index}][is_default]`, variant.is_default ? 1 : 0)
          })

        // Delete variants
        originalVariants
          .filter((original) => !updatedVariants.some((v) => v.id === original.id))
          .forEach((variant) => {
            formData.append(`variants[delete][]`, variant.id)
            console.log(`Deleting Variant ID: ${variant.id}`) // Debug: Log deleted variant
          })

        // Finishings
        const originalFinishings = originalProduct.additionalOptions || []
        const updatedFinishings = updatedProduct.product_finishing || []

        console.log('Original Finishings:', originalFinishings) // Debug: Log original finishings
        console.log('Updated Finishings:', updatedFinishings) // Debug: Log updated finishings

        // Add new finishings
        updatedFinishings
          .filter((f) => !f.id)
          .forEach((finishing, index) => {
            if (finishing.name) {
              formData.append(`finishings[add][${index}][name]`, finishing.name?.trim())
              formData.append(`finishings[add][${index}][price]`, parseFloat(finishing.price) || 0)
              if (finishing.color_code) {
                formData.append(`finishings[add][${index}][color_code]`, finishing.color_code)
              }
            }
          })

        // Update existing finishings
        updatedFinishings
          .filter((finishing) => finishing.id)
          .forEach((finishing, index) => {
            const originalFinishing = originalFinishings.find((f) => f.id === finishing.id) || {}
            formData.append(`finishings[update][${index}][id]`, finishing.id)
            formData.append(
              `finishings[update][${index}][name]`,
              finishing.name?.trim() || originalFinishing.name || '',
            )
            formData.append(
              `finishings[update][${index}][price]`,
              parseFloat(finishing.price) || originalFinishing.price || 0,
            )
            if (finishing.color_code) {
              formData.append(
                `finishings[update][${index}][color_code]`,
                finishing.color_code || originalFinishing.color_code || '#000000',
              )
            }
          })

        // Delete finishings
        originalFinishings
          .filter((original) => !updatedFinishings.some((f) => f.id === original.id))
          .forEach((finishing) => {
            formData.append(`finishings[delete][]`, finishing.id)
            console.log(`Deleting Finishing ID: ${finishing.id}`) // Debug: Log deleted finishing
          })

        // Images
        const originalImages = originalProduct.images || []
        const newImages = updatedProduct.images || []

        console.log('Original Images:', originalImages) // Debug: Log original images
        console.log('New Images:', newImages) // Debug: Log new images

        // Add new images
        newImages
          .filter((img) => img.file instanceof File)
          .forEach((image, index) => {
            formData.append(`images[add][${index}][image]`, image.file)
            formData.append(
              `images[add][${index}][alt_text]`,
              image.alt_text || `Image ${index + 1}`,
            )
            formData.append(`images[add][${index}][is_primary]`, image.is_primary ? 1 : 0)
            formData.append(`images[add][${index}][sort_order]`, image.sort_order || index + 1)
            console.log(`Adding Image: ${image.file.name}`) // Debug: Log added image
          })

        // Update existing images
        newImages
          .filter((img) => img.id)
          .forEach((img, index) => {
            formData.append(`images[update][${index}][id]`, img.id)
            formData.append(`images[update][${index}][is_primary]`, img.is_primary ? 1 : 0)
            formData.append(`images[update][${index}][sort_order]`, img.sort_order || index + 1)
            if (img.file instanceof File) {
              formData.append(`images[update][${index}][image]`, img.file)
              console.log(`Updating Image ID ${img.id} with file: ${img.file.name}`) // Debug: Log updated image
            }
          })

        // Delete images
        originalImages
          .filter((originalImg) => !newImages.some((img) => img.id === originalImg.id))
          .forEach((image) => {
            formData.append(`images[delete][]`, image.id)
            console.log(`Deleting Image ID: ${image.id}`) // Debug: Log deleted image
          })

        // Validation
        if (!updatedProduct.name || !updatedProduct.description || !updatedProduct.unit) {
          throw new Error('Nama, deskripsi, dan unit wajib diisi')
        }

        // Debug: Log FormData
        for (const [key, value] of formData.entries()) {
          console.log(`Update Product FormData ${key}:`, value instanceof File ? value.name : value)
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/seller/product/update/bulk`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        )

        console.log('API Response:', response.data) // Debug: Log API response

        // Update local state
        const index = this.products.findIndex((p) => p.id === updatedProduct.id)
        if (index !== -1) {
          this.products.splice(index, 1, {
            ...response.data.data.product,
            category: this.getCategoryName(response.data.data.product.category_id),
            category_id: response.data.data.product.category_id,
            status: response.data.data.product.is_publish ? 'active' : 'inactive',
            stock_total: parseInt(response.data.data.product.stock_total) || 0,
            unit: response.data.data.product.unit || 'pack',
            weight: parseInt(response.data.data.product.weight) || 0,
            thumbnail_url:
              response.data.data.product.thumbnail_url || 'https://placehold.co/1000x1000',
            images:
              response.data.data.images?.map((img) => ({
                id: img.id,
                image_url: img.image_url,
                alt_text: img.alt_text,
                is_primary: img.is_primary,
                sort_order: img.sort_order,
              })) || [],
            variant_count: response.data.data.variants?.length || 0,
            finishing_count: response.data.data.finishings?.length || 0,
            variations:
              response.data.data.variants?.map((v) => ({
                id: v.id,
                name: v.name,
                price: parseFloat(v.price),
                stock: parseInt(v.stock),
                weight: parseFloat(v.weight),
                min_qty: parseInt(v.min_qty) || 1,
                is_default: v.is_default,
              })) || [],
            additionalOptions:
              response.data.data.finishings?.map((f) => ({
                id: f.id,
                name: f.name,
                price: parseFloat(f.price),
                color_code: f.color_code || '#000000',
              })) || [],
          })
          this.showSuccessMessage('Produk berhasil diperbarui')
        }
      } catch (error) {
        console.error('Update product error:', error.response?.data || error.message)
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.error || error.message || 'Gagal memperbarui produk',
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
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/seller/products/${this.currentProduct.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        this.products = this.products.filter((p) => p.id !== this.currentProduct.id)
        this.showSuccessMessage('Produk berhasil dihapus')
      } catch (error) {
        console.error('Error deleting product:', error.response?.data || error.message)
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
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const isPublish = newStatus === 'active' ? 1 : 0
        await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/seller/products/${this.currentProduct.id}/status`,
          { is_publish: isPublish },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        const product = this.products.find((p) => p.id === this.currentProduct.id)
        if (product) {
          product.status = newStatus
          this.showSuccessMessage('Status produk berhasil diubah')
        }
      } catch (error) {
        console.error('Error changing status:', error.response?.data || error.message)
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

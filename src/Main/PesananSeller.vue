<template>
  <div class="flex flex-col min-h-screen">
    <!-- Overlay for sidebar on mobile -->
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
            placeholder="Cari pesanan..."
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
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6 mt-12 lg:mt-3">Pesanan</h2>
        <!-- Filter and Entries Row -->
        <div class="flex flex-wrap justify-between items-center mb-6">
          <!-- Filter Dropdown -->
          <div class="mb-4 md:mb-0">
            <select
              v-model="statusFilter"
              class="block w-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              @change="fetchOrders"
            >
              <option value="all">Semua</option>
              <option v-for="status in orderStatuses" :key="status.id" :value="status.id">
                {{ status.name }}
              </option>
            </select>
          </div>
          <!-- Add Order Button -->
          <div class="mb-4">
            <button
              @click="openAddOrderModal"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <span class="mr-2">+</span> Tambah Pesanan
            </button>
          </div>
        </div>
        <!-- Entries per page -->
        <div class="mb-4">
          <label for="entriesPerPage" class="mr-2">Entries per page:</label>
          <select
            v-model="entriesPerPage"
            class="p-2 border border-gray-300 rounded-md"
            @change="updatePagination"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="flex justify-center items-center py-10">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        </div>

        <!-- No orders message -->
        <div v-else-if="orders.length === 0" class="text-center py-10">
          <p class="text-lg text-gray-600">Tidak ada pesanan ditemukan.</p>
        </div>

        <!-- Responsive Table -->
        <div v-else class="overflow-auto rounded-lg shadow-md">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-red-600 text-white">
              <tr>
                <th class="p-4 text-center border-r border-gray-300">Nomor Pesanan</th>
                <th class="p-4 text-center border-r border-gray-300">Nama Pembeli</th>
                <th class="p-4 text-center border-r border-gray-300">Tanggal Pesanan</th>
                <th class="p-4 text-center border-r border-gray-300">Total</th>
                <th class="p-4 text-center border-r border-gray-300">Status</th>
                <th class="p-4 text-center">Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in paginatedOrders" :key="order.id" class="text-center">
                <td class="p-4 text-center border-r border-gray-300">#{{ order.id }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ order.user.name }}</td>
                <td class="p-4 text-center border-r border-gray-300">
                  {{ formatDate(order.created_at) }}
                </td>
                <td class="p-4 text-center border-r border-gray-300">
                  {{ formatCurrency(order.grand_total) }}
                </td>
                <td class="p-4 border-r border-gray-300">
                  <div class="flex justify-center">
                    <select
                      v-model="order.order_status_id"
                      :class="getStatusClass(order.order_status_id)"
                      class="w-40 py-2 px-4 rounded-lg text-white"
                      @change="confirmStatusChange(order)"
                    >
                      <option
                        v-for="status in orderStatuses"
                        :key="status.id"
                        :value="status.id"
                        :class="getStatusBgClass(status.id)"
                        :disabled="!isStatusAllowed(order.prevStatusId, status.id)"
                      >
                        {{ status.name }}
                      </option>
                    </select>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <button @click="viewOrderDetail(order)" class="text-blue-500 hover:underline">
                    Lihat Detail
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="orders.length > 0"
          class="mt-6 flex flex-col md:flex-row justify-between items-center"
        >
          <div class="text-sm text-gray-600 mb-4 md:mb-0">
            Showing {{ paginationStart }} to {{ paginationEnd }} of
            {{ filteredOrders.length }} entries
          </div>
          <div class="flex justify-center items-center space-x-2">
            <!-- First Page -->
            <button
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded-md border"
              :class="
                currentPage === 1
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'border-gray-300 hover:bg-gray-100'
              "
            >
              «
            </button>

            <!-- Previous Page -->
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded-md border"
              :class="
                currentPage === 1
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
                    currentPage === page
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
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages || totalPages === 0"
              class="px-3 py-1 rounded-md border"
              :class="
                currentPage === totalPages || totalPages === 0
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'border-gray-300 hover:bg-gray-100'
              "
            >
              ›
            </button>

            <!-- Last Page -->
            <button
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages || totalPages === 0"
              class="px-3 py-1 rounded-md border"
              :class="
                currentPage === totalPages || totalPages === 0
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
  </div>
</template>

<script>
import { debounce } from 'lodash'
import HeaderSeller from '@/components/HeaderSeller.vue'
import SidebarSeller from '@/components/SidebarSeller.vue'
import FooterSeller from '@/components/FooterSeller.vue'
import Swal from 'sweetalert2'
import axios from 'axios'

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      statusFilter: 'all',
      entriesPerPage: 10,
      currentPage: 1,
      searchQuery: '',
      loading: false,
      orders: [],
      orderStatuses: [],
    }
  },
  computed: {
    filteredOrders() {
      let result = this.orders

      // Filter by status if not "all"
      if (this.statusFilter !== 'all') {
        result = result.filter((order) => order.order_status_id === parseInt(this.statusFilter))
      }

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(
          (order) =>
            order.id.toString().includes(query) ||
            order.user.name.toLowerCase().includes(query) ||
            (order.address && order.address.toLowerCase().includes(query)),
        )
      }

      return result
    },
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.entriesPerPage) || 1
    },
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.entriesPerPage
      const end = start + parseInt(this.entriesPerPage)
      return this.filteredOrders.slice(start, end)
    },
    paginationStart() {
      return this.filteredOrders.length === 0 ? 0 : (this.currentPage - 1) * this.entriesPerPage + 1
    },
    paginationEnd() {
      const calculatedEnd = this.currentPage * this.entriesPerPage
      return calculatedEnd > this.filteredOrders.length ? this.filteredOrders.length : calculatedEnd
    },
    displayedPages() {
      const totalVisiblePages = 5
      const pages = []

      if (this.totalPages <= totalVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        let startPage = Math.max(2, this.currentPage - Math.floor((totalVisiblePages - 3) / 2))
        let endPage = Math.min(this.totalPages - 1, startPage + totalVisiblePages - 4)

        if (endPage === this.totalPages - 1) {
          startPage = Math.max(2, endPage - (totalVisiblePages - 4))
        }

        if (startPage > 2) {
          pages.push('...')
        }

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }

        if (endPage < this.totalPages - 1) {
          pages.push('...')
        }

        pages.push(this.totalPages)
      }

      return pages
    },
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
    this.setupAxiosAuth()
    this.fetchOrderStatuses().then(() => this.fetchOrders())
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    debouncedSearch: debounce(function () {
      this.currentPage = 1
      this.updatePagination()
    }, 300),
    setupAxiosAuth() {
      const token = localStorage.getItem('token') || this.getCookie('token')
      if (!token) {
        console.warn('Authentication token not found. User might not be logged in.')
        return
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    getCookie(name) {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
      return null
    },
    async fetchUserByIdentifier(identifier) {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token)
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/order/user`)
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/seller/order/user`, {
          params: { parameter: identifier },
        })
        if (response.data.status === 'success' && response.data.data) {
          return response.data.data
        }
        return null
      } catch (error) {
        console.error('Error fetching user data:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          this.handleAuthError()
        }
        return null
      } finally {
        console.log('Finally block executed')
        this.loading = false
      }
    },
    async fetchCategories() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token)
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/category`)
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/seller/category`)
        if (response.data.status === 'success') {
          return response.data.data
        }
        return []
      } catch (error) {
        console.error('Error fetching categories:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          this.handleAuthError()
        }
        this.showErrorMessage('Gagal memuat kategori. Silakan coba lagi.')
        return []
      } finally {
        console.log('Finally block executed')
        this.loading = false
      }
    },
    async fetchProductsByCategory(categoryId) {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token)
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/products`)
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/seller/products`, {
          params: { category_id: categoryId },
        })
        if (response.data.status === 'success') {
          return response.data.data.data.products
        }
        return []
      } catch (error) {
        console.error('Error fetching products:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          this.handleAuthError()
        }
        this.showErrorMessage('Gagal memuat produk. Silakan coba lagi.')
        return []
      } finally {
        console.log('Finally block executed')
        this.loading = false
      }
    },
    async fetchProductFinishings(productId) {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token)
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/product/finishing`)
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/seller/product/finishing`,
          { params: { product_id: productId } },
        )
        if (response.data.status === 'success') {
          return response.data.data
        }
        return []
      } catch (error) {
        console.error('Error fetching product finishings:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          this.handleAuthError()
        }
        this.showErrorMessage('Gagal memuat finishing produk. Silakan coba lagi.')
        return []
      } finally {
        console.log('Finally block executed')
        this.loading = false
      }
    },
    async fetchProductVariants(productId) {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token)
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/product/variant`)
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/seller/product/variant`,
          { params: { product_id: productId } },
        )
        if (response.data.status === 'success') {
          return response.data.data
        }
        return []
      } catch (error) {
        console.error('Error fetching product variants:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          this.handleAuthError()
        }
        this.showErrorMessage('Gagal memuat varian produk. Silakan coba lagi.')
        return []
      } finally {
        console.log('Finally block executed')
        this.loading = false
      }
    },
    async submitOrder(orderData) {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token)
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/orders`)
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        console.log('Order Data:', orderData)
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/seller/orders`,
          orderData,
        )
        if (response.data.status === 'success') {
          this.showSuccessMessage('Pesanan berhasil ditambahkan')
          return true
        }
        throw new Error(response.data.message || 'Failed to create order')
      } catch (error) {
        console.error('Error creating order:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          this.handleAuthError()
        }
        this.showErrorMessage(
          error.response?.data?.message || 'Gagal menambahkan pesanan. Silakan coba lagi.',
        )
        return false
      } finally {
        console.log('Finally block executed')
        this.loading = false
      }
    },
    async fetchOrders() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token)
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/orders`)
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/seller/orders`)
        if (response.data.status === 'success') {
          this.orders = response.data.data.map((order) => ({
            ...order,
            prevStatusId: order.order_status_id,
          }))
        } else {
          throw new Error('Failed to fetch orders')
        }
      } catch (error) {
        console.error('Error fetching orders:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          this.handleAuthError()
        } else {
          this.showErrorMessage('Gagal memuat pesanan. Silakan coba lagi.')
        }
        this.orders = []
      } finally {
        console.log('Finally block executed')
        this.loading = false
      }
    },
    async fetchOrderStatuses() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token)
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/orders/status`)
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/seller/orders/status`,
        )
        if (response.data.status === 'success') {
          // Filter out the "Belum Dibayar" status (id: 5)
          this.orderStatuses = response.data.data.filter((status) => status.id !== 5)
        } else {
          throw new Error('Failed to fetch order statuses')
        }
      } catch (error) {
        console.error('Error fetching order statuses:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          this.handleAuthError()
        } else {
          this.showErrorMessage('Gagal memuat status pesanan. Silakan coba lagi.')
        }
        this.orderStatuses = []
      } finally {
        console.log('Finally block executed')
        this.loading = false
      }
    },
    async updateOrderStatus(orderId, statusId) {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token)
        console.log(
          'API URL:',
          `${import.meta.env.VITE_API_BASE_URL}/seller/orders/${orderId}/status`,
        )
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/seller/orders/${orderId}/status`,
          { order_status_id: statusId },
        )
        if (response.data.status === 'success') {
          this.showSuccessMessage('Status pesanan berhasil diperbarui')
          return true
        }
        throw new Error('Failed to update order status')
      } catch (error) {
        console.error('Error updating order status:', error.response?.data || error.message)
        if (error.response?.status === 401) {
          this.handleAuthError()
        } else {
          this.showErrorMessage('Gagal mengubah status pesanan. Silakan coba lagi.')
        }
        return false
      } finally {
        console.log('Finally block executed')
        this.loading = false
      }
    },
    handleAuthError() {
      Swal.fire({
        icon: 'error',
        title: 'Sesi Berakhir',
        text: 'Sesi login Anda telah berakhir. Silakan login kembali.',
        confirmButtonText: 'Login',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
      })
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount)
    },
    showErrorMessage(message) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
        },
      })
    },
    showSuccessMessage(message) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: message,
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
        },
      })
    },
    getStatusClass(statusId) {
      const status = this.orderStatuses.find((s) => s.id === statusId)
      if (!status) return 'bg-gray-500'
      switch (statusId) {
        case 1:
          return 'bg-blue-600'
        case 2:
          return 'bg-yellow-500'
        case 3:
          return 'bg-purple-600'
        case 4:
          return 'bg-green-600'
        case 5:
          return 'bg-red-600'
        default:
          return 'bg-gray-500'
      }
    },
    getStatusBgClass(statusId) {
      const status = this.orderStatuses.find((s) => s.id === statusId)
      if (!status) return 'bg-gray-500'
      switch (statusId) {
        case 1:
          return 'bg-blue-600 text-white'
        case 2:
          return 'bg-yellow-500 text-white'
        case 3:
          return 'bg-purple-600 text-white'
        case 4:
          return 'bg-green-600 text-white'
        case 5:
          return 'bg-red-600 text-white'
        default:
          return 'bg-gray-500 text-white'
      }
    },
    isStatusAllowed(prevStatusId, newStatusId) {
      if (prevStatusId === newStatusId) return true
      const prevIndex = this.orderStatuses.findIndex((s) => s.id === prevStatusId)
      const newIndex = this.orderStatuses.findIndex((s) => s.id === newStatusId)
      return newIndex > prevIndex
    },
    async confirmStatusChange(order) {
      const originalStatusId = order.prevStatusId
      const newStatusId = order.order_status_id
      if (originalStatusId === newStatusId) return
      const newStatus = this.orderStatuses.find((s) => s.id === newStatusId)
      if (!newStatus) return
      Swal.fire({
        title: `<span class='text-xl font-bold'>Konfirmasi Perubahan Status</span>`,
        html: `<p class='text-lg'>Apakah Anda yakin ingin mengubah status pesanan #${order.id} menjadi ${newStatus.name}?</p>`,
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md mr-4',
          cancelButton: 'bg-gray-200 text-black py-2 w-24 rounded-md',
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const success = await this.updateOrderStatus(order.id, newStatusId)
          if (success) {
            order.prevStatusId = newStatusId
          } else {
            order.order_status_id = originalStatusId
          }
        } else {
          order.order_status_id = originalStatusId
        }
      })
    },

    viewOrderDetail(order) {
      const productsHtml = this.createProductsCarousel(order)
      Swal.fire({
        title: `<span class='text-xl sm:text-2xl font-bold'>Detail Pesanan #${order.id}</span>`,
        html: `
      <div class="text-left mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-[120px_10px_auto] gap-y-2 text-base sm:text-lg">
          <div class="font-semibold">Pembeli</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.user.name}</div>
          <div class="font-semibold">Alamat</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.address || '-'}</div>
          <div class="font-semibold">Tanggal</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.formatDate(order.created_at)}</div>
          <div class="font-semibold">Status</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.getStatusName(order.order_status_id)}</div>
          <div class="font-semibold">Total</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.formatCurrency(order.grand_total)}</div>
        </div>
        ${
          order.additional_info
            ? `
        <div class="mt-4">
          <div class="font-semibold">Informasi Tambahan:</div>
          <div class="mt-2 p-3 bg-gray-100 rounded-lg">${order.additional_info}</div>
        </div>`
            : ''
        }
      </div>
      <div class="mt-4">
        <div class="font-semibold text-lg mb-2">Produk (${order.order_detail.length}):</div>
        ${productsHtml}
      </div>
    `,
        width: 'auto',
        customClass: {
          popup: 'swal-responsive-popup',
          confirmButton: 'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-base mt-6',
          htmlContainer: 'overflow-y-auto',
        },
        confirmButtonText: 'Tutup',
        buttonsStyling: false,
        didOpen: () => {
          this.initProductCarousel(order.order_detail.length)
          const style = document.createElement('style')
          style.innerHTML = `
        .swal-responsive-popup {
          width: 95% !important;
          max-width: 800px !important;
        }
        @media (min-width: 640px) {
          .swal-responsive-popup {
            width: 80% !important;
          }
        }
        @media (min-width: 1024px) {
          .swal-responsive-popup {
            width: 60% !important;
          }
        }
        @media (min-width: 1280px) {
          .swal-responsive-popup {
            width: 50% !important;
          }
        }
      `
          document.head.appendChild(style)
        },
      })
    },
    openAddOrderModal() {
      let selectedUser = null
      let categories = []
      let productsByCategory = {}
      let finishingsByProduct = {}
      let variantsByProduct = {}
      let productPrices = {}
      const self = this
      const updateProductPrice = (productItem) => {
        const productSelect = productItem.querySelector('.product-name')
        const finishingSelect = productItem.querySelector('.product-finishing')
        const variantSelect = productItem.querySelector('.product-variant')
        const quantityInput = productItem.querySelector('.product-qty')
        const priceDisplay = productItem.querySelector('.product-price')
        if (!productSelect.value || !quantityInput.value) return
        const productId = productSelect.value
        const quantity = parseInt(quantityInput.value) || 0
        let basePrice = productPrices[productId] || 0
        if (finishingSelect.value && finishingsByProduct[productId]) {
          const selectedFinishing = finishingsByProduct[productId].find(
            (f) => f.id == finishingSelect.value,
          )
          if (selectedFinishing) {
            basePrice += selectedFinishing.price
          }
        }
        const totalPrice = basePrice * quantity
        priceDisplay.textContent = self.formatCurrency(totalPrice)
        updateSubtotal()
      }
      const updateSubtotal = () => {
        const priceDisplays = document.querySelectorAll('.product-price')
        let subtotal = 0
        priceDisplays.forEach((display) => {
          const priceText = display.textContent.replace(/[^\d]/g, '')
          subtotal += parseInt(priceText) || 0
        })
        const subtotalDisplay = document.getElementById('orderSubtotal')
        if (subtotalDisplay) {
          subtotalDisplay.textContent = self.formatCurrency(subtotal)
        }
      }
      this.fetchCategories()
        .then((fetchedCategories) => {
          categories = fetchedCategories
          Swal.fire({
            title: '<span class="text-xl font-bold">Tambah Pesanan Baru</span>',
            html: `
  <form id="addOrderForm" class="text-left">
    <div class="mb-4">
      <h4 class="font-semibold mb-3 pb-2 border-b">Informasi Pembeli</h4>
      <div class="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Identitas Pembeli (Nama/Username/Email)</label>
          <input
            id="customerIdentifier"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Masukkan nama, username, atau email"
            required
          />
        </div>
        <div class="flex items-end">
          <button
            type="button"
            id="searchCustomer"
            class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
          >
            Cari
          </button>
        </div>
      </div>
      <div id="customerResult" class="mt-3"></div>
    </div>
    <div class="mb-4">
      <h4 class="font-semibold mb-3 pb-2 border-b">Produk</h4>
      <div id="productItems">
        <div class="mb-4 p-3 bg-gray-50 rounded-lg product-item">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label class="block text-sm font-medium mb-1">Kategori</label>
              <select class="product-category w-full p-2 border border-gray-300 rounded-md">
                <option value="">Pilih Kategori</option>
                ${categories.map((category) => `<option value="${category.id}">${category.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Produk</label>
              <select class="product-name w-full p-2 border border-gray-300 rounded-md" disabled>
                <option value="">Pilih Produk</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label class="block text-sm font-medium mb-1">Finishing</label>
              <select class="product-finishing w-full p-2 border border-gray-300 rounded-md" disabled>
                <option value="">Pilih Finishing</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Variasi</label>
              <select class="product-variant w-full p-2 border border-gray-300 rounded-md" disabled>
                <option value="">Pilih Variasi</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label class="block text-sm font-medium mb-1">Jumlah</label>
              <input type="number" min="1" value="1" class="product-qty w-full p-2 border border-gray-300 rounded-md" required>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Harga</label>
              <div class="p-2 bg-gray-100 rounded-md product-price">Rp 0</div>
            </div>
            <div class="product-preview flex justify-center items-center">
              <div class="text-center text-sm text-gray-500">Preview produk akan ditampilkan di sini</div>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        id="addMoreProduct"
        class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        + Tambah Produk Lain
      </button>
      <div class="mt-4 p-3 bg-gray-100 rounded-lg">
        <div class="flex justify-between items-center">
          <span class="font-semibold">Total Pesanan:</span>
          <span id="orderSubtotal" class="font-bold text-lg">Rp 0</span>
        </div>
      </div>
    </div>
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1">Informasi Tambahan</label>
      <textarea
        id="additionalInfo"
        class="w-full p-2 border border-gray-300 rounded-md"
        rows="2"
        placeholder="Tambahkan catatan atau instruksi khusus"
      ></textarea>
    </div>
  </form>
  `,
            showCancelButton: true,
            confirmButtonText: 'Tambah Pesanan',
            cancelButtonText: 'Batal',
            buttonsStyling: false,
            customClass: {
              confirmButton: 'bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md mr-4',
              cancelButton: 'bg-gray-200 hover:bg-gray-300 text-black py-2 px-4 rounded-md',
              htmlContainer: 'overflow-y-auto max-h-[70vh]',
            },
            didOpen: () => {
              document.getElementById('searchCustomer').addEventListener('click', async () => {
                const identifier = document.getElementById('customerIdentifier').value.trim()
                if (!identifier) {
                  Swal.showValidationMessage('Silakan masukkan identitas pembeli')
                  return
                }
                const customerResultDiv = document.getElementById('customerResult')
                customerResultDiv.innerHTML = '<div class="text-center py-2">Mencari...</div>'
                const user = await self.fetchUserByIdentifier(identifier)
                if (user) {
                  selectedUser = user
                  customerResultDiv.innerHTML = `
          <div class="mt-2 p-3 bg-gray-100 rounded-lg">
            <div class="font-medium text-green-600">Pengguna ditemukan!</div>
            <div class="mt-1">Nama: ${user.name}</div>
            <input type="hidden" id="selectedUserId" value="${user.id}">
          </div>
        `
                } else {
                  customerResultDiv.innerHTML = `
          <div class="mt-2 p-3 bg-red-100 rounded-lg">
            <div class="font-medium text-red-600">Pengguna tidak ditemukan</div>
            <div class="mt-1">Silakan periksa kembali identitas yang dimasukkan</div>
          </div>
        `
                }
              })
              const setupCategoryListener = (productItem) => {
                const categorySelect = productItem.querySelector('.product-category')
                const productSelect = productItem.querySelector('.product-name')
                categorySelect.addEventListener('change', async function () {
                  const categoryId = this.value
                  productSelect.innerHTML = '<option value="">Pilih Produk</option>'
                  const finishingSelect = productItem.querySelector('.product-finishing')
                  const variantSelect = productItem.querySelector('.product-variant')
                  finishingSelect.innerHTML = '<option value="">Pilih Finishing</option>'
                  finishingSelect.disabled = true
                  variantSelect.innerHTML = '<option value="">Pilih Variasi</option>'
                  variantSelect.disabled = true
                  const priceDisplay = productItem.querySelector('.product-price')
                  priceDisplay.textContent = self.formatCurrency(0)
                  updateSubtotal()
                  if (categoryId) {
                    productSelect.disabled = true
                    productSelect.innerHTML = '<option value="">Loading...</option>'
                    try {
                      console.log('Fetching products for categoryId:', categoryId)
                      if (!productsByCategory[categoryId]) {
                        productsByCategory[categoryId] =
                          await self.fetchProductsByCategory(categoryId)
                        console.log('Fetched products:', productsByCategory[categoryId])
                      }
                      const products = productsByCategory[categoryId]
                      productSelect.innerHTML = '<option value="">Pilih Produk</option>'
                      if (products && products.length > 0) {
                        products.forEach((product) => {
                          const option = document.createElement('option')
                          option.value = product.id
                          option.textContent = product.name
                          option.dataset.image = product.image || ''
                          option.dataset.price = product.price || 0
                          productSelect.appendChild(option)
                          productPrices[product.id] = parseFloat(product.price) || 0
                        })
                      } else {
                        productSelect.innerHTML =
                          '<option value="">Tidak ada produk tersedia</option>'
                      }
                    } catch (error) {
                      console.error('Error fetching products:', error)
                      productSelect.innerHTML = '<option value="">Error loading products</option>'
                    } finally {
                      productSelect.disabled = false
                    }
                  } else {
                    productSelect.disabled = true
                  }
                })
              }
              const setupProductListener = (productItem) => {
                const productSelect = productItem.querySelector('.product-name')
                const finishingSelect = productItem.querySelector('.product-finishing')
                const variantSelect = productItem.querySelector('.product-variant')
                const quantityInput = productItem.querySelector('.product-qty')
                const previewDiv = productItem.querySelector('.product-preview')
                productSelect.addEventListener('change', async function () {
                  const productId = this.value
                  finishingSelect.innerHTML = '<option value="">Pilih Finishing</option>'
                  finishingSelect.disabled = true
                  variantSelect.innerHTML = '<option value="">Pilih Variasi</option>'
                  variantSelect.disabled = true
                  if (productId) {
                    const selectedOption = productSelect.options[productSelect.selectedIndex]
                    const imageUrl = selectedOption.dataset.image
                    updateProductPrice(productItem)
                    if (imageUrl) {
                      previewDiv.innerHTML = `<img src="${imageUrl}" alt="Product Preview" class="max-h-20 max-w-full">`
                    } else {
                      previewDiv.innerHTML = `<div class="text-center text-sm text-gray-500">Tidak ada gambar</div>`
                    }
                    try {
                      console.log('Fetching finishings for productId:', productId)
                      finishingSelect.disabled = true
                      finishingSelect.innerHTML = '<option value="">Loading...</option>'
                      if (!finishingsByProduct[productId]) {
                        finishingsByProduct[productId] =
                          await self.fetchProductFinishings(productId)
                        console.log('Fetched finishings:', finishingsByProduct[productId])
                      }
                      const finishings = finishingsByProduct[productId]
                      finishingSelect.innerHTML = '<option value="">Pilih Finishing</option>'
                      if (finishings && finishings.length > 0) {
                        finishings.forEach((finishing) => {
                          const option = document.createElement('option')
                          option.value = finishing.id
                          option.textContent = `${finishing.finishing.name} (+${self.formatCurrency(finishing.price)})`
                          finishingSelect.appendChild(option)
                        })
                        finishingSelect.disabled = false
                      } else {
                        finishingSelect.innerHTML = '<option value="">Tidak Ada Finishing</option>'
                      }
                      console.log('Fetching variants for productId:', productId)
                      variantSelect.disabled = true
                      variantSelect.innerHTML = '<option value="">Loading...</option>'
                      if (!variantsByProduct[productId]) {
                        variantsByProduct[productId] = await self.fetchProductVariants(productId)
                        console.log('Fetched variants:', variantsByProduct[productId])
                      }
                      const variants = variantsByProduct[productId]
                      variantSelect.innerHTML = '<option value="">Pilih Variasi</option>'
                      if (variants && variants.length > 0) {
                        variants.forEach((variant) => {
                          const option = document.createElement('option')
                          option.value = variant.id
                          option.textContent = variant.name
                          variantSelect.appendChild(option)
                        })
                        variantSelect.disabled = false
                      } else {
                        variantSelect.innerHTML = '<option value="">Tidak Ada Variasi</option>'
                      }
                    } catch (error) {
                      console.error('Error fetching product details:', error)
                      finishingSelect.innerHTML =
                        '<option value="">Error loading finishings</option>'
                      variantSelect.innerHTML = '<option value="">Error loading variants</option>'
                    }
                  } else {
                    previewDiv.innerHTML = `<div class="text-center text-sm text-gray-500">Preview produk akan ditampilkan di sini</div>`
                    const priceDisplay = productItem.querySelector('.product-price')
                    priceDisplay.textContent = self.formatCurrency(0)
                    updateSubtotal()
                  }
                })
                finishingSelect.addEventListener('change', () => updateProductPrice(productItem))
                variantSelect.addEventListener('change', () => updateProductPrice(productItem))
                quantityInput.addEventListener('change', () => updateProductPrice(productItem))
                quantityInput.addEventListener('input', () => updateProductPrice(productItem))
              }
              const initialProductItem = document.querySelector('.product-item')
              setupCategoryListener(initialProductItem)
              setupProductListener(initialProductItem)
              document.getElementById('addMoreProduct').addEventListener('click', () => {
                const productItems = document.getElementById('productItems')
                const newItem = document.createElement('div')
                newItem.className = 'mb-4 p-3 bg-gray-50 rounded-lg product-item'
                newItem.innerHTML = `
        <div class="flex justify-between mb-2">
          <h5 class="font-medium">Produk Tambahan</h5>
          <button type="button" class="text-red-600 hover:text-red-800 remove-product">
            Hapus
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label class="block text-sm font-medium mb-1">Kategori</label>
            <select class="product-category w-full p-2 border border-gray-300 rounded-md">
              <option value="">Pilih Kategori</option>
              ${categories.map((category) => `<option value="${category.id}">${category.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Produk</label>
            <select class="product-name w-full p-2 border border-gray-300 rounded-md" disabled>
              <option value="">Pilih Produk</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label class="block text-sm font-medium mb-1">Finishing</label>
            <select class="product-finishing w-full p-2 border border-gray-300 rounded-md" disabled>
              <option value="">Pilih Finishing</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Variasi</label>
            <select class="product-variant w-full p-2 border border-gray-300 rounded-md" disabled>
              <option value="">Pilih Variasi</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <label class="block text-sm font-medium mb-1">Jumlah</label>
            <input type="number" min="1" value="1" class="product-qty w-full p-2 border border-gray-300 rounded-md" required>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Harga</label>
            <div class="p-2 bg-gray-100 rounded-md product-price">Rp 0</div>
          </div>
          <div class="product-preview flex justify-center items-center">
            <div class="text-center text-sm text-gray-500">Preview produk akan ditampilkan di sini</div>
          </div>
        </div>
      `
                productItems.appendChild(newItem)
                setupCategoryListener(newItem)
                setupProductListener(newItem)
                const removeButton = newItem.querySelector('.remove-product')
                removeButton.addEventListener('click', function () {
                  this.closest('.product-item').remove()
                  updateSubtotal()
                })
              })
            },
            preConfirm: () => {
              const form = document.getElementById('addOrderForm')
              if (!form.checkValidity()) {
                form.reportValidity()
                return false
              }
              const selectedUserId = document.getElementById('selectedUserId')
              if (!selectedUserId || !selectedUserId.value) {
                Swal.showValidationMessage('Silakan pilih pembeli terlebih dahulu')
                return false
              }
              const productItems = document.querySelectorAll('.product-item')
              const products = []
              for (const item of productItems) {
                const productSelect = item.querySelector('.product-name')
                const finishingSelect = item.querySelector('.product-finishing')
                const variantSelect = item.querySelector('.product-variant')
                const quantityInput = item.querySelector('.product-qty')
                if (!productSelect.value) {
                  Swal.showValidationMessage('Silakan pilih produk untuk semua item')
                  return false
                }
                if (!quantityInput.value || parseInt(quantityInput.value) < 1) {
                  Swal.showValidationMessage('Jumlah produk harus minimal 1')
                  return false
                }
                products.push({
                  product_id: parseInt(productSelect.value),
                  quantity: parseInt(quantityInput.value),
                  product_finishing_id:
                    finishingSelect.value && finishingSelect.value !== 'Tidak Ada Finishing'
                      ? parseInt(finishingSelect.value)
                      : null,
                  product_variant_id:
                    variantSelect.value && variantSelect.value !== 'Tidak Ada Variasi'
                      ? parseInt(variantSelect.value)
                      : null,
                })
              }
              const additionalInfo = document.getElementById('additionalInfo').value
              return {
                user_id: parseInt(selectedUserId.value),
                additional_info: additionalInfo,
                products: products,
              }
            },
          }).then(async (result) => {
            if (result.isConfirmed && result.value) {
              const success = await self.submitOrder(result.value)
              if (success) {
                self.fetchOrders()
              }
            }
          })
        })
        .catch((error) => {
          console.error('Error fetching categories:', error)
          this.showErrorMessage('Gagal memuat data kategori. Silakan coba lagi.')
        })
    },
    createProductsCarousel(order) {
      if (!order.order_detail || order.order_detail.length === 0) {
        return '<div class="text-center py-4">Tidak ada detail produk tersedia</div>'
      }
      let carouselHtml = `
    <div class="product-carousel relative">
      <div class="carousel-container overflow-hidden">
        <div class="carousel-track flex transition-transform duration-300" style="transform: translateX(0);">
  `
      order.order_detail.forEach((item) => {
        carouselHtml += `
      <div class="carousel-slide w-full flex-shrink-0 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 sm:grid-cols-[120px_10px_auto] gap-y-2 text-left text-base sm:text-lg">
          <div class="font-semibold">Nama Produk</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${item.product.name}</div>
          <div class="font-semibold">Jumlah</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${item.quantity}</div>
          <div class="font-semibold">Subtotal</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.formatCurrency(item.subtotal_buy_price)}</div>
          ${
            item.product_finishing
              ? `
          <div class="font-semibold">Finishing</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${item.product_finishing.finishing.name}</div>
          <div class="font-semibold">Harga Finishing</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.formatCurrency(item.product_finishing.price)}</div>
          `
              : ''
          }
        </div>
      </div>
    `
      })
      carouselHtml += `
        </div>
      </div>
      <div class="carousel-controls flex justify-between items-center mt-4">
        <button class="carousel-prev bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded-md text-sm sm:text-base ${order.order_detail.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${order.order_detail.length <= 1 ? 'disabled' : ''}>← Prev</button>
        <div class="carousel-indicators flex space-x-2 justify-center">
  `
      order.order_detail.forEach((_, index) => {
        carouselHtml += `
      <button class="carousel-indicator w-2 h-2 rounded-full bg-gray-300 ${index === 0 ? 'bg-gray-700' : ''}" data-index="${index}"></button>
    `
      })
      carouselHtml += `
        </div>
        <button class="carousel-next bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded-md text-sm sm:text-base ${order.order_detail.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${order.order_detail.length <= 1 ? 'disabled' : ''}>Next →</button>
      </div>
      <div class="carousel-counter text-center text-sm mt-2">
        <span class="current-slide">1</span> dari <span>${order.order_detail.length}</span>
      </div>
    </div>
  `
      return carouselHtml
    },
    initProductCarousel(totalSlides) {
      if (totalSlides <= 1) return
      const track = document.querySelector('.carousel-track')
      const slides = document.querySelectorAll('.carousel-slide')
      const prevButton = document.querySelector('.carousel-prev')
      const nextButton = document.querySelector('.carousel-next')
      const indicators = document.querySelectorAll('.carousel-indicator')
      const currentSlideEl = document.querySelector('.current-slide')
      let currentIndex = 0
      const updateCarousel = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`
        indicators.forEach((indicator, index) => {
          indicator.classList.toggle('bg-gray-700', index === currentIndex)
          indicator.classList.toggle('bg-gray-300', index !== currentIndex)
        })
        prevButton.disabled = currentIndex === 0
        nextButton.disabled = currentIndex === totalSlides - 1
        currentSlideEl.textContent = currentIndex + 1
      }
      prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--
          updateCarousel()
        }
      })
      nextButton.addEventListener('click', () => {
        if (currentIndex < totalSlides - 1) {
          currentIndex++
          updateCarousel()
        }
      })
      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
          currentIndex = index
          updateCarousel()
        })
      })
      updateCarousel()
    },
    getStatusName(statusId) {
      const status = this.orderStatuses.find((s) => s.id === statusId)
      return status ? status.name : 'Unknown'
    },
    toggleSidebar() {
      if (this.isMobile) {
        this.isSidebarActive = !this.isSidebarActive
      }
    },
    handleResize() {
      this.isMobile = window.innerWidth < 1024
      if (!this.isMobile) {
        this.isSidebarActive = true
      }
    },
    updatePagination() {
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.updatePagination()
      }
    },
  },
}
</script>

<style scoped>
.carousel-track {
  transition: transform 0.3s ease-in-out;
}
.carousel-indicator {
  transition: background-color 0.3s ease;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

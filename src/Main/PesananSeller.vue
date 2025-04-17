<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <HeaderSeller @toggle-sidebar="toggleSidebar" :showSearch="true">
      <template #search>
        <div class="relative w-full">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari pesanan..."
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
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Pesanan</h2>
        <!-- Filter and Entries Row -->
        <div class="flex flex-wrap justify-between items-center mb-6">
          <!-- Filter Dropdown -->
          <div class="mb-4 md:mb-0">
            <select
              v-model="statusFilter"
              class="block w-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">Semua</option>
              <option v-for="status in orderStatuses" :key="status.id" :value="status.id">
                {{ status.name }}
              </option>
            </select>
          </div>

          <!-- Entries per page -->
          <div class="mb-4 md:mb-0">
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
              &laquo;
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
              &lsaquo;
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
              &rsaquo;
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
              &raquo;
            </button>
          </div>
        </div>
      </div>
    </div>
    <FooterSeller />
  </div>
</template>

<script>
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
      loading: true,
      orders: [],
      orderStatuses: [],
      // Store the API base URL
      apiBaseUrl: 'http://127.0.0.1:8000/api/seller',
    }
  },
  computed: {
    filteredOrders() {
      let result = this.orders

      // Filter by status if not "all"
      if (this.statusFilter !== 'all') {
        result = result.filter((order) => order.order_status_id === this.statusFilter)
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
      return Math.ceil(this.filteredOrders.length / this.entriesPerPage)
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
      const totalVisiblePages = 5 // Adjust based on screen size
      const pages = []

      if (this.totalPages <= totalVisiblePages) {
        // If we have fewer pages than the limit, show all pages
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Always show first page
        pages.push(1)

        let startPage = Math.max(2, this.currentPage - Math.floor((totalVisiblePages - 3) / 2))
        let endPage = Math.min(this.totalPages - 1, startPage + totalVisiblePages - 4)

        // Adjust if we're near the end
        if (endPage === this.totalPages - 1) {
          startPage = Math.max(2, endPage - (totalVisiblePages - 4))
        }

        // Add ellipsis after first page if needed
        if (startPage > 2) {
          pages.push('...')
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }

        // Add ellipsis before last page if needed
        if (endPage < this.totalPages - 1) {
          pages.push('...')
        }

        // Always show last page
        pages.push(this.totalPages)
      }

      return pages
    },
  },
  async mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)

    try {
      // Setup axios with authentication
      this.setupAxiosAuth()

      // Load order statuses first
      await this.fetchOrderStatuses()
      // Then load the orders
      await this.fetchOrders()
    } catch (error) {
      console.error('Error initializing data:', error)
      this.showErrorMessage('Gagal memuat data. Silakan coba lagi nanti.')
    }
  },
  watch: {
    statusFilter() {
      this.currentPage = 1
      this.updatePagination()
    },
    searchQuery() {
      this.currentPage = 1
      this.updatePagination()
    },
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // Setup authentication for axios
    setupAxiosAuth() {
      // Get token from localStorage or cookies, depending on your auth method
      const token = localStorage.getItem('token') || this.getCookie('token')

      if (!token) {
        console.warn('Authentication token not found. User might not be logged in.')
        // Redirect to login page if needed
        // this.$router.push('/login')
        return
      }

      // Set default headers for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    // Helper for getting cookies (if you store token in cookies)
    getCookie(name) {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
      return null
    },

    // API calls
    async fetchOrders() {
      try {
        this.loading = true

        // Add withCredentials option for CSRF protection
        const response = await axios.get(`${this.apiBaseUrl}/orders`)

        if (response.data.status === 'success') {
          // Process orders to add prevStatusId for status tracking
          this.orders = response.data.data.map((order) => {
            return {
              ...order,
              prevStatusId: order.order_status_id,
            }
          })
        } else {
          throw new Error('Failed to fetch orders')
        }
      } catch (error) {
        console.error('Error fetching orders:', error)

        if (error.response && error.response.status === 401) {
          this.handleAuthError()
        } else {
          this.showErrorMessage('Gagal memuat pesanan. Silakan coba lagi nanti.')
        }

        this.orders = []
      } finally {
        this.loading = false
      }
    },

    async fetchOrderStatuses() {
      try {
        // Add withCredentials option for CSRF protection
        const response = await axios.get(`${this.apiBaseUrl}/orders/status`, {})

        if (response.data.status === 'success') {
          this.orderStatuses = response.data.data
        } else {
          throw new Error('Failed to fetch order statuses')
        }
      } catch (error) {
        console.error('Error fetching order statuses:', error)

        if (error.response && error.response.status === 401) {
          this.handleAuthError()
        } else {
          this.showErrorMessage('Gagal memuat status pesanan. Silakan coba lagi nanti.')
        }

        this.orderStatuses = []
      }
    },

    async updateOrderStatus(order_id, statusId) {
      console.log('Response:', { order_status_id: statusId,
        order_id:order_id});
      try {
        // Add withCredentials option for CSRF protection
        const response = await axios.put(`${this.apiBaseUrl}/orders/${order_id}/status`, {
          order_status_id: statusId,
        })



        if (response.data.status === 'success') {
          return true
        } else {
          throw new Error('Failed to update order status')
        }
      } catch (error) {
        console.error('Error updating order status:', error)
        console.log(error.response)

        if (error.response && error.response.status === 401) {
          this.handleAuthError()
        } else {
          this.showErrorMessage('Gagal mengubah status pesanan. Silakan coba lagi nanti.')
        }

        return false
      }
    },

    // Handle authentication errors
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
          // Redirect to login page
          window.location.href = '/login'
        }
      })
    },

    // Utility methods
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

    // Get the appropriate class based on status
    getStatusClass(statusId) {
      const status = this.orderStatuses.find((s) => s.id === statusId)
      if (!status) return 'bg-gray-500'

      // Map color names to Tailwind classes
      switch (status.color) {
        case 'MediumBlue':
          return 'bg-blue-600'
        case 'Red':
          return 'bg-red-600'
        case 'Green':
          return 'bg-green-600'
        case 'Orange':
          return 'bg-yellow-500'
        default:
          return 'bg-gray-500'
      }
    },

    getStatusBgClass(statusId) {
      const status = this.orderStatuses.find((s) => s.id === statusId)
      if (!status) return 'bg-gray-500'

      // Map color names to Tailwind classes for dropdown options
      switch (status.color) {
        case 'MediumBlue':
          return 'bg-blue-600 text-white'
        case 'Red':
          return 'bg-red-600 text-white'
        case 'Green':
          return 'bg-green-600 text-white'
        case 'Orange':
          return 'bg-yellow-500 text-white'
        default:
          return 'bg-gray-500 text-white'
      }
    },

    // Check if status change is allowed (only forward progression)
    isStatusAllowed(prevStatusId, newStatusId) {
      // Allow selecting current status
      if (prevStatusId === newStatusId) return true

      // Find indices of the statuses in the order
      const prevIndex = this.orderStatuses.findIndex((s) => s.id === prevStatusId)
      const newIndex = this.orderStatuses.findIndex((s) => s.id === newStatusId)

      // Allow moving forward only
      return newIndex > prevIndex
    },

    async confirmStatusChange(order) {
      // Store original status in case user cancels
      const originalStatusId = order.prevStatusId
      const newStatusId = order.order_status_id

      // If status hasn't changed, do nothing
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
          // Try to update the status
          const success = await this.updateOrderStatus(order.id, newStatusId)

          if (success) {
            // Update prevStatusId to reflect the new status after confirmation
            order.prevStatusId = newStatusId
            Swal.fire({
              icon: 'success',
              title: 'Sukses!',
              text: `Status pesanan #${order.id} berhasil diubah menjadi ${newStatus.name}`,
              confirmButtonText: 'OK',
              buttonsStyling: false,
              customClass: {
                confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
              },
            })
          } else {
            // Revert to original status if update failed
            order.order_status_id = originalStatusId
          }
        } else {
          // Revert to original status if user cancels
          order.order_status_id = originalStatusId
        }
      })
    },

    viewOrderDetail(order) {
      // Create the HTML content for the products carousel
      const productsHtml = this.createProductsCarousel(order)

      Swal.fire({
        title: `<span class='text-xl sm:text-2xl font-bold'>Detail Pesanan #${order.id}</span>`,
        html: `
          <div class="text-left mb-6">
            <div class="grid grid-cols-[120px_10px_auto] gap-y-2 text-lg">
              <div class="font-semibold">Pembeli</div> <div class="text-center">:</div> <div class="ml-4">${order.user.name}</div>
              <div class="font-semibold">Alamat</div> <div class="text-center">:</div> <div class="ml-4">${order.address || '-'}</div>
              <div class="font-semibold">Tanggal</div> <div class="text-center">:</div> <div class="ml-4">${this.formatDate(order.created_at)}</div>
              <div class="font-semibold">Status</div> <div class="text-center">:</div> <div class="ml-4">${this.getStatusName(order.order_status_id)}</div>
              <div class="font-semibold">Total</div> <div class="text-center">:</div> <div class="ml-4">${this.formatCurrency(order.grand_total)}</div>
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

          <!-- Products Section -->
          <div class="mt-4">
            <div class="font-semibold text-lg mb-2">Produk (${order.order_detail.length}):</div>
            ${productsHtml}
          </div>
        `,
        width: '80%',
        confirmButtonText: 'Tutup',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-base mt-6',
        },
        didOpen: () => {
          // Initialize the product carousel navigation
          this.initProductCarousel(order.order_detail.length)
        },
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

      // Add slides for each product
      order.order_detail.forEach((item, index) => {
        carouselHtml += `
          <div class="carousel-slide w-full flex-shrink-0 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-[120px_10px_auto] gap-y-2 text-left text-lg">
              <div class="font-semibold">Nama Produk</div> <div class="text-center">:</div> <div class="ml-4">${item.product.name}</div>
              <div class="font-semibold">Jumlah</div> <div class="text-center">:</div> <div class="ml-4">${item.quantity}</div>
              <div class="font-semibold">Subtotal</div> <div class="text-center">:</div> <div class="ml-4">${this.formatCurrency(item.subtotal_buy_price)}</div>
              ${
                item.product_finishing
                  ? `
              <div class="font-semibold">Finishing</div> <div class="text-center">:</div> <div class="ml-4">${item.product_finishing.finishing.name}</div>
              <div class="font-semibold">Harga Finishing</div> <div class="text-center">:</div> <div class="ml-4">${this.formatCurrency(item.product_finishing.price)}</div>
              `
                  : ''
              }
            </div>
          </div>
        `
      })

      // Add navigation controls
      carouselHtml += `
            </div>
          </div>
          <!-- Carousel controls -->
          <div class="carousel-controls flex justify-between items-center mt-4">
            <button class="carousel-prev bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md ${order.order_detail.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${order.order_detail.length <= 1 ? 'disabled' : ''}>← Prev</button>
            <div class="carousel-indicators flex space-x-2 justify-center">
      `

      // Add indicators
      order.order_detail.forEach((_, index) => {
        carouselHtml += `
          <button class="carousel-indicator w-2 h-2 rounded-full bg-gray-300 ${index === 0 ? 'bg-gray-700' : ''}" data-index="${index}"></button>
        `
      })

      carouselHtml += `
            </div>
            <button class="carousel-next bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md ${order.order_detail.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${order.order_detail.length <= 1 ? 'disabled' : ''}>Next →</button>
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
        // Update track position
        track.style.transform = `translateX(-${currentIndex * 100}%)`

        // Update indicators
        indicators.forEach((indicator, index) => {
          indicator.classList.toggle('bg-gray-700', index === currentIndex)
          indicator.classList.toggle('bg-gray-300', index !== currentIndex)
        })

        // Update buttons
        prevButton.disabled = currentIndex === 0
        nextButton.disabled = currentIndex === totalSlides - 1

        // Update counter
        currentSlideEl.textContent = currentIndex + 1
      }

      // Add event listeners for navigation
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

      // Add event listeners for indicators
      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
          currentIndex = index
          updateCarousel()
        })
      })

      // Initialize
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
      // Reset current page if it's now out of bounds
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
/* Optional: Add some transition effects for carousel */
.carousel-track {
  transition: transform 0.3s ease-in-out;
}

.carousel-indicator {
  transition: background-color 0.3s ease;
}

/* Make buttons look disabled when they are */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

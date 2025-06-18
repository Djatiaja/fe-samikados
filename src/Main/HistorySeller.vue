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
            placeholder="Cari history..."
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
          Riwayat Pesanan
        </h2>

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
          <p class="text-lg text-gray-600">Tidak ada riwayat pesanan ditemukan.</p>
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
                    <span
                      :class="getStatusBgClass(order.order_status_id)"
                      class="py-1 px-3 rounded-lg"
                    >
                      {{ getStatusName(order.order_status_id) }}
                    </span>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <button @click="viewOrderDetail(order)" class="text-blue-500 hover:underline">
                    Lihat Detail
                  </button>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0">
                <td colspan="8" class="text-center py-4">Tidak ada data pesanan yang ditemukan</td>
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
      orderStatuses: [
        { id: 3, name: 'selesai' },
        { id: 4, name: 'batal' },
      ],
      // Hapus apiBaseUrl dari data, karena akan menggunakan import.meta.env
    }
  },
  computed: {
    // Computed properties tetap sama
    filteredOrders() {
      let result = this.orders
      if (this.statusFilter !== 'all') {
        result = result.filter((order) => order.order_status_id == this.statusFilter)
      }
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
  methods: {
    async fetchOrders() {
      try {
        this.loading = true
        const token = localStorage.getItem('token')
        console.log('Token:', token) // Debug token
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/seller/history`) // Debug URL
        if (!token) {
          console.error('No token found in localStorage')
          this.loading = false
          this.showErrorMessage('Silakan login untuk melihat riwayat pesanan.')
          // Optional: this.$router.push('/login')
          return
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/seller/history`)
        const data = response.data

        if (data.status === 'success') {
          this.orders = data.data.map((order) => ({
            ...order,
            user: order.user || { name: 'Unknown' },
          }))
        } else {
          console.error('Failed to fetch orders:', data.error)
          this.showErrorMessage('Gagal memuat data pesanan. Silakan coba lagi nanti.')
        }
      } catch (err) {
        console.error('Error fetching orders:', err.response?.data || err.message)
        if (err.response?.status === 401) {
          console.error('Unauthorized: Invalid or expired token')
          this.showErrorMessage('Sesi Anda telah berakhir. Silakan login kembali.')
          // Optional: localStorage.removeItem('token'); this.$router.push('/login')
        } else {
          this.showErrorMessage('Gagal memuat data pesanan. Silakan coba lagi nanti.')
        }
      } finally {
        console.log('Finally block executed') // Debug finally
        this.loading = false
      }
    },
    getStatusName(statusId) {
      const status = this.orderStatuses.find((s) => s.id == statusId)
      return status ? status.name : 'Unknown'
    },
    getStatusBgClass(statusId) {
      switch (statusId) {
        case 3: // selesai
          return 'bg-green-200 text-green-800'
        case 4: // batal
          return 'bg-red-200 text-red-800'
        default:
          return 'bg-gray-200 text-gray-800'
      }
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
          setTimeout(() => {
            this.initProductCarousel(order.order_detail.length)
          }, 100)
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
    createProductsCarousel(order) {
      if (!order.order_detail || order.order_detail.length === 0) {
        return '<div class="text-center py-4">Tidak ada detail produk tersedia</div>'
      }
      let carouselHtml = `
        <div class="product-carousel relative">
          <div class="carousel-container overflow-hidden">
            <div class="carousel-track flex transition-transform duration-300" style="transform: translateX(0);">
      `
      order.order_detail.forEach((item, index) => {
        carouselHtml += `
              <div class="carousel-slide w-full flex-shrink-0 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div class="grid grid-cols-1 sm:grid-cols-[120px_10px_auto] gap-y-2 text-left text-base sm:text-lg">
                  <div class="font-semibold">Nama Produk</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${item.product?.name || 'N/A'}</div>
                  <div class="font-semibold">Jumlah</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${item.quantity}</div>
                  <div class="font-semibold">Subtotal</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.formatCurrency(item.subtotal_buy_price)}</div>
                  ${
                    item.product_finishing
                      ? `
                      <div class="font-semibold">Finishing</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${item.product_finishing.finishing?.name || 'N/A'}</div>
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
      setTimeout(() => {
        const modal = document.querySelector('.swal2-container')
        if (!modal) return
        const track = modal.querySelector('.carousel-track')
        const prevButton = modal.querySelector('.carousel-prev')
        const nextButton = modal.querySelector('.carousel-next')
        const indicators = modal.querySelectorAll('.carousel-indicator')
        const currentSlideEl = modal.querySelector('.current-slide')
        if (!track || !prevButton || !nextButton) {
          console.error('Carousel elements not found')
          return
        }
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
      }, 100)
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
    toggleSidebar() {
      if (this.isMobile) {
        this.isSidebarActive = !this.isSidebarActive
      }
    },
    handleResize() {
      this.isMobile = window.innerWidth < 1024
      this.isSidebarActive = !this.isMobile
    },
    updatePagination() {
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
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
  async mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
    try {
      const token = localStorage.getItem('token')
      console.log('Token:', token) // Debug token
      if (!token) {
        console.error('No token found in localStorage')
        this.showErrorMessage('Silakan login untuk melihat riwayat pesanan.')
        return
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      await this.fetchOrders()
    } catch (error) {
      console.error('Error initializing data:', error)
      this.showErrorMessage('Gagal memuat data. Silakan coba lagi nanti.')
    } finally {
      this.loading = false
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
}
</script>

<style scoped>
.content-wrapper {
  transition: margin-left 0.3s ease;
}
.carousel-slide {
  min-width: 100%;
  transition: transform 0.3s ease;
}
.carousel-indicator {
  width: 8px;
  height: 8px;
  transition: background-color 0.3s ease;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

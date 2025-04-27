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
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Riwayat Pesanan</h2>

        <!-- Filter Dropdown -->
        <div class="flex justify-between items-center mb-4">
          <select
            v-model="statusFilter"
            class="w-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Semua</option>
            <option value="selesai">Selesai</option>
            <option value="batal">Batal</option>
          </select>
          <button
            @click="showAddHistoryModal"
            class="border-2 border-black px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <img src="/icon/add.svg" alt="Add Icon" class="w-4 h-4 mr-2" />
            <span>History</span>
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

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex justify-center items-center py-10">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        >
          <p>{{ error }}</p>
          <button @click="fetchOrders" class="underline text-red-600">Try Again</button>
        </div>

        <!-- Responsive Table -->
        <div v-if="!isLoading" class="overflow-auto rounded-lg shadow-md">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-red-600 text-white">
              <tr>
                <th class="p-4 text-center border-r border-gray-300">Nomor Pesanan</th>
                <th class="p-4 text-center border-r border-gray-300">Nama Pembeli</th>
                <th class="p-4 text-center border-r border-gray-300">Tanggal Mulai</th>
                <th class="p-4 text-center border-r border-gray-300">Tanggal Selesai</th>
                <th class="p-4 text-center border-r border-gray-300">Metode Pembelian</th>
                <th class="p-4 text-center border-r border-gray-300">Pendapatan</th>
                <th class="p-4 text-center border-r border-gray-300">Status</th>
                <th class="p-4 text-center">Detail</th>
              </tr>
            </thead>
            <tbody>
              <!-- Tampilkan pesanan berdasarkan filter dan pencarian -->
              <tr v-for="order in paginatedOrders" :key="order.id" class="border-b border-gray-300">
                <td class="p-4 text-center border-r border-gray-300">{{ order.orderNumber }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ order.customerName }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ order.orderDate }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ order.endDate }}</td>
                <td class="p-4 text-center border-r border-gray-300">
                  {{ order.purchaseMethod === 'offline' ? 'Offline' : 'Online' }}
                </td>
                <td class="p-4 text-center border-r border-gray-300">
                  {{ formatCurrency(order.totalPrice) }}
                </td>
                <td
                  class="p-4 text-center border-r border-gray-300"
                  :class="statusClass(order.status)"
                >
                  {{ order.status }}
                </td>
                <td
                  class="p-4 text-center text-blue-500 cursor-pointer"
                  @click="showOrderDetail(order)"
                >
                  Lihat Detail
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
      entriesPerPage: 25,
      searchQuery: '',
      orders: [],
      isLoading: false,
      error: null,
      lastOrderNumber: 1235,
      currentPage: 1,
    }
  },
  computed: {
    filteredOrders() {
      return this.orders.filter((order) => {
        // Filter by status
        if (this.statusFilter !== 'all' && order.status !== this.statusFilter) {
          return false
        }

        // Filter by search query (name, order number)
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase()
          return (
            order.customerName.toLowerCase().includes(query) ||
            (order.orderNumber && order.orderNumber.toLowerCase().includes(query))
          )
        }

        return true
      })
    },
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.entriesPerPage)
    },
    paginatedOrders() {
      const start = (this.currentPage - 1) * parseInt(this.entriesPerPage)
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
  methods: {
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        // Scroll to top of the table for better UX
        const tableElement = document.querySelector('table')
        if (tableElement) {
          tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    },

    changeEntriesPerPage() {
      this.currentPage = 1 // Reset to first page when changing entries per page
    },

    async fetchOrders() {
      try {
        this.isLoading = true
        this.error = null
        const token = localStorage.getItem('token')

        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // Get orders from API
        const response = await axios.get('http://127.0.0.1:8000/api/seller/history')
        const data = response.data

        if (data.status === 'success') {
          // Map API data to match component's structure
          this.orders = data.data.map((order) => {
            // Get the first product name if available
            const firstProduct =
              order.order_detail.length > 0 ? order.order_detail[0].product.name : 'N/A'

            // Format dates
            const orderDate = new Date(order.created_at)
            const endDate = new Date(orderDate)
            endDate.setDate(endDate.getDate() + 3)

            const formattedOrderDate = orderDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'numeric',
              year: '2-digit',
            })

            const formattedEndDate = endDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'numeric',
              year: '2-digit',
            })

            // Calculate total quantities
            const totalQuantity = order.order_detail.reduce((sum, item) => sum + item.quantity, 0)

            return {
              id: order.id,
              orderNumber: `00${order.id}`,
              customerName: order.user.name,
              orderDate: formattedOrderDate,
              endDate: formattedEndDate,
              status: order.order_status.name.toLowerCase(), // Ensure lowercase for filtering
              category: 'Pesanan Online',
              productName: firstProduct,
              quantity: totalQuantity,
              totalPrice: order.grand_total,
              purchaseMethod: 'online',
              address: order.address || '',
              notes: order.additional_info || '',
              orderDetail: order.order_detail,
            }
          })

          // Preserve any offline orders
          const offlineOrders = this.orders.filter((order) => order.purchaseMethod === 'offline')
          this.orders = [...this.orders, ...offlineOrders]

          // Update lastOrderNumber
          if (data.data.length > 0) {
            const maxOrderId = Math.max(...data.data.map((o) => parseInt(o.id)))
            this.lastOrderNumber = Math.max(this.lastOrderNumber, maxOrderId)
          }
        } else {
          console.error('Failed to fetch orders:', data.error || 'Unknown error')
          this.error = data.error || 'Failed to fetch orders'
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
        this.error = err.message || 'Network or server error'
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

    formatCurrency(amount) {
      return `Rp ${amount.toLocaleString()}`
    },

    statusClass(status) {
      return {
        'text-green-500': status.toLowerCase() === 'selesai',
        'text-red-600': status.toLowerCase() === 'batal',
        'text-yellow-500': status.toLowerCase() === 'masuk' || status.toLowerCase() === 'proses',
      }
    },

    generateOrderNumber() {
      this.lastOrderNumber++
      return '00' + this.lastOrderNumber
    },

    async addHistoryToAPI(historyData) {
      try {
        const token = localStorage.getItem('token')
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // Prepare data for API
        const apiData = {
          user_id: historyData.user_id || 1, // Default to 1 if not provided
          address: historyData.address || '',
          additional_info: historyData.notes || '',
          delivery_type: 'express', // Default type
          order_status_id: 4, // Assuming 4 is "selesai"
          products: [
            {
              product_id: historyData.product_id || 1,
              quantity: historyData.quantity,
              product_finishing_id: historyData.finishing_id || null,
            },
          ],
        }

        const response = await axios.post('http://127.0.0.1:8000/api/seller/history', apiData)

        if (response.data.status === 'success') {
          // Refresh order list after successful addition
          await this.fetchOrders()
          return true
        } else {
          console.error('Failed to add history:', response.data.error || 'Unknown error')
          return false
        }
      } catch (err) {
        console.error('Error adding history:', err)
        return false
      }
    },

    showAddHistoryModal() {
      // Reset the current products array
      this.currentProducts = []

      Swal.fire({
        title: `<h3 class="text-lg font-bold">Tambah Riwayat Pesanan</h3>`,
        html: `
      <form id="historyForm" class="text-left form-compact">
        <!-- Customer Information -->
        <div class="mb-4">
          <h4 class="font-semibold mb-3 pb-2 border-b">Informasi Pembeli</h4>
          <div class="mb-3">
            <label class="block text-gray-700 font-medium text-sm mb-1">Nama Pembeli</label>
            <input
              type="text"
              id="customerName"
              placeholder="Masukkan Nama Pembeli"
              class="w-full text-sm p-2 border border-gray-300 rounded-lg"
            >
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1">Tanggal Mulai</label>
              <input
                type="date"
                id="orderDate"
                class="w-full text-sm p-2 border border-gray-300 rounded-lg"
              >
            </div>

            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1">Tanggal Selesai</label>
              <input
                type="date"
                id="endDate"
                class="w-full text-sm p-2 border border-gray-300 rounded-lg"
              >
            </div>
          </div>

          <input type="hidden" id="purchaseMethod" value="offline">
          <input type="hidden" id="orderStatus" value="selesai">

          <div class="mb-3">
            <label class="block text-gray-700 font-medium text-sm mb-1">Catatan</label>
            <textarea
              id="notes"
              rows="2"
              placeholder="Masukkan catatan pesanan"
              class="w-full text-sm p-2 border border-gray-300 rounded-lg"
            ></textarea>
          </div>
        </div>

        <!-- Products List -->
        <div class="mb-3">
          <h4 class="font-semibold mb-3 pb-2 border-b">Produk</h4>
          <div id="productItems">
            <!-- Initial product item -->
            <div class="product-item mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="mb-2">
                  <label class="block text-gray-700 font-medium text-sm mb-1">Kategori</label>
                  <select class="product-category w-full text-sm p-2 border border-gray-300 rounded-lg">
                    <option value="Stiker">Stiker</option>
                    <option value="T-shirt">T-shirt</option>
                    <option value="Merchandise">Merchandise</option>
                    <option value="Kartu Nama">Kartu Nama</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div class="mb-2">
                  <label class="block text-gray-700 font-medium text-sm mb-1">Nama Produk</label>
                  <input
                    type="text"
                    class="product-name w-full text-sm p-2 border border-gray-300 rounded-lg"
                    placeholder="Masukkan Nama Produk"
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="mb-2">
                  <label class="block text-gray-700 font-medium text-sm mb-1">Ukuran</label>
                  <input
                    type="text"
                    class="product-size w-full text-sm p-2 border border-gray-300 rounded-lg"
                    placeholder="Masukkan Ukuran"
                  >
                </div>
                <div class="mb-2">
                  <label class="block text-gray-700 font-medium text-sm mb-1">Finishing</label>
                  <select class="product-finishing w-full text-sm p-2 border border-gray-300 rounded-lg">
                    <option value="Dengan Finishing">Dengan Finishing</option>
                    <option value="Tanpa Finishing">Tanpa Finishing</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="mb-2">
                  <label class="block text-gray-700 font-medium text-sm mb-1">Jumlah</label>
                  <input
                    type="number"
                    class="product-quantity w-full text-sm p-2 border border-gray-300 rounded-lg"
                    placeholder="Masukkan Jumlah"
                  >
                </div>
                <div class="mb-2">
                  <label class="block text-gray-700 font-medium text-sm mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    class="product-price w-full text-sm p-2 border border-gray-300 rounded-lg"
                    placeholder="Masukkan Harga"
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              id="addMoreProduct"
              class="bg-red-600 text-white px-2 py-1 rounded-md text-xs flex items-center"
            >
              <span class="mr-1">+</span> Tambah Produk
            </button>
          </div>
        </div>
      </form>
    `,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          cancelButton:
            'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          actions: 'flex justify-center space-x-6',
          htmlContainer: 'overflow-y-auto max-h-[70vh]',
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Tambah',
        focusConfirm: false,
        didOpen: () => {
          // Initialize the UI with today's date
          const today = new Date().toISOString().split('T')[0]
          document.getElementById('orderDate').value = today

          // Add event listener for adding more products
          document.getElementById('addMoreProduct').addEventListener('click', () => {
            const productItems = document.getElementById('productItems')
            const newItem = document.createElement('div')
            newItem.className = 'product-item mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200'
            newItem.innerHTML = `
          <div class="flex justify-between items-center mb-2">
            <h5 class="font-medium">Produk Tambahan</h5>
            <button type="button" class="text-red-600 hover:text-red-800 text-sm remove-product">
              Hapus
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="mb-2">
              <label class="block text-gray-700 font-medium text-sm mb-1">Kategori</label>
              <select class="product-category w-full text-sm p-2 border border-gray-300 rounded-lg">
                <option value="Stiker">Stiker</option>
                <option value="T-shirt">T-shirt</option>
                <option value="Merchandise">Merchandise</option>
                <option value="Kartu Nama">Kartu Nama</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div class="mb-2">
              <label class="block text-gray-700 font-medium text-sm mb-1">Nama Produk</label>
              <input
                type="text"
                class="product-name w-full text-sm p-2 border border-gray-300 rounded-lg"
                placeholder="Masukkan Nama Produk"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="mb-2">
              <label class="block text-gray-700 font-medium text-sm mb-1">Ukuran</label>
              <input
                type="text"
                class="product-size w-full text-sm p-2 border border-gray-300 rounded-lg"
                placeholder="Masukkan Ukuran"
              >
            </div>
            <div class="mb-2">
              <label class="block text-gray-700 font-medium text-sm mb-1">Finishing</label>
              <select class="product-finishing w-full text-sm p-2 border border-gray-300 rounded-lg">
                <option value="Dengan Finishing">Dengan Finishing</option>
                <option value="Tanpa Finishing">Tanpa Finishing</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="mb-2">
              <label class="block text-gray-700 font-medium text-sm mb-1">Jumlah</label>
              <input
                type="number"
                class="product-quantity w-full text-sm p-2 border border-gray-300 rounded-lg"
                placeholder="Masukkan Jumlah"
              >
            </div>
            <div class="mb-2">
              <label class="block text-gray-700 font-medium text-sm mb-1">Harga (Rp)</label>
              <input
                type="number"
                class="product-price w-full text-sm p-2 border border-gray-300 rounded-lg"
                placeholder="Masukkan Harga"
              >
            </div>
          </div>
        `
            productItems.appendChild(newItem)

            // Add event listener to remove button
            const removeButtons = document.querySelectorAll('.remove-product')
            removeButtons.forEach((button) => {
              button.addEventListener('click', function () {
                this.closest('.product-item').remove()
              })
            })
          })
        },
        preConfirm: () => {
          // Get form values
          const customerName = document.getElementById('customerName').value
          const orderDate = document.getElementById('orderDate').value
          const endDate = document.getElementById('endDate').value
          const purchaseMethod = document.getElementById('purchaseMethod').value
          const notes = document.getElementById('notes').value
          const status = document.getElementById('orderStatus').value

          // Collect all products
          const productItems = document.querySelectorAll('.product-item')
          const products = []

          let isValid = true
          let errorMessage = ''

          // Validation for customer info
          if (!customerName || !orderDate) {
            isValid = false
            errorMessage = 'Nama pembeli dan tanggal mulai wajib diisi'
          }

          // Process and validate each product
          productItems.forEach((item, index) => {
            const category = item.querySelector('.product-category').value
            const name = item.querySelector('.product-name').value
            const size = item.querySelector('.product-size').value
            const finishing = item.querySelector('.product-finishing').value
            const quantity = item.querySelector('.product-quantity').value
            const price = item.querySelector('.product-price').value

            // Validate product fields
            if (!name || !quantity || !price) {
              isValid = false
              errorMessage = `Produk #${index + 1}: Nama produk, jumlah, dan harga wajib diisi`
              return
            }

            products.push({
              id: Date.now() + index, // Generate unique ID
              category,
              name,
              size,
              finishing,
              quantity: parseInt(quantity),
              price: parseInt(price),
            })
          })

          if (!isValid) {
            Swal.showValidationMessage(errorMessage)
            return false
          }

          if (products.length === 0) {
            Swal.showValidationMessage('Minimal satu produk wajib diisi')
            return false
          }

          // Format dates for display
          const formattedOrderDate = new Date(orderDate).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            year: '2-digit',
          })

          const formattedEndDate = endDate
            ? new Date(endDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'numeric',
                year: '2-digit',
              })
            : ''

          // Calculate total price from all products
          const totalPrice = products.reduce((sum, product) => sum + product.price, 0)

          // Create order object
          const order = {
            id: Date.now(),
            orderNumber: this.generateOrderNumber(),
            customerName,
            orderDate: formattedOrderDate,
            endDate: formattedEndDate,
            purchaseMethod,
            notes,
            status,
            totalPrice,
            // Store products list
            products,
          }

          return order
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          // Add new order to orders array
          this.orders.push(result.value)

          // Show success message
          this.showSuccessMessage('Riwayat pesanan berhasil ditambahkan')
        }
      })
    },

    // Helper function to get product count
    getProductCount(order) {
      if (order.purchaseMethod === 'online' && order.orderDetail) {
        return order.orderDetail.length
      } else if (order.purchaseMethod === 'offline' && order.products) {
        return order.products.length
      } else {
        return 1 // Single product case
      }
    },

    showSuccessMessage(message) {
      Swal.fire({
        title: "<span class='text-lg font-bold'>Berhasil!</span>",
        text: message,
        icon: 'success',
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
          icon: 'custom-icon',
          confirmButton: 'bg-red-600 hover:bg-red-600 text-white py-2 w-28 rounded-md',
        },
      })
    },

    showOrderDetail(order) {
      // Create the HTML content for the products carousel
      const productsHtml = this.createProductsCarousel(order)

      Swal.fire({
        title: `<span class='text-xl sm:text-2xl font-bold'>Detail Pesanan #${order.orderNumber}</span>`,
        html: `
          <div class="text-left mb-6">
            <div class="grid grid-cols-1 sm:grid-cols-[120px_10px_auto] gap-y-2 text-base sm:text-lg">
              <div class="font-semibold">Pembeli</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.customerName || '-'}</div>
              <div class="font-semibold">Alamat</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.address || '-'}</div>
              <div class="font-semibold">Tanggal</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.orderDate || '-'}</div>
              <div class="font-semibold">Status</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.status || '-'}</div>
              <div class="font-semibold">Total</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.formatCurrency(order.totalPrice)}</div>
            </div>

            ${
              order.notes
                ? `
            <div class="mt-6">
              <div class="font-semibold">Informasi Tambahan:</div>
              <div class="mt-2 p-3 bg-gray-100 rounded-lg">${order.notes}</div>
            </div>`
                : ''
            }
          </div>

          <!-- Products Section -->
          <div class="mt-4">
            <div class="font-semibold text-lg mb-2">Produk (${this.getProductCount(order)}):</div>
            ${productsHtml}
          </div>
        `,
        // Responsive width settings
        width: 'auto',
        // Set max-width based on screen size
        customClass: {
          popup: 'swal-responsive-popup',
          confirmButton: 'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-base mt-6',
          htmlContainer: 'overflow-y-auto',
        },
        confirmButtonText: 'Tutup',
        buttonsStyling: false,
        didOpen: () => {
          // Initialize the product carousel navigation
          this.initProductCarousel()

          // Add responsive styles for the modal
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

    // Helper method to create products carousel HTML
    createProductsCarousel(order) {
      // Handle case when there are no products
      if (
        (order.purchaseMethod === 'online' &&
          (!order.orderDetail || order.orderDetail.length === 0)) ||
        (order.purchaseMethod === 'offline' &&
          (!order.products || order.products.length === 0) &&
          !order.productName)
      ) {
        return '<div class="text-center py-4">Tidak ada detail produk tersedia</div>'
      }

      let carouselHtml = `
        <div class="product-carousel relative">
          <div class="carousel-container overflow-hidden">
            <div class="carousel-track flex transition-transform duration-300" style="transform: translateX(0);">
      `

      // Add slides based on order type
      if (order.purchaseMethod === 'online' && order.orderDetail) {
        // For online orders, display product details from API
        order.orderDetail.forEach((item) => {
          const finishing = item.product_finishing
            ? `${item.product_finishing.finishing.name}`
            : 'Tanpa Finishing'

          carouselHtml += `
            <div class="carousel-slide w-full flex-shrink-0 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-1 sm:grid-cols-[120px_10px_auto] gap-y-2 text-left text-base sm:text-lg">
                <div class="font-semibold">Nama Produk</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${item.product.name}</div>
                <div class="font-semibold">Jumlah</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${item.quantity}</div>
                <div class="font-semibold">Subtotal</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.formatCurrency(item.subtotal_buy_price)}</div>
                <div class="font-semibold">Finishing</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${finishing}</div>
                ${
                  item.product_finishing
                    ? `<div class="font-semibold">Harga Finishing</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.formatCurrency(item.product_finishing.price)}</div>`
                    : ''
                }
              </div>
            </div>
          `
        })
      } else if (order.purchaseMethod === 'offline') {
        // For offline orders with multiple products
        if (order.products && order.products.length > 0) {
          order.products.forEach((product) => {
            carouselHtml += `
              <div class="carousel-slide w-full flex-shrink-0 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div class="grid grid-cols-1 sm:grid-cols-[120px_10px_auto] gap-y-2 text-left text-base sm:text-lg">
                  <div class="font-semibold">Nama Produk</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${product.name}</div>
                  <div class="font-semibold">Jumlah</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${product.quantity}</div>
                  <div class="font-semibold">Subtotal</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.formatCurrency(product.price)}</div>
                  ${product.category ? `<div class="font-semibold">Kategori</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${product.category}</div>` : ''}
                  ${product.size ? `<div class="font-semibold">Ukuran</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${product.size}</div>` : ''}
                  ${product.finishing ? `<div class="font-semibold">Finishing</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${product.finishing}</div>` : ''}
                </div>
              </div>
            `
          })
        } else {
          // For legacy offline orders with single product
          carouselHtml += `
            <div class="carousel-slide w-full flex-shrink-0 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-1 sm:grid-cols-[120px_10px_auto] gap-y-2 text-left text-base sm:text-lg">
                <div class="font-semibold">Nama Produk</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.productName}</div>
                <div class="font-semibold">Jumlah</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.quantity}</div>
                <div class="font-semibold">Subtotal</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${this.formatCurrency(order.totalPrice)}</div>
                ${order.category ? `<div class="font-semibold">Kategori</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.category}</div>` : ''}
                ${order.size ? `<div class="font-semibold">Ukuran</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.size}</div>` : ''}
                ${order.finishing ? `<div class="font-semibold">Finishing</div> <div class="hidden sm:block text-center">:</div> <div class="sm:ml-4">${order.finishing}</div>` : ''}
              </div>
            </div>
          `
        }
      }

      // Add navigation controls
      const productCount = this.getProductCount(order)
      carouselHtml += `
            </div>
          </div>
          <!-- Carousel controls -->
          <div class="carousel-controls flex justify-between items-center mt-8">
            <button class="carousel-prev bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-sm sm:text-base ${productCount <= 1 ? 'opacity-50 cursor-not-allowed' : ''}">← Prev</button>
            <div class="carousel-counter text-center text-sm">
              <span class="current-slide">1</span> dari <span>${productCount}</span>
            </div>
            <button class="carousel-next bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-sm sm:text-base ${productCount <= 1 ? 'opacity-50 cursor-not-allowed' : ''}">Next →</button>
          </div>
          <div class="carousel-indicators flex space-x-2 justify-center mt-2">
      `

      // Add indicator dots
      for (let i = 0; i < productCount; i++) {
        carouselHtml += `
          <button class="carousel-indicator w-2 h-2 rounded-full ${i === 0 ? 'bg-gray-800' : 'bg-gray-300'}" data-index="${i}"></button>
        `
      }

      carouselHtml += `
          </div>
        </div>
      `

      return carouselHtml
    },

    // Initialize the product carousel navigation
    initProductCarousel() {
      setTimeout(() => {
        const carouselTrack = document.querySelector('.carousel-track')
        const slides = document.querySelectorAll('.carousel-slide')
        const prevButton = document.querySelector('.carousel-prev')
        const nextButton = document.querySelector('.carousel-next')
        const indicators = document.querySelectorAll('.carousel-indicator')
        const currentSlideElement = document.querySelector('.current-slide')

        if (!carouselTrack || slides.length <= 0) return

        let currentSlide = 0
        const slideWidth = 100 // in percentage

        // Hide navigation if only one product
        if (slides.length <= 1) {
          if (prevButton) prevButton.style.display = 'none'
          if (nextButton) nextButton.style.display = 'none'
          if (document.querySelector('.carousel-indicators')) {
            document.querySelector('.carousel-indicators').style.display = 'none'
          }
          return
        }

        // Function to go to a specific slide
        function goToSlide(index) {
          currentSlide = index
          carouselTrack.style.transform = `translateX(-${currentSlide * slideWidth}%)`

          // Update active indicator
          indicators.forEach((indicator, i) => {
            if (i === currentSlide) {
              indicator.classList.remove('bg-gray-300')
              indicator.classList.add('bg-gray-800')
            } else {
              indicator.classList.remove('bg-gray-800')
              indicator.classList.add('bg-gray-300')
            }
          })

          // Update current slide text
          if (currentSlideElement) {
            currentSlideElement.textContent = currentSlide + 1
          }
        }

        // Previous button click
        if (prevButton) {
          prevButton.addEventListener('click', () => {
            if (currentSlide > 0) {
              goToSlide(currentSlide - 1)
            } else {
              // Optionally wrap around to the last slide
              goToSlide(slides.length - 1)
            }
          })
        }

        // Next button click
        if (nextButton) {
          nextButton.addEventListener('click', () => {
            if (currentSlide < slides.length - 1) {
              goToSlide(currentSlide + 1)
            } else {
              // Optionally wrap around to the first slide
              goToSlide(0)
            }
          })
        }

        // Indicators click
        indicators.forEach((indicator, index) => {
          indicator.addEventListener('click', () => {
            goToSlide(index)
          })
        })
      }, 100) // Small delay to ensure DOM is ready
    },
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)

    // Fetch orders from API
    this.fetchOrders()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
}
</script>

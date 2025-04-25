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
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
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
              <tr v-for="order in filteredOrders" :key="order.id" class="border-b border-gray-300">
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
      lastOrderNumber: 1235, // Track last order number for auto-generation
    }
  },
  computed: {
    filteredOrders() {
      let filtered = this.orders.filter((order) => {
        // Filter berdasarkan status
        if (this.statusFilter !== 'all' && order.status !== this.statusFilter) {
          return false
        }
        // Filter berdasarkan pencarian
        if (
          this.searchQuery &&
          !order.customerName.toLowerCase().includes(this.searchQuery.toLowerCase())
        ) {
          return false
        }
        return true
      })
      return filtered.slice(0, this.entriesPerPage)
    },
  },
  methods: {
    async fetchOrders() {
      try {
        this.isLoading = true
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const response = await axios.get('http://127.0.0.1:8000/api/seller/history');
        const data = response.data;

        if (data.status === 'success') {
          // Map API data to match component's structure
          const apiOrders = data.data.map(order => {
            // Get the first product name if available
            const firstProduct = order.order_detail.length > 0 ?
              order.order_detail[0].product.name : 'N/A'

            // Create a date object from timestamp
            const orderDate = new Date(order.created_at)
            // Assuming end date is 3 days later (adjust as needed)
            const endDate = new Date(orderDate)
            endDate.setDate(endDate.getDate() + 3)

            // Format dates to match component's format
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
            const totalQuantity = order.order_detail.reduce((sum, item) =>
              sum + item.quantity, 0)

            return {
              id: order.id,
              orderNumber: `00${order.id}`,
              customerName: order.user.name,
              orderDate: formattedOrderDate,
              endDate: formattedEndDate,
              status: order.order_status.name,
              category: 'Pesanan Online', // Default category for API orders
              productName: firstProduct,
              notes: order.additional_info || '',
              size: '', // Not available in API
              finishing: '', // Will be filled from product_finishing if needed
              quantity: totalQuantity,
              totalPrice: order.grand_total,
              purchaseMethod: 'online',
              // Add additional fields for detail view
              address: order.address,
              orderDetail: order.order_detail
            }
          })

          // Combine API orders with any manually added orders (keeping manual entries)
          const manualOrders = this.orders.filter(order => order.purchaseMethod === 'offline')
          this.orders = [...apiOrders, ...manualOrders]

          // Update lastOrderNumber based on max order ID
          if (apiOrders.length > 0) {
            const maxApiOrderId = Math.max(...apiOrders.map(o => parseInt(o.id)))
            this.lastOrderNumber = Math.max(this.lastOrderNumber, maxApiOrderId)
          }
        } else {
          console.error('Failed to fetch orders:', data.error)
          this.error = data.error || 'Failed to fetch orders'
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
        this.error = 'Network or server error'
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
        'text-green-500': status === 'selesai',
        'text-red-600': status === 'batal',
        'text-yellow-500': status === 'masuk',
      }
    },
    generateOrderNumber() {
      this.lastOrderNumber++
      return '00' + this.lastOrderNumber
    },
    changeEntriesPerPage() {
      // Method to handle entries per page change
    },
    showAddHistoryModal() {
      Swal.fire({
        title: `<h3 class="text-lg font-bold">Tambah Riwayat Pesanan</h3>`,
        html: `
          <form id="historyForm" class="text-left form-compact">
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

            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1">Kategori</label>
              <select id="category" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
                <option value="Stiker">Stiker</option>
                <option value="T-shirt">T-shirt</option>
                <option value="Merchandise">Merchandise</option>
                <option value="Kartu Nama">Kartu Nama</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1">Nama Produk</label>
              <input
                type="text"
                id="productName"
                placeholder="Masukkan Nama Produk"
                class="w-full text-sm p-2 border border-gray-300 rounded-lg"
              >
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

            <div class="grid grid-cols-2 gap-3">
              <div class="mb-3">
                <label class="block text-gray-700 font-medium text-sm mb-1">Ukuran</label>
                <input
                  type="text"
                  id="size"
                  placeholder="Masukkan Ukuran"
                  class="w-full text-sm p-2 border border-gray-300 rounded-lg"
                >
              </div>

              <div class="mb-3">
                <label class="block text-gray-700 font-medium text-sm mb-1">Finishing</label>
                <select id="finishing" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
                  <option value="Dengan Finishing">Dengan Finishing</option>
                  <option value="Tanpa Finishing">Tanpa Finishing</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="mb-3">
                <label class="block text-gray-700 font-medium text-sm mb-1">Jumlah</label>
                <input
                  type="number"
                  id="quantity"
                  placeholder="Masukkan Jumlah"
                  class="w-full text-sm p-2 border border-gray-300 rounded-lg"
                >
              </div>

              <div class="mb-3">
                <label class="block text-gray-700 font-medium text-sm mb-1">Total Harga (Rp)</label>
                <input
                  type="number"
                  id="totalPrice"
                  placeholder="Masukkan Total Harga"
                  class="w-full text-sm p-2 border border-gray-300 rounded-lg"
                >
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
          actions: 'flex justify-center space-x-6', // Add spacing between buttons
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Tambah',
        focusConfirm: false,
        preConfirm: () => {
          // Get form values
          const customerName = document.getElementById('customerName').value
          const orderDate = document.getElementById('orderDate').value
          const endDate = document.getElementById('endDate').value
          const category = document.getElementById('category').value
          const productName = document.getElementById('productName').value
          const purchaseMethod = document.getElementById('purchaseMethod').value
          const notes = document.getElementById('notes').value
          const size = document.getElementById('size').value
          const finishing = document.getElementById('finishing').value
          const quantity = document.getElementById('quantity').value
          const totalPrice = document.getElementById('totalPrice').value
          const status = document.getElementById('orderStatus').value

          // Validation
          if (!customerName || !orderDate || !productName || !quantity || !totalPrice) {
            Swal.showValidationMessage('Bidang wajib harus diisi')
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

          // Create order object
          const order = {
            id: Date.now(),
            orderNumber: this.generateOrderNumber(),
            customerName,
            orderDate: formattedOrderDate,
            endDate: formattedEndDate,
            category,
            productName,
            purchaseMethod,
            notes,
            size,
            finishing,
            quantity: parseInt(quantity),
            totalPrice: parseInt(totalPrice.replace(/[^0-9]/g, '')),
            status,
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

      // Set today's date as default for orderDate
      setTimeout(() => {
        const today = new Date().toISOString().split('T')[0]
        const orderDateInput = document.getElementById('orderDate')
        if (orderDateInput) {
          orderDateInput.value = today
        }
      }, 100)
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
      let detailHtml = '';

      if (order.purchaseMethod === 'online') {
        // For online orders, display order details from API
        detailHtml = `
          <div class="grid grid-cols-[120px_10px_auto] gap-y-2 sm:gap-y-4 text-left text-lg px-4 sm:px-6">
            <div class="font-semibold">Alamat</div> <div class="text-center">:</div> <div class="ml-4">${order.address || '-'}</div>
            <div class="font-semibold">Metode</div> <div class="text-center">:</div> <div class="ml-4">Online</div>
            <div class="font-semibold">Catatan</div> <div class="text-center">:</div> <div class="ml-4">${order.notes || '-'}</div>
            <div class="font-semibold">Total Harga</div> <div class="text-center">:</div> <div class="ml-4">${this.formatCurrency(order.totalPrice)}</div>
          </div>
          <div class="mt-4 text-lg font-bold">Produk yang Dibeli:</div>
        `;

        // Add product details if available
        if (order.orderDetail && order.orderDetail.length > 0) {
          detailHtml += `<div class="mt-2 border-t pt-2">`;
          order.orderDetail.forEach((item, idx) => {
            const finishing = item.product_finishing ?
              `${item.product_finishing.finishing.name} (+${this.formatCurrency(item.product_finishing.price)})` :
              'Tanpa Finishing';

            detailHtml += `
              <div class="py-2 ${idx > 0 ? 'border-t' : ''}">
                <div class="font-medium">${item.product.name} × ${item.quantity}</div>
                <div class="text-gray-600">Finishing: ${finishing}</div>
                <div class="text-gray-600">Subtotal: ${this.formatCurrency(item.subtotal_buy_price)}</div>
              </div>
            `;
          });
          detailHtml += `</div>`;
        }
      } else {
        // For offline orders, use existing format
        detailHtml = `
          <div class="grid grid-cols-[120px_10px_auto] gap-y-2 sm:gap-y-4 text-left text-lg px-4 sm:px-6">
            <div class="font-semibold">Kategori</div> <div class="text-center">:</div> <div class="ml-4">${order.category || '-'}</div>
            <div class="font-semibold">Nama Produk</div> <div class="text-center">:</div> <div class="ml-4">${order.productName || '-'}</div>
            <div class="font-semibold">Catatan</div> <div class="text-center">:</div> <div class="ml-4">${order.notes || '-'}</div>
            <div class="font-semibold">Ukuran</div> <div class="text-center">:</div> <div class="ml-4">${order.size || '-'}</div>
            <div class="font-semibold">Finishing</div> <div class="text-center">:</div> <div class="ml-4">${order.finishing || '-'}</div>
            <div class="font-semibold">Jumlah</div> <div class="text-center">:</div> <div class="ml-4">${order.quantity || '-'}</div>
            <div class="font-semibold">Total Harga</div> <div class="text-center">:</div> <div class="ml-4">${this.formatCurrency(order.totalPrice)}</div>
          </div>
        `;
      }

      Swal.fire({
        title: `<span class='text-xl sm:text-2xl font-bold'>Detail Pesanan #${order.orderNumber}</span>`,
        html: detailHtml,
        confirmButtonText: 'Tutup',
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
        },
      });
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

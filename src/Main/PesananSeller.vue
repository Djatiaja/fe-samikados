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
        <!-- Filter Dropdown -->
        <div class="mb-4">
          <select
            v-model="statusFilter"
            class="block w-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Semua</option>
            <option value="masuk">Masuk</option>
            <option value="diproses">Diproses</option>
            <option value="dikirim">Dikirim</option>
          </select>
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
        <!-- Responsive Table -->
        <div class="overflow-auto rounded-lg shadow-md">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-red-600 text-white">
              <tr>
                <th class="p-4 text-center border-r border-gray-300">Nomor Pesanan</th>
                <th class="p-4 text-center border-r border-gray-300">Nama Pembeli</th>
                <th class="p-4 text-center border-r border-gray-300">Tanggal Pesanan</th>
                <th class="p-4 text-center border-r border-gray-300">Status</th>
                <th class="p-4 text-center">Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in filteredOrders" :key="index" class="text-center">
                <td class="p-4 text-center border-r border-gray-300">{{ order.orderNumber }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ order.customerName }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ order.orderDate }}</td>
                <td class="p-4 border-r border-gray-300">
                  <div class="flex justify-center">
                    <select
                      v-model="order.status"
                      :class="getStatusClass(order.status)"
                      class="w-40 py-2 px-4 rounded-lg text-white"
                      @change="confirmStatusChange(order)"
                    >
                      <option
                        value="masuk"
                        class="bg-red-600 text-white"
                        :disabled="!isStatusAllowed(order.prevStatus, 'masuk')"
                      >
                        Masuk
                      </option>
                      <option
                        value="diproses"
                        class="bg-yellow-500 text-white"
                        :disabled="!isStatusAllowed(order.prevStatus, 'diproses')"
                      >
                        Diproses
                      </option>
                      <option
                        value="dikirim"
                        class="bg-blue-500 text-white"
                        :disabled="!isStatusAllowed(order.prevStatus, 'dikirim')"
                      >
                        Dikirim
                      </option>
                    </select>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <button @click="viewOrderDetail(order)" class="text-blue-500">
                    Lihat Detail
                  </button>
                </td>
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

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      statusFilter: 'all',
      entriesPerPage: 25,
      searchQuery: '',
      // Status flow: masuk -> diproses -> dikirim (can only move forward)
      statusOrder: ['masuk', 'diproses', 'dikirim'],
      orders: [
        {
          id: 1,
          orderNumber: '001234',
          customerName: 'Putri Maharani',
          orderDate: '7/10/24',
          status: 'masuk',
          prevStatus: 'masuk',
          category: 'Stiker',
          productName: 'Stiker Logo Custom',
          notes: 'Tolong pastikan warnanya cerah',
          size: '15 x 15 cm',
          finishing: 'Dengan Finishing',
          quantity: 50,
          totalPrice: 250000,
        },
        {
          id: 2,
          orderNumber: '001235',
          customerName: 'Budi Santoso',
          orderDate: '7/11/24',
          status: 'diproses',
          prevStatus: 'diproses',
          category: 'Banner',
          productName: 'Banner Promosi',
          notes: 'Perlu selesai cepat untuk acara weekend',
          size: '100 x 200 cm',
          finishing: 'Tanpa Finishing',
          quantity: 2,
          totalPrice: 350000,
        },
        {
          id: 3,
          orderNumber: '001236',
          customerName: 'Ahmad Hidayat',
          orderDate: '7/12/24',
          status: 'masuk',
          prevStatus: 'masuk',
          category: 'Kartu Nama',
          productName: 'Kartu Nama Premium',
          notes: 'Gunakan kertas tebal',
          size: '9 x 5.5 cm',
          finishing: 'Dengan Laminasi Glossy',
          quantity: 100,
          totalPrice: 175000,
        },
        {
          id: 4,
          orderNumber: '001237',
          customerName: 'Siti Rahayu',
          orderDate: '7/12/24',
          status: 'dikirim',
          prevStatus: 'dikirim',
          category: 'Brosur',
          productName: 'Brosur Produk',
          notes: 'Cetak 2 sisi, full color',
          size: 'A4',
          finishing: 'Dengan Finishing',
          quantity: 500,
          totalPrice: 750000,
        },
        {
          id: 5,
          orderNumber: '001238',
          customerName: 'Rudi Hartono',
          orderDate: '7/13/24',
          status: 'diproses',
          prevStatus: 'diproses',
          category: 'Poster',
          productName: 'Poster Event',
          notes: 'Cetak dengan warna yang tajam',
          size: 'A3',
          finishing: 'Laminasi Doff',
          quantity: 25,
          totalPrice: 375000,
        },
      ],
    }
  },
  computed: {
    filteredOrders() {
      let result = this.orders

      // Filter by status if not "all"
      if (this.statusFilter !== 'all') {
        result = result.filter((order) => order.status === this.statusFilter)
      }

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(
          (order) =>
            order.orderNumber.toLowerCase().includes(query) ||
            order.customerName.toLowerCase().includes(query) ||
            order.productName.toLowerCase().includes(query) ||
            order.category.toLowerCase().includes(query),
        )
      }

      return result
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
    // Get the appropriate class based on status
    getStatusClass(status) {
      switch (status) {
        case 'masuk':
          return 'bg-red-600'
        case 'diproses':
          return 'bg-yellow-500'
        case 'dikirim':
          return 'bg-blue-500'
        default:
          return 'bg-gray-500'
      }
    },
    // Check if status change is allowed (only forward progression)
    isStatusAllowed(prevStatus, newStatus) {
      const prevIndex = this.statusOrder.indexOf(prevStatus)
      const newIndex = this.statusOrder.indexOf(newStatus)
      // Allow selecting current status or moving forward
      return newIndex >= prevIndex
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
      console.log('Entries per page changed:', this.entriesPerPage)
    },
    confirmStatusChange(order) {
      // Store original status in case user cancels
      const originalStatus = order.prevStatus

      const statusText = {
        masuk: 'Masuk',
        diproses: 'Diproses',
        dikirim: 'Dikirim',
      }

      Swal.fire({
        title: `<span class='text-xl font-bold'>Konfirmasi Perubahan Status</span>`,
        html: `<p class='text-lg'>Apakah Anda yakin ingin mengubah status pesanan ${order.orderNumber} menjadi ${statusText[order.status]}?</p>`,
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 w-24 rounded-md mr-4',
          cancelButton: 'bg-gray-200 text-black py-2 w-24 rounded-md',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          console.log(`Status pesanan ${order.orderNumber} diubah menjadi ${order.status}`)
          // Update prevStatus to reflect the new status after confirmation
          order.prevStatus = order.status
        } else {
          // Revert to original status if user cancels
          order.status = originalStatus
        }
      })
    },
    viewOrderDetail(order) {
      // Format currency
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(amount)
      }

      Swal.fire({
        title: `<span class='text-xl sm:text-2xl font-bold'>Detail Pesanan #${order.orderNumber}</span>`,
        html: `
          <div class="grid grid-cols-[120px_10px_auto] gap-y-2 sm:gap-y-4 text-left text-lg px-4 sm:px-6">
            <div class="font-semibold">Kategori</div> <div class="text-center">:</div> <div class="ml-4">${order.category || '-'}</div>
            <div class="font-semibold">Nama Produk</div> <div class="text-center">:</div> <div class="ml-4">${order.productName || '-'}</div>
            <div class="font-semibold">Catatan</div> <div class="text-center">:</div> <div class="ml-4">${order.notes || '-'}</div>
            <div class="font-semibold">Ukuran</div> <div class="text-center">:</div> <div class="ml-4">${order.size || '-'}</div>
            <div class="font-semibold">Finishing</div> <div class="text-center">:</div> <div class="ml-4">${order.finishing || '-'}</div>
            <div class="font-semibold">Jumlah</div> <div class="text-center">:</div> <div class="ml-4">${order.quantity || '-'}</div>
            <div class="font-semibold">Total Harga</div> <div class="text-center">:</div> <div class="ml-4">${formatCurrency(order.totalPrice)}</div>
          </div>
        `,
        confirmButtonText: 'Tutup',
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
        },
      })
    },
  },
}
</script>

<style scoped>
/* Add custom styling for the disabled options */
select option:disabled {
  color: #999;
  background-color: #f0f0f0;
}
</style>

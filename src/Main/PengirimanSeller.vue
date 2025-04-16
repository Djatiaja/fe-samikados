<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <HeaderSeller @toggle-sidebar="toggleSidebar" :showSearch="true">
      <template #search>
        <div class="relative w-full">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari pengiriman..."
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
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Pengiriman</h2>

        <!-- Filter Dropdown -->
        <div class="mb-4">
          <select
            v-model="statusFilter"
            class="block w-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            @change="resetPagination"
          >
            <option value="all">Semua</option>
            <option value="perjalanan">Dalam Perjalanan</option>
            <option value="diterima">Diterima</option>
          </select>
        </div>

        <!-- Entries per page -->
        <div class="mb-4">
          <label for="entriesPerPage" class="mr-2">Entries per page:</label>
          <select
            v-model="entriesPerPage"
            class="p-2 border border-gray-300 rounded-md"
            @change="resetPagination"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>

        <!-- Responsive Table -->
        <div class="overflow-auto rounded-lg shadow-md">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-red-600 text-white">
              <tr>
                <th class="p-4 text-center border-r border-gray-300">Nomor Pesanan</th>
                <th class="p-4 text-center border-r border-gray-300">Nama Pembeli</th>
                <th class="p-4 text-center border-r border-gray-300">No Resi</th>
                <th class="p-4 text-center border-r border-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedOrders.length === 0" class="border-b border-gray-300">
                <td colspan="4" class="p-4 text-center">Tidak ada data pesanan</td>
              </tr>
              <tr v-for="order in paginatedOrders" :key="order.id" class="border-b border-gray-300">
                <td class="p-4 text-center border-r border-gray-300">{{ order.orderNumber }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ order.customerName }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ order.trackingNumber }}</td>
                <td class="p-4 text-center">{{ order.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex flex-col md:flex-row justify-between items-center">
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
      // Contoh data pesanan
      orders: [
        {
          id: 1,
          orderNumber: '001235',
          customerName: 'Ananda Yesaya',
          trackingNumber: '782559',
          status: 'Dalam Perjalanan',
        },
        {
          id: 2,
          orderNumber: '001236',
          customerName: 'Budi Santoso',
          trackingNumber: '782560',
          status: 'Diterima',
        },
        {
          id: 3,
          orderNumber: '001237',
          customerName: 'Cahya Dewi',
          trackingNumber: '782561',
          status: 'Dalam Perjalanan',
        },
        {
          id: 4,
          orderNumber: '001238',
          customerName: 'Deni Wijaya',
          trackingNumber: '782562',
          status: 'Diterima',
        },
        {
          id: 5,
          orderNumber: '001239',
          customerName: 'Eka Putra',
          trackingNumber: '782563',
          status: 'Dalam Perjalanan',
        },
        {
          id: 6,
          orderNumber: '001240',
          customerName: 'Fitra Ramadhan',
          trackingNumber: '782564',
          status: 'Diterima',
        },
        {
          id: 7,
          orderNumber: '001241',
          customerName: 'Gita Permata',
          trackingNumber: '782565',
          status: 'Dalam Perjalanan',
        },
        {
          id: 8,
          orderNumber: '001242',
          customerName: 'Hadi Gunawan',
          trackingNumber: '782566',
          status: 'Diterima',
        },
        {
          id: 9,
          orderNumber: '001243',
          customerName: 'Indah Sari',
          trackingNumber: '782567',
          status: 'Dalam Perjalanan',
        },
        {
          id: 10,
          orderNumber: '001244',
          customerName: 'Joko Susilo',
          trackingNumber: '782568',
          status: 'Diterima',
        },
        {
          id: 11,
          orderNumber: '001245',
          customerName: 'Kiki Amelia',
          trackingNumber: '782569',
          status: 'Dalam Perjalanan',
        },
        {
          id: 12,
          orderNumber: '001246',
          customerName: 'Lina Wati',
          trackingNumber: '782570',
          status: 'Diterima',
        },
        {
          id: 13,
          orderNumber: '001247',
          customerName: 'Maman Suryaman',
          trackingNumber: '782571',
          status: 'Dalam Perjalanan',
        },
        {
          id: 14,
          orderNumber: '001248',
          customerName: 'Nina Oktavia',
          trackingNumber: '782572',
          status: 'Diterima',
        },
        {
          id: 15,
          orderNumber: '001249',
          customerName: 'Oni Kurniawan',
          trackingNumber: '782573',
          status: 'Dalam Perjalanan',
        },
        {
          id: 16,
          orderNumber: '001250',
          customerName: 'Putri Handayani',
          trackingNumber: '782574',
          status: 'Diterima',
        },
        {
          id: 17,
          orderNumber: '001251',
          customerName: 'Qomar Zainudin',
          trackingNumber: '782575',
          status: 'Dalam Perjalanan',
        },
        {
          id: 18,
          orderNumber: '001252',
          customerName: 'Rudi Hartono',
          trackingNumber: '782576',
          status: 'Diterima',
        },
        {
          id: 19,
          orderNumber: '001253',
          customerName: 'Siti Nurhayati',
          trackingNumber: '782577',
          status: 'Dalam Perjalanan',
        },
        {
          id: 20,
          orderNumber: '001254',
          customerName: 'Tono Sudarso',
          trackingNumber: '782578',
          status: 'Diterima',
        },
        {
          id: 21,
          orderNumber: '001255',
          customerName: 'Untung Setiawan',
          trackingNumber: '782579',
          status: 'Dalam Perjalanan',
        },
        {
          id: 22,
          orderNumber: '001256',
          customerName: 'Vina Mulyana',
          trackingNumber: '782580',
          status: 'Diterima',
        },
        {
          id: 23,
          orderNumber: '001257',
          customerName: 'Wawan Hermawan',
          trackingNumber: '782581',
          status: 'Dalam Perjalanan',
        },
        {
          id: 24,
          orderNumber: '001258',
          customerName: 'Xaverius Budi',
          trackingNumber: '782582',
          status: 'Diterima',
        },
        {
          id: 25,
          orderNumber: '001259',
          customerName: 'Yanti Kusuma',
          trackingNumber: '782583',
          status: 'Dalam Perjalanan',
        },
        {
          id: 26,
          orderNumber: '001260',
          customerName: 'Zainal Abidin',
          trackingNumber: '782584',
          status: 'Diterima',
        },
      ],
    }
  },
  computed: {
    // Filter pesanan berdasarkan status dan pencarian
    filteredOrders() {
      let filtered = [...this.orders]

      // Filter berdasarkan status
      if (this.statusFilter !== 'all') {
        const statusMap = {
          perjalanan: 'Dalam Perjalanan',
          diterima: 'Diterima',
        }
        filtered = filtered.filter((order) => order.status === statusMap[this.statusFilter])
      }

      // Filter berdasarkan pencarian
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(
          (order) =>
            order.orderNumber.toLowerCase().includes(query) ||
            order.customerName.toLowerCase().includes(query) ||
            order.trackingNumber.toLowerCase().includes(query),
        )
      }

      return filtered
    },

    // Menghitung total halaman
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.entriesPerPage) || 1
    },

    // Menghitung dan menampilkan halaman yang ditampilkan
    displayedPages() {
      const pages = []
      const maxPagesToShow = 5

      if (this.totalPages <= maxPagesToShow) {
        // Jika total halaman kurang dari atau sama dengan maxPagesToShow, tampilkan semua halaman
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Selalu tampilkan halaman pertama
        pages.push(1)

        // Tentukan halaman tengah untuk ditampilkan
        let startPage = Math.max(2, this.currentPage - 1)
        let endPage = Math.min(this.totalPages - 1, this.currentPage + 1)

        // Tambahkan elipsis jika diperlukan antara halaman pertama dan halaman tengah
        if (startPage > 2) {
          pages.push('...')
        }

        // Tambahkan halaman-halaman tengah
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }

        // Tambahkan elipsis jika diperlukan antara halaman tengah dan halaman terakhir
        if (endPage < this.totalPages - 1) {
          pages.push('...')
        }

        // Selalu tampilkan halaman terakhir
        pages.push(this.totalPages)
      }

      return pages
    },

    // Mendapatkan pesanan yang ditampilkan di halaman saat ini
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.entriesPerPage
      const end = start + parseInt(this.entriesPerPage)
      return this.filteredOrders.slice(start, end)
    },

    // Menghitung indeks awal dari entries yang ditampilkan
    paginationStart() {
      if (this.filteredOrders.length === 0) return 0
      return (this.currentPage - 1) * this.entriesPerPage + 1
    },

    // Menghitung indeks akhir dari entries yang ditampilkan
    paginationEnd() {
      if (this.filteredOrders.length === 0) return 0
      return Math.min(this.currentPage * this.entriesPerPage, this.filteredOrders.length)
    },
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    // Reset pagination ketika pencarian berubah
    searchQuery() {
      this.resetPagination()
    },
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
    // Metode untuk berpindah ke halaman tertentu
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    // Reset pagination ke halaman pertama
    resetPagination() {
      this.currentPage = 1
    },
  },
}
</script>

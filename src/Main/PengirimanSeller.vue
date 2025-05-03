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
          >
            <option value="all">Semua</option>
            <option value="perjalanan">Dalam Perjalanan</option>
            <option value="diterima">Diterima</option>
          </select>
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
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div v-if="isLoading" class="text-gray-600">Loading data...</div>
        </div>

        <!-- Responsive Table -->
        <div class="overflow-auto rounded-lg shadow-md">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-red-600 text-white">
              <tr>
                <th class="p-4 text-center border-r border-gray-300">Nomor Pesanan</th>
                <th class="p-4 text-center border-r border-gray-300">Nama Pembeli</th>
                <th class="p-4 text-center border-r border-gray-300">No Resi</th>
                <th class="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-if="paginatedDeliveries.length === 0 && !isLoading"
                class="border-b border-gray-300"
              >
                <td colspan="4" class="p-4 text-center">Tidak ada data pengiriman</td>
              </tr>
              <tr
                v-for="delivery in paginatedDeliveries"
                :key="delivery.id"
                class="border-b border-gray-300 hover:bg-gray-100"
              >
                <td class="p-4 text-center border-r border-gray-300">{{ delivery.id }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ delivery.user.name }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ delivery.resi }}</td>
                <td class="p-4 text-center">
                  <span
                    class="px-3 py-1 rounded-full text-sm"
                    :class="getStatusClass(delivery.status)"
                  >
                    {{ delivery.original_status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="deliveries.length > 0"
          class="mt-6 flex flex-col md:flex-row justify-between items-center"
        >
          <div class="text-sm text-gray-600 mb-4 md:mb-0">
            Showing {{ paginationInfo.from }} to {{ paginationInfo.to }} of
            {{ filteredDeliveries.length }} entries
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
import axios from 'axios'

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      statusFilter: 'all',
      entriesPerPage: 25,
      currentPage: 1,
      searchQuery: '',
      deliveries: [],
      isLoading: true,
      baseUrl: 'http://127.0.0.1:8000/api',
      maxPageButtons: 5, // Maximum number of page buttons to display
    }
  },
  computed: {
    filteredDeliveries() {
      let filtered = [...this.deliveries]

      // Apply status filter
      if (this.statusFilter !== 'all') {
        filtered = filtered.filter(
          (delivery) => (delivery.status || 'perjalanan') === this.statusFilter,
        )
      }

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (delivery) =>
            delivery.user.name.toLowerCase().includes(query) ||
            delivery.resi.toLowerCase().includes(query) ||
            delivery.id.toString().includes(query),
        )
      }

      return filtered
    },
    paginatedDeliveries() {
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.entriesPerPage
      const endIndex = startIndex + parseInt(this.entriesPerPage)
      return this.filteredDeliveries.slice(startIndex, endIndex)
    },
    totalPages() {
      return Math.ceil(this.filteredDeliveries.length / this.entriesPerPage) || 1
    },
    paginationInfo() {
      const from =
        this.filteredDeliveries.length === 0 ? 0 : (this.currentPage - 1) * this.entriesPerPage + 1
      const to = Math.min(from + parseInt(this.entriesPerPage) - 1, this.filteredDeliveries.length)
      return { from, to }
    },
    displayedPages() {
      if (this.totalPages <= this.maxPageButtons) {
        // If we have fewer pages than maxPageButtons, show all page numbers
        return Array.from({ length: this.totalPages }, (_, i) => i + 1)
      }

      let pages = []
      const halfMax = Math.floor(this.maxPageButtons / 2)

      // Always show first page
      pages.push(1)

      // Show ellipsis if current page is more than halfMax + 2 from start
      if (this.currentPage > halfMax + 2) {
        pages.push('...')
      }

      // Pages around current page
      const startPage = Math.max(2, this.currentPage - halfMax)
      const endPage = Math.min(this.totalPages - 1, this.currentPage + halfMax)

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== this.totalPages) {
          pages.push(i)
        }
      }

      // Show ellipsis if current page is more than halfMax + 2 from end
      if (this.currentPage < this.totalPages - halfMax - 1) {
        pages.push('...')
      }

      // Always show last page if it's not page 1
      if (this.totalPages > 1) {
        pages.push(this.totalPages)
      }

      return pages
    },
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)

    // Set authentication token
    const token = localStorage.getItem('token')
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    this.fetchDeliveries()
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
    fetchDeliveries() {
      this.isLoading = true
      axios
        .get(`${this.baseUrl}/seller/pengiriman`)
        .then((response) => {
          if (response.data.status === 'success') {
            // Save all deliveries and set status as status
            this.deliveries = response.data.data.map((delivery) => {
              return {
                ...delivery,
                // Use status as status but always display as "perjalanan"
                status: 'perjalanan',
                original_status: delivery.status,
              }
            })
          } else {
            console.error('Failed to fetch deliveries:', response.data.error)
          }
        })
        .catch((error) => {
          console.error('Error fetching deliveries:', error)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    changeEntriesPerPage() {
      this.currentPage = 1 // Reset to first page when changing entries per page
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    getStatusClass(status) {
      // Always return yellow color for now
      return 'bg-yellow-100 text-yellow-800'
    },
    // Method removed as action button is no longer needed
  },
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>

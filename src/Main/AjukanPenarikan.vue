<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <HeaderSeller @toggle-sidebar="toggleSidebar" :showSearch="true">
      <template #search>
        <div class="relative w-full">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari penarikan..."
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
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Penarikan Dana</h2>

        <div class="bg-white p-4 rounded-lg shadow-md mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold">Saldo Tersedia</h3>
              <p class="text-2xl font-bold text-red-600">Rp{{ formatCurrency(userBalance) }}</p>
            </div>
            <button
              @click="showWithdrawalModal"
              class="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition"
              :disabled="isLoadingBalance"
            >
              <span v-if="!isLoadingBalance">Tarik Dana</span>
              <span v-else>Memuat...</span>
            </button>
          </div>
        </div>

        <div class="items-center mb-4">
          <!-- Filter Dropdown -->
          <select
            v-model="statusFilter"
            class="block w-54 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Semua</option>
            <option value="Disetujui">Berhasil</option>
            <option value="Ditolak">Ditolak</option>
            <option value="Menunggu">Menunggu</option>
          </select>
        </div>

        <!-- Entries per page -->
        <div class="mb-4">
          <label for="entriesPerPage" class="mr-2">Entries per page:</label>
          <select
            v-model="entriesPerPage"
            class="p-2 border border-gray-300 rounded-md"
            @change="updatePagination"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingWithdrawals" class="text-center py-8">
          <p>Memuat data penarikan...</p>
        </div>

        <!-- Error State -->
        <div
          v-else-if="errorWithdrawals"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        >
          {{ errorWithdrawals }}
        </div>

        <!-- Responsive Table -->
        <div v-else class="overflow-auto rounded-lg shadow-md">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-red-600 text-white">
              <tr>
                <th class="p-4 text-center border-r border-gray-300">Penarikan Ke -</th>
                <th class="p-4 text-center border-r border-gray-300">Rekening Tujuan</th>
                <th class="p-4 text-center border-r border-gray-300">Jumlah Penarikan</th>
                <th class="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="withdrawal in paginatedWithdrawals"
                :key="withdrawal.id"
                class="border-b border-gray-300 hover:bg-gray-50"
              >
                <td class="p-4 text-center border-r border-gray-300">{{ withdrawal.id }}</td>
                <td class="p-4 text-center border-r border-gray-300">
                  {{ withdrawal.no_rekening }}
                </td>
                <td class="p-4 text-center border-r border-gray-300">
                  Rp{{ formatCurrency(withdrawal.jumlah) }}
                </td>
                <td
                  class="p-4 text-center"
                  :class="{
                    'text-green-500': withdrawal.status === 'Disetujui',
                    'text-red-600': withdrawal.status === 'Ditolak',
                    'text-yellow-500': withdrawal.status === 'Menunggu',
                  }"
                >
                  {{ withdrawal.status }}
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="paginatedWithdrawals.length === 0">
                <td colspan="4" class="p-4 text-center text-gray-500">Tidak ada data penarikan</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="filteredWithdrawals.length > 0"
          class="mt-6 flex flex-col md:flex-row justify-between items-center"
        >
          <div class="text-sm text-gray-600 mb-4 md:mb-0">
            Showing {{ paginationStart }} to {{ paginationEnd }} of
            {{ filteredWithdrawals.length }} entries
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
      currentPage: 1,
      searchQuery: '',
      userBalance: 0,
      banks: [],
      userBankAccounts: [],
      withdrawals: [],
      isLoadingBalance: false,
      isLoadingWithdrawals: false,
      isLoadingBankAccounts: false,
      errorWithdrawals: null,
      baseUrl: 'http://127.0.0.1:8000/api',
    }
  },
  computed: {
    filteredWithdrawals() {
      let filtered = [...this.withdrawals]

      if (this.statusFilter !== 'all') {
        filtered = filtered.filter((w) => w.status === this.statusFilter)
      }

      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (w) =>
            this.getBankName(w.bank_id).toLowerCase().includes(query) ||
            w.no_rekening.includes(query) ||
            w.jumlah.toString().includes(query),
        )
      }

      return filtered
    },
    totalPages() {
      return Math.ceil(this.filteredWithdrawals.length / parseInt(this.entriesPerPage))
    },
    paginatedWithdrawals() {
      const start = (this.currentPage - 1) * parseInt(this.entriesPerPage)
      const end = start + parseInt(this.entriesPerPage)
      return this.filteredWithdrawals.slice(start, end)
    },
    paginationStart() {
      return this.filteredWithdrawals.length === 0
        ? 0
        : (this.currentPage - 1) * parseInt(this.entriesPerPage) + 1
    },
    paginationEnd() {
      const calculatedEnd = this.currentPage * parseInt(this.entriesPerPage)
      return calculatedEnd > this.filteredWithdrawals.length
        ? this.filteredWithdrawals.length
        : calculatedEnd
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
  async mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)

    try {
      // Set authorization header first, like in code 2
      const token = localStorage.getItem('token')
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Then load initial data
      await Promise.all([
        this.fetchUserBalance(),
        this.fetchBanks(),
        this.fetchUserBankAccounts(),
        this.fetchWithdrawals(),
      ])
    } catch (error) {
      console.error('Initialization error:', error)
      this.handleApiError(error)
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleUnauthorized() {
      // Show notification first
      Swal.fire({
        title: 'Sesi Habis',
        text: 'Silakan login kembali',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        // Then clear storage and redirect
        localStorage.removeItem('token')
        this.$router.push('/login')
      })
    },
    handleApiError(error) {
      console.error('API Error:', error)

      // Check for unauthorized error (401)
      if (error.response && error.response.status === 401) {
        this.handleUnauthorized()
        return
      }

      const message = error.response?.data?.message || 'Terjadi kesalahan pada server'
      Swal.fire({
        title: 'Error!',
        text: message,
        icon: 'error',
        confirmButtonColor: '#d33',
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
    formatCurrency(value) {
      return new Intl.NumberFormat('id-ID').format(value)
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('id-ID', options)
    },
    getBankName(bankId) {
      const bank = this.banks.find((b) => b.id === bankId)
      return bank ? bank.nama : 'Unknown Bank'
    },
    updatePagination() {
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages
      }
      // No need to call fetchWithdrawals() here as we're doing client-side pagination
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    async fetchUserBalance() {
      this.isLoadingBalance = true
      try {
        // Ensure token is set before making request
        const token = localStorage.getItem('token')
        if (!token) {
          this.handleUnauthorized()
          return
        }

        const response = await axios.get(`${this.baseUrl}/seller/saldo`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.status === 'success') {
          this.userBalance = response.data.data.Saldo
        }
      } catch (error) {
        this.handleApiError(error)
      } finally {
        this.isLoadingBalance = false
      }
    },
    async fetchBanks() {
      try {
        // Ensure token is set before making request
        const token = localStorage.getItem('token')
        if (!token) {
          this.handleUnauthorized()
          return
        }

        const response = await axios.get(`${this.baseUrl}/seller/banks`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.status === 'success') {
          this.banks = response.data.data
        }
      } catch (error) {
        this.handleApiError(error)
      }
    },
    async fetchUserBankAccounts() {
      this.isLoadingBankAccounts = true
      try {
        // Ensure token is set before making request
        const token = localStorage.getItem('token')
        if (!token) {
          this.handleUnauthorized()
          return
        }

        const response = await axios.get(`${this.baseUrl}/seller/rekening`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.status === 'success') {
          this.userBankAccounts = response.data.data
        }
      } catch (error) {
        this.handleApiError(error)
      } finally {
        this.isLoadingBankAccounts = false
      }
    },
    async fetchWithdrawals() {
      this.isLoadingWithdrawals = true
      this.errorWithdrawals = null
      try {
        // Ensure token is set before making request
        const token = localStorage.getItem('token')
        if (!token) {
          this.handleUnauthorized()
          return
        }

        // Fetch all withdrawals at once instead of paginating on server
        // We'll handle pagination client-side
        const response = await axios.get(`${this.baseUrl}/seller/withdrawals`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.status === 'success') {
          this.withdrawals = response.data.data
        }
      } catch (error) {
        this.errorWithdrawals = 'Gagal memuat data penarikan'
        this.handleApiError(error)
      } finally {
        this.isLoadingWithdrawals = false
      }
    },
    showWithdrawalModal() {
      if (this.userBankAccounts.length === 0) {
        this.showAddBankAccountModal()
        return
      }

      const bankOptions = this.userBankAccounts
        .map((account) => {
          const bankName = this.getBankName(account.bank_id)
          return `<option value="${account.id}">${bankName} - ${account.rekening}</option>`
        })
        .join('')

      Swal.fire({
        title: `<h3 class="text-lg font-bold">Formulir Penarikan</h3>`,
        html: `
          <div class="text-right mb-3">
            <button id="add-account-btn" type="button" class="bg-white text-gray-700 font-bold py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm">
              + Tujuan Baru
            </button>
          </div>
          <form id="withdrawalForm" class="text-left form-compact">
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="bank">
                Rekening Tujuan
              </label>
              <select id="account-select" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
                <option value="">Pilih Rekening</option>
                ${bankOptions}
              </select>
            </div>

            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="amount">
                Jumlah Penarikan
              </label>
              <input id="amount" type="number" class="w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Masukkan jumlah penarikan">
              <p class="text-sm text-gray-500 mt-1">Jumlah maksimal: Rp${this.formatCurrency(this.userBalance)}</p>
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
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Ajukan Penarikan',
        width: 600,
        preConfirm: () => {
          const accountId = document.getElementById('account-select').value
          const amount = document.getElementById('amount').value

          if (!accountId) {
            Swal.showValidationMessage('Silakan pilih rekening tujuan')
            return false
          }

          if (!amount || amount <= 0) {
            Swal.showValidationMessage('Silakan masukkan jumlah penarikan yang valid')
            return false
          }

          if (parseFloat(amount) > this.userBalance) {
            Swal.showValidationMessage('Jumlah penarikan melebihi saldo tersedia')
            return false
          }

          return {
            rekening_id: accountId,
            jumlah: amount,
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.submitWithdrawalRequest(result.value)
        }
      })

      document.getElementById('add-account-btn').addEventListener('click', () => {
        Swal.close()
        this.showAddBankAccountModal()
      })
    },
    showAddBankAccountModal() {
      const bankOptions = this.banks
        .map((bank) => `<option value="${bank.id}">${bank.nama}</option>`)
        .join('')

      Swal.fire({
        title: `<h3 class="text-lg font-bold">Tambah Rekening Baru</h3>`,
        html: `
          <form id="bankAccountForm" class="text-left form-compact">
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="new-bank">
                Nama Bank
              </label>
              <select id="new-bank" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
                <option value="">Pilih Bank</option>
                ${bankOptions}
              </select>
            </div>

            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="new-account-number">
                Nomor Rekening
              </label>
              <input id="new-account-number" type="text" class="w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Masukkan Nomor Rekening">
            </div>

            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="new-account-name">
                Nama Pemilik Rekening
              </label>
              <input id="new-account-name" type="text" class="w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Masukkan Nama Pemilik Rekening">
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
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Simpan',
        width: 600,
        preConfirm: () => {
          const bankId = document.getElementById('new-bank').value
          const accountNumber = document.getElementById('new-account-number').value
          const accountName = document.getElementById('new-account-name').value

          if (!bankId) {
            Swal.showValidationMessage('Silakan pilih bank')
            return false
          }

          if (!accountNumber) {
            Swal.showValidationMessage('Silakan masukkan nomor rekening')
            return false
          }

          if (!accountName) {
            Swal.showValidationMessage('Silakan masukkan nama pemilik rekening')
            return false
          }

          return {
            bank_id: bankId,
            rekening: accountNumber,
            nama: accountName,
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.saveNewBankAccount(result.value)
        }
      })
    },
    async saveNewBankAccount(accountData) {
      try {
        // Ensure token is set before making request
        const token = localStorage.getItem('token')
        if (!token) {
          this.handleUnauthorized()
          return
        }

        const response = await axios.post(`${this.baseUrl}/seller/rekening`, accountData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.status === 'success') {
          Swal.fire({
            title: 'Berhasil!',
            text: response.data.message,
            icon: 'success',
            confirmButtonColor: '#3085d6',
          })
          await this.fetchUserBankAccounts()
          this.showWithdrawalModal()
        }
      } catch (error) {
        this.handleApiError(error)
      }
    },
    async submitWithdrawalRequest(data) {
      try {
        // Ensure token is set before making request
        const token = localStorage.getItem('token')
        if (!token) {
          this.handleUnauthorized()
          return
        }

        const response = await axios.post(
          `${this.baseUrl}/seller/withdrawal`,
          {
            jumlah: data.jumlah,
            rekening_id: data.rekening_id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        if (response.data.status === 'success') {
          Swal.fire({
            title: 'Berhasil!',
            text: response.data.message,
            icon: 'success',
            confirmButtonColor: '#3085d6',
          })
          await Promise.all([this.fetchUserBalance(), this.fetchWithdrawals()])
        }
      } catch (error) {
        this.handleApiError(error)
      }
    },
  },
  watch: {
    // Reset to page 1 when filter or search changes
    statusFilter() {
      this.currentPage = 1
    },
    searchQuery() {
      this.currentPage = 1
    },
  },
}
</script>

<style scoped>
.content-wrapper {
  transition: margin-left 0.3s ease;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

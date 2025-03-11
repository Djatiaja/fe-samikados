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
              <p class="text-2xl font-bold text-red-600">Rp{{ userBalance.toLocaleString() }}</p>
            </div>
            <button
              @click="showWithdrawalModal"
              class="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition"
            >
              <span>Tarik Dana</span>
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
            <option value="active">Berhasil</option>
            <option value="inactive">Ditolak</option>
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
                <th class="p-4 text-center border-r border-gray-300">Penarikan Ke -</th>
                <th class="p-4 text-center border-r border-gray-300">Bank Tujuan</th>
                <th class="p-4 text-center border-r border-gray-300">Rekening Tujuan</th>
                <th class="p-4 text-center border-r border-gray-300">Jumlah Penarikan</th>
                <th class="p-4 text-center border-r border-gray-300">Tanggal</th>
                <th class="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(withdrawal, index) in filteredWithdrawals"
                :key="withdrawal.id"
                class="border-b border-gray-300 hover:bg-gray-50"
              >
                <td class="p-4 text-center border-r border-gray-300">{{ withdrawal.id }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ withdrawal.bank }}</td>
                <td class="p-4 text-center border-r border-gray-300">
                  {{ withdrawal.accountNumber }}
                </td>
                <td class="p-4 text-center border-r border-gray-300">
                  Rp{{ withdrawal.amount.toLocaleString() }}
                </td>
                <td class="p-4 text-center border-r border-gray-300">{{ withdrawal.date }}</td>
                <td
                  class="p-4 text-center"
                  :class="{
                    'text-green-500': withdrawal.status === 'Berhasil',
                    'text-red-600': withdrawal.status === 'Ditolak',
                    'text-yellow-500': withdrawal.status === 'Menunggu',
                  }"
                >
                  {{ withdrawal.status }}
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="filteredWithdrawals.length === 0">
                <td colspan="6" class="p-4 text-center text-gray-500">Tidak ada data penarikan</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination can be added here -->
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
      withdrawals: [],
      userBankAccounts: [],
      userBalance: 10000000, // Default balance in Rupiah
      products: [
        {
          id: 1,
          category: 'Merchandise',
          name: 'PIN PENITI 58mm',
          description: 'Temukan solusi praktis untuk kebutuhan promosi.',
          stock: 250,
          price: 4500,
          images: [
            'https://placehold.co/400x400/red/white?text=PIN+1',
            'https://placehold.co/400x400/blue/white?text=PIN+2',
            'https://placehold.co/400x400/green/white?text=PIN+3',
          ],
          status: 'aktif',
        },
        // More products as needed
      ],
    }
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)

    // Load withdrawal data
    this.fetchWithdrawals()

    // Load user bank accounts
    this.fetchUserBankAccounts()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  computed: {
    filteredWithdrawals() {
      let filtered = [...this.withdrawals]

      // Apply status filter
      if (this.statusFilter !== 'all') {
        filtered = filtered.filter((w) => {
          if (this.statusFilter === 'active') return w.status === 'Berhasil'
          if (this.statusFilter === 'inactive') return w.status === 'Ditolak'
          return true
        })
      }

      // Apply search filter
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (w) =>
            w.bank.toLowerCase().includes(query) ||
            w.accountNumber.includes(query) ||
            w.amount.toString().includes(query),
        )
      }

      return filtered
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
    changeEntriesPerPage() {
      // Logic to handle entries per page change
    },

    // Fetch withdrawal history from API
    fetchWithdrawals() {
      // For demo purposes, we'll add sample data
      // In real app, this would be an API call
      this.withdrawals = [
        {
          id: 1,
          bank: 'BCA',
          accountNumber: '1234567890',
          accountName: 'John Doe',
          amount: 1000000,
          status: 'Berhasil',
          date: '2025-03-05',
        },
        {
          id: 2,
          bank: 'BNI',
          accountNumber: '0987654321',
          accountName: 'Jane Smith',
          amount: 1500000,
          status: 'Ditolak',
          date: '2025-03-01',
        },
        // Add more sample data as needed
      ]
    },

    // Fetch user bank accounts from API
    fetchUserBankAccounts() {
      // For demo purposes, we'll add sample data
      // In real app, this would be an API call
      this.userBankAccounts = [
        {
          id: 1,
          bank: 'BCA',
          accountNumber: '1234567890',
          accountName: 'John Doe',
        },
        {
          id: 2,
          bank: 'BNI',
          accountNumber: '0987654321',
          accountName: 'Jane Smith',
        },
        // Add more sample data as needed
      ]
    },

    // Show withdrawal request modal
    showWithdrawalModal() {
      if (this.userBankAccounts.length === 0) {
        // If no bank accounts, prompt to add one first
        this.showAddBankAccountModal()
        return
      }

      // Create bank accounts dropdown options
      const bankOptions = this.userBankAccounts
        .map((account) => {
          return `<option value="${account.id}">${account.bank} - ${account.accountNumber}</option>`
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
                Nama Bank
              </label>
              <select id="bank-select" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
                <option value="">Pilih Bank</option>
                ${bankOptions}
              </select>
            </div>
            
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="account">
                Rekening Tujuan
              </label>
              <select id="account-select" class="w-full text-sm p-2 border border-gray-300 rounded-lg" disabled>
                <option value="">Pilih Rekening</option>
              </select>
            </div>
            
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="accountName">
                Nama Pemilik Rekening
              </label>
              <input id="account-name" type="text" class="w-full text-sm p-2 border border-gray-300 rounded-lg" readonly>
            </div>
            
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="amount">
                Jumlah Penarikan
              </label>
              <input id="amount" type="number" class="w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Masukkan jumlah penarikan">
              <p class="text-sm text-gray-500 mt-1">Jumlah maksimal: Rp${this.userBalance.toLocaleString()}</p>
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
        confirmButtonText: 'Ajukan Penarikan',
        width: 600,
        preConfirm: () => {
          const bankId = document.getElementById('bank-select').value
          const amount = document.getElementById('amount').value

          // Validation
          if (!bankId) {
            Swal.showValidationMessage('Silakan pilih bank')
            return false
          }

          if (!amount || amount <= 0) {
            Swal.showValidationMessage('Silakan masukkan jumlah penarikan')
            return false
          }

          if (parseFloat(amount) > this.userBalance) {
            Swal.showValidationMessage('Jumlah penarikan melebihi saldo')
            return false
          }

          return {
            bankId: parseInt(bankId),
            amount: parseFloat(amount),
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Process withdrawal request
          this.submitWithdrawalRequest(result.value)
        }
      })

      // Setup event listeners for the modal
      document.getElementById('bank-select').addEventListener('change', (e) => {
        const accountId = e.target.value
        if (accountId) {
          const selectedAccount = this.userBankAccounts.find(
            (acc) => acc.id === parseInt(accountId),
          )
          if (selectedAccount) {
            document.getElementById('account-select').innerHTML =
              `<option value="${selectedAccount.id}">${selectedAccount.accountNumber}</option>`
            document.getElementById('account-name').value = selectedAccount.accountName
          }
        } else {
          document.getElementById('account-select').innerHTML =
            '<option value="">Pilih Rekening</option>'
          document.getElementById('account-name').value = ''
        }
      })

      document.getElementById('add-account-btn').addEventListener('click', () => {
        Swal.close()
        this.showAddBankAccountModal()
      })
    },

    // Show add bank account modal
    showAddBankAccountModal() {
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
                <option value="BCA">BCA</option>
                <option value="BNI">BNI</option>
                <option value="BRI">BRI</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BSI">BSI</option>
              </select>
            </div>
            
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="new-account-number">
                Nomor Rekening
              </label>
              <input id="new-account-number" type="number" class="w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Masukkan Nomor Rekening">
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
          actions: 'flex justify-center space-x-6', // Add spacing between buttons
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Simpan',
        width: 600,
        preConfirm: () => {
          const bank = document.getElementById('new-bank').value
          const accountNumber = document.getElementById('new-account-number').value
          const accountName = document.getElementById('new-account-name').value

          // Validation
          if (!bank) {
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
            bank,
            accountNumber,
            accountName,
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Save new bank account
          this.saveNewBankAccount(result.value)
        }
      })
    },

    // Save new bank account
    saveNewBankAccount(accountData) {
      // In a real app, this would be an API call
      const newAccount = {
        id: this.userBankAccounts.length + 1,
        bank: accountData.bank,
        accountNumber: accountData.accountNumber,
        accountName: accountData.accountName,
      }

      this.userBankAccounts.push(newAccount)

      Swal.fire({
        title: 'Berhasil!',
        text: 'Rekening baru berhasil ditambahkan',
        icon: 'success',
        confirmButtonColor: '#d9534f',
      }).then(() => {
        // Reopen withdrawal form with the new account selected
        this.showWithdrawalModal()
      })
    },

    // Submit withdrawal request
    submitWithdrawalRequest(data) {
      // Get selected account details
      const selectedAccount = this.userBankAccounts.find((acc) => acc.id === data.bankId)

      // In a real app, this would be an API call
      const newWithdrawal = {
        id: this.withdrawals.length + 1,
        bank: selectedAccount.bank,
        accountNumber: selectedAccount.accountNumber,
        accountName: selectedAccount.accountName,
        amount: data.amount,
        status: 'Menunggu', // Initial status
        date: new Date().toISOString().split('T')[0],
      }

      this.withdrawals.unshift(newWithdrawal)

      // Reduce user balance
      this.userBalance -= data.amount

      Swal.fire({
        title: "<span class='text-lg font-bold'>Berhasil!</span>",
        text: 'Permintaan penarikan berhasil diajukan',
        icon: 'success',
        buttonsStyling: false,
        customClass: {
          icon: 'custom-icon',
          confirmButton: 'bg-red-600 hover:bg-red-600 text-white py-2 w-28 rounded-md',
        },
      })
    },
  },
}
</script>

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
    <HeaderSeller @toggle-sidebar="toggleSidebar" />

    <!-- Sidebar -->
    <SidebarSeller :isSidebarActive="isSidebarActive" />

    <!-- Content Wrapper -->
    <div
      class="content-wrapper bg-gray-100 flex-1 mt-32 sm:mt-32 md:mt-16"
      :class="{ 'lg:ml-64': isSidebarActive }"
    >
      <div class="p-4 md:p-6 lg:p-8">
        <!-- Profile Section -->
        <div class="flex flex-col md:flex-row items-start md:space-x-20 justify-center">
          <!-- Profile Picture and Actions -->
          <div class="w-full md:w-1/4 flex flex-col items-center">
            <img
              :src="userData.profilePicture || 'https://placehold.co/300x300'"
              class="rounded-lg shadow-lg w-full max-w-xs min-w-60"
              alt="Profile Picture"
            />

            <!-- Button Ganti Foto Profil -->
            <button
              class="mt-5 w-full max-w-xs bg-red-600 text-white py-3 rounded-lg text-sm sm:text-base md:text-lg min-w-60"
              @click="openPhotoModal"
            >
              Ganti Foto Profil
            </button>

            <!-- Nonaktifkan Akun Toggle Switch -->
            <div class="flex items-center justify-center mt-3 md:mt-5 w-full">
              <label
                class="inline-flex justify-evenly items-center w-full max-w-xs bg-red-600 text-white py-3 rounded-lg text-sm sm:text-base min-w-60 px-4"
              >
                <span id="toggleLabel" class="text-xs sm:text-sm md:text-base lg:text-lg">{{
                  userData.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'
                }}</span>
                <input
                  type="checkbox"
                  id="toggleAccountStatus"
                  value=""
                  class="sr-only peer"
                  :checked="userData.isActive"
                  @change="toggleAccountStatus"
                />
                <div
                  class="relative w-10 h-5 bg-white rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-red-600 after:rounded-full after:h-4 after:w-4 after:transition-all"
                ></div>
              </label>
            </div>
          </div>

          <!-- Profile Details -->
          <div
            class="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg h-auto flex flex-col items-center justify-center mt-10 md:mt-0"
          >
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 text-center">
              Profil Saya
            </h2>
            <div class="space-y-4 w-5/6 mt-8">
              <div class="bg-gray-100 p-4 sm:p-5 lg:p-6 rounded-lg text-xs sm:text-sm md:text-base">
                {{ userData.storeName }}
              </div>
              <div class="bg-gray-100 p-4 sm:p-5 lg:p-6 rounded-lg text-xs sm:text-sm md:text-base">
                {{ userData.phone }}
              </div>
              <div class="bg-gray-100 p-4 sm:p-5 lg:p-6 rounded-lg text-xs sm:text-sm md:text-base">
                {{ userData.email }}
              </div>
            </div>
            <button
              class="mt-10 w-full max-w-md bg-red-600 text-white py-3 rounded-lg mb-4 text-sm sm:text-base md:text-lg"
              @click="openEditModal"
            >
              Edit Profil
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-20 md:mt-32 space-y-4 flex flex-col items-center justify-center">
          <button
            class="w-full max-w-md lg:w-1/3 bg-red-600 text-white py-3 rounded-xl text-sm sm:text-base"
            @click="openChangePasswordModal"
          >
            Ganti Password
          </button>
          <button
            class="w-full max-w-md lg:w-1/3 bg-red-600 text-white py-3 rounded-xl text-sm sm:text-base"
            @click="logout"
          >
            Log Out
          </button>
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
      userData: {
        storeName: 'RuangJayaPrint',
        phone: '081212341234',
        email: 'ruangjayaprint@gmail.com',
        profilePicture: 'https://placehold.co/300x300',
        isActive: true,
        balance: 1500000,
      },
      bankAccounts: [
        { id: 1, bankName: 'BCA', accountNumber: '1234567890', accountName: 'RuangJayaPrint' },
        { id: 2, bankName: 'Mandiri', accountNumber: '0987654321', accountName: 'RuangJayaPrint' },
      ],
      banks: [
        { id: 1, name: 'BCA' },
        { id: 2, name: 'Mandiri' },
        { id: 3, name: 'BNI' },
        { id: 4, name: 'BRI' },
      ],
    }
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
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
    toggleAccountStatus() {
      this.userData.isActive = !this.userData.isActive
      const statusMessage = this.userData.isActive ? 'diaktifkan' : 'dinonaktifkan'

      Swal.fire({
        title: `<h3 class="text-lg font-bold">Status Akun</h3>`,
        text: `Akun anda telah berhasil ${statusMessage}`,
        icon: 'success',
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6',
        },
      })
    },
    openPhotoModal() {
      Swal.fire({
        title: `<h3 class="text-lg font-bold">Ganti Foto Profil</h3>`,
        html: `
          <div class="mb-3">
            <label class="block text-gray-700 font-medium text-sm mb-1" for="profilePicture">
              Unggah Foto Baru
            </label>
            <input id="profilePicture" type="file" accept="image/*" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
            <p class="text-sm text-gray-500 mt-1">Maksimal ukuran 2MB (PNG, JPG, JPEG)</p>
          </div>
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
        width: 500,
        preConfirm: () => {
          const fileInput = document.getElementById('profilePicture')
          if (!fileInput.files.length) {
            Swal.showValidationMessage('Silakan pilih file foto')
            return false
          }

          // In a real app, you would handle file upload to server here
          // For demo, just update with a placeholder
          this.userData.profilePicture = 'https://placehold.co/300x300'
          return true
        },
      })
    },
    openEditModal() {
      Swal.fire({
        title: `<h3 class="text-lg font-bold">Edit Profil</h3>`,
        html: `
          <form id="editProfileForm" class="text-left">
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="storeName">
                Nama Toko
              </label>
              <input id="storeName" type="text" class="w-full text-sm p-2 border border-gray-300 rounded-lg" value="${this.userData.storeName}">
            </div>

            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="phone">
                Nomor Telepon
              </label>
              <input id="phone" type="text" class="w-full text-sm p-2 border border-gray-300 rounded-lg" value="${this.userData.phone}">
            </div>

            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="email">
                Email
              </label>
              <input id="email" type="email" class="w-full text-sm p-2 border border-gray-300 rounded-lg" value="${this.userData.email}">
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
        width: 500,
        preConfirm: () => {
          const storeName = document.getElementById('storeName').value
          const phone = document.getElementById('phone').value
          const email = document.getElementById('email').value

          if (!storeName) {
            Swal.showValidationMessage('Nama toko tidak boleh kosong')
            return false
          }

          if (!phone) {
            Swal.showValidationMessage('Nomor telepon tidak boleh kosong')
            return false
          }

          if (!email) {
            Swal.showValidationMessage('Email tidak boleh kosong')
            return false
          }

          // Update the user data with new values
          this.userData.storeName = storeName
          this.userData.phone = phone
          this.userData.email = email

          return true
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `<h3 class="text-lg font-bold">Sukses!</h3>`,
            text: 'Profil berhasil diperbarui',
            icon: 'success',
            confirmButtonText: 'OK',
            buttonsStyling: false,
            customClass: {
              confirmButton:
                'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6',
            },
          })
        }
      })
    },
    openChangePasswordModal() {
      Swal.fire({
        title: `<h3 class="text-lg font-bold">Ganti Password</h3>`,
        html: `
          <form id="changePasswordForm" class="text-left">
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="currentPassword">
                Password Saat Ini
              </label>
              <input id="currentPassword" type="password" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
            </div>

            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="newPassword">
                Password Baru
              </label>
              <input id="newPassword" type="password" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
            </div>

            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="confirmPassword">
                Konfirmasi Password Baru
              </label>
              <input id="confirmPassword" type="password" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
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
        width: 500,
        preConfirm: () => {
          const currentPassword = document.getElementById('currentPassword').value
          const newPassword = document.getElementById('newPassword').value
          const confirmPassword = document.getElementById('confirmPassword').value

          if (!currentPassword) {
            Swal.showValidationMessage('Password saat ini tidak boleh kosong')
            return false
          }

          if (!newPassword) {
            Swal.showValidationMessage('Password baru tidak boleh kosong')
            return false
          }

          if (newPassword.length < 8) {
            Swal.showValidationMessage('Password harus minimal 8 karakter')
            return false
          }

          if (newPassword !== confirmPassword) {
            Swal.showValidationMessage('Konfirmasi password tidak cocok')
            return false
          }

          return true
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `<h3 class="text-lg font-bold">Sukses!</h3>`,
            text: 'Password berhasil diperbarui',
            icon: 'success',
            confirmButtonText: 'OK',
            buttonsStyling: false,
            customClass: {
              confirmButton:
                'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6',
            },
          })
        }
      })
    },
    openWithdrawalModal() {
      const bankOptions = this.banks
        .map((bank) => `<option value="${bank.id}">${bank.name}</option>`)
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
              <p class="text-sm text-gray-500 mt-1">Jumlah maksimal: Rp${this.userData.balance.toLocaleString()}</p>
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
        didOpen: () => {
          // Add event listeners
          const bankSelect = document.getElementById('bank-select')
          const accountSelect = document.getElementById('account-select')
          const accountName = document.getElementById('account-name')
          const addAccountBtn = document.getElementById('add-account-btn')

          bankSelect.addEventListener('change', () => {
            const bankId = bankSelect.value
            if (bankId) {
              // Enable account select
              accountSelect.disabled = false

              // Filter accounts by bank
              const filteredAccounts = this.bankAccounts.filter(
                (acc) => acc.bankName === this.banks.find((b) => b.id === parseInt(bankId))?.name,
              )

              // Clear and populate account select
              accountSelect.innerHTML = '<option value="">Pilih Rekening</option>'
              filteredAccounts.forEach((acc) => {
                const option = document.createElement('option')
                option.value = acc.id
                option.textContent = acc.accountNumber
                accountSelect.appendChild(option)
              })
            } else {
              accountSelect.disabled = true
              accountSelect.innerHTML = '<option value="">Pilih Rekening</option>'
              accountName.value = ''
            }
          })

          accountSelect.addEventListener('change', () => {
            const accountId = accountSelect.value
            if (accountId) {
              const selectedAccount = this.bankAccounts.find(
                (acc) => acc.id === parseInt(accountId),
              )
              accountName.value = selectedAccount ? selectedAccount.accountName : ''
            } else {
              accountName.value = ''
            }
          })

          addAccountBtn.addEventListener('click', () => {
            this.openAddBankAccountModal()
          })
        },
        preConfirm: () => {
          const bankId = document.getElementById('bank-select').value
          const accountId = document.getElementById('account-select').value
          const amount = document.getElementById('amount').value

          // Validation
          if (!bankId) {
            Swal.showValidationMessage('Silakan pilih bank')
            return false
          }

          if (!accountId) {
            Swal.showValidationMessage('Silakan pilih rekening tujuan')
            return false
          }

          if (!amount || amount <= 0) {
            Swal.showValidationMessage('Silakan masukkan jumlah penarikan')
            return false
          }

          if (parseFloat(amount) > this.userData.balance) {
            Swal.showValidationMessage('Jumlah penarikan melebihi saldo')
            return false
          }

          return {
            bankId: parseInt(bankId),
            accountId: parseInt(accountId),
            amount: parseFloat(amount),
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `<h3 class="text-lg font-bold">Sukses!</h3>`,
            text: 'Penarikan berhasil diajukan',
            icon: 'success',
            confirmButtonText: 'OK',
            buttonsStyling: false,
            customClass: {
              confirmButton:
                'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6',
            },
          })
        }
      })
    },
    openAddBankAccountModal() {
      // Close current modal
      Swal.close()

      const bankOptions = this.banks
        .map((bank) => `<option value="${bank.id}">${bank.name}</option>`)
        .join('')

      setTimeout(() => {
        Swal.fire({
          title: `<h3 class="text-lg font-bold">Tambah Rekening Baru</h3>`,
          html: `
            <form id="addAccountForm" class="text-left">
              <div class="mb-3">
                <label class="block text-gray-700 font-medium text-sm mb-1" for="newBankSelect">
                  Nama Bank
                </label>
                <select id="newBankSelect" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
                  <option value="">Pilih Bank</option>
                  ${bankOptions}
                </select>
              </div>

              <div class="mb-3">
                <label class="block text-gray-700 font-medium text-sm mb-1" for="newAccountNumber">
                  Nomor Rekening
                </label>
                <input id="newAccountNumber" type="text" class="w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Masukkan nomor rekening">
              </div>

              <div class="mb-3">
                <label class="block text-gray-700 font-medium text-sm mb-1" for="newAccountName">
                  Nama Pemilik Rekening
                </label>
                <input id="newAccountName" type="text" class="w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Masukkan nama pemilik rekening">
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
          width: 500,
          preConfirm: () => {
            const bankId = document.getElementById('newBankSelect').value
            const accountNumber = document.getElementById('newAccountNumber').value
            const accountName = document.getElementById('newAccountName').value

            if (!bankId) {
              Swal.showValidationMessage('Silakan pilih bank')
              return false
            }

            if (!accountNumber) {
              Swal.showValidationMessage('Nomor rekening tidak boleh kosong')
              return false
            }

            if (!accountName) {
              Swal.showValidationMessage('Nama pemilik rekening tidak boleh kosong')
              return false
            }

            // Create new bank account
            const newBankAccount = {
              id: this.bankAccounts.length + 1,
              bankName: this.banks.find((b) => b.id === parseInt(bankId)).name,
              accountNumber: accountNumber,
              accountName: accountName,
            }

            // Add to bank accounts array
            this.bankAccounts.push(newBankAccount)

            return newBankAccount
          },
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: `<h3 class="text-lg font-bold">Sukses!</h3>`,
              text: 'Rekening baru berhasil ditambahkan',
              icon: 'success',
              confirmButtonText: 'OK',
              buttonsStyling: false,
              customClass: {
                confirmButton:
                  'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6',
              },
            }).then(() => {
              // Reopen withdrawal modal
              this.openWithdrawalModal()
            })
          } else {
            // Reopen withdrawal modal if canceled
            this.openWithdrawalModal()
          }
        })
      }, 300)
    },
    logout() {
      Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah anda yakin ingin keluar?',
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
        confirmButtonText: 'Ya, Keluar',
      }).then((result) => {
        if (result.isConfirmed) {
          // Get the token from localStorage
          const token = localStorage.getItem('token')

          // Make API call to logout endpoint
          axios
            .post(
              'http://127.0.0.1:8000/api/auth/logout',
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )
            .then(() => {
              // Clear token from localStorage
              localStorage.removeItem('token')

              // Show success message
              Swal.fire({
                title: 'Sukses!',
                text: 'Anda berhasil keluar',
                icon: 'success',
                confirmButtonText: 'OK',
                buttonsStyling: false,
                customClass: {
                  confirmButton:
                    'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6',
                },
                timer: 1500,
                showConfirmButton: false,
              }).then(() => {
                // Redirect to login page
                this.$router.push('/login')
              })
            })
            .catch((error) => {
              console.error('Logout failed:', error)

              // Even if API call fails, still remove token and redirect
              localStorage.removeItem('token')

              Swal.fire({
                title: 'Perhatian',
                text: 'Terjadi kesalahan saat logout, tetapi anda tetap dialihkan ke halaman login',
                icon: 'warning',
                confirmButtonText: 'OK',
                buttonsStyling: false,
                customClass: {
                  confirmButton:
                    'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6',
                },
              }).then(() => {
                this.$router.push('/login')
              })
            })
        }
      })
    },
  },
}
</script>

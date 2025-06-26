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
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center h-96">
          <div
            class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"
          ></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex justify-center items-center h-96 flex-col">
          <div class="text-red-600 text-xl font-bold mb-4">Gagal memuat data</div>
          <p class="text-gray-600">{{ error }}</p>
          <button @click="fetchUserData" class="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg">
            Coba Lagi
          </button>
        </div>

        <!-- Profile Section -->
        <div v-else class="flex flex-col md:flex-row items-start md:space-x-20 justify-center">
          <!-- Profile Picture and Actions -->
          <div class="w-full md:w-1/4 flex flex-col items-center">
            <div class="w-90 h-90 overflow-hidden rounded-lg shadow-lg">
              <img
                :src="userData.photo_url || 'https://placehold.co/300x300'"
                class="w-full h-full object-cover"
                alt="Profile Picture"
              />
            </div>
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
                {{ userData.name || userData.storeName || 'Nama tidak tersedia' }}
              </div>
              <div class="bg-gray-100 p-4 sm:p-5 lg:p-6 rounded-lg text-xs sm:text-sm md:text-base">
                {{ userData.no_telp || userData.phone }}
              </div>
              <div class="bg-gray-100 p-4 sm:p-5 lg:p-6 rounded-lg text-xs sm:text-sm md:text-base">
                {{ userData.email }}
              </div>
              <div
                v-if="userData.address?.label"
                class="bg-gray-100 p-4 sm:p-5 lg:p-6 rounded-lg text-xs sm:text-sm md:text-base"
              >
                {{ userData.address.label }}
              </div>
            </div>
            <div class="flex mt-10 space-x-6 justify-center w-full">
              <!-- Increased space-x-6 for more spacing -->
              <button
                class="w-60 max-w-md bg-red-600 hover:bg-red-800 text-white py-3 rounded-lg text-sm sm:text-base md:text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                @click="openEditModal"
              >
                Edit Profil
              </button>
              <button
                class="w-60 max-w-md bg-red-600 hover:bg-red-800 text-white py-3 rounded-lg text-sm sm:text-base md:text-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                @click="openEditAddressModal"
              >
                Edit Alamat
              </button>
            </div>
          </div>
        </div>
        <!-- Action Buttons -->
        <div
          v-if="!loading && !error"
          class="mt-20 md:mt-32 space-y-4 flex flex-col items-center justify-center"
        >
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
    <EditAddressModalSeller
      v-if="showEditAddressModal"
      :visible="showEditAddressModal"
      :address="userData.address"
      @update-address="updateAddress"
      @close="closeEditAddressModal"
    />
  </div>
</template>

<script>
import HeaderSeller from '@/components/HeaderSeller.vue'
import SidebarSeller from '@/components/SidebarSeller.vue'
import FooterSeller from '@/components/FooterSeller.vue'
import EditAddressModalSeller from '@/components/EditAddressModalSeller.vue'
import Swal from 'sweetalert2'
import axios from 'axios'

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller, EditAddressModalSeller },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      statusFilter: 'all',
      entriesPerPage: 25,
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      loading: false,
      error: null,
      showEditAddressModal: false,
      userData: {
        name: '',
        email: '',
        no_telp: '',
        address: {},
        isActive: true,
        photo_url: 'https://placehold.co/300x300',
      },
    }
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
    this.fetchUserData()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    fetchUserData() {
      this.loading = true
      this.error = null

      const token = localStorage.getItem('token')
      if (!token) {
        this.$router.push('/login')
        return
      }

      axios
        .get(`${this.baseUrl}/seller/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.status === 'success') {
            const apiData = response.data.data
            this.userData = {
              ...this.userData,
              ...apiData,
              address: apiData.address || {},
            }
          } else {
            this.error = response.data.message || 'Terjadi kesalahan saat memuat data'
          }
        })
        .catch((error) => {
          console.error('Error fetching profile data:', error)
          this.error = error.response?.data?.message || 'Gagal memuat data. Silakan coba lagi.'
          if (error.response?.status === 401) {
            this.$router.push('/login')
          }
        })
        .finally(() => {
          this.loading = false
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
    toggleAccountStatus() {
      this.loading = true

      const token = localStorage.getItem('token')
      if (!token) {
        this.$router.push('/login')
        return
      }

      const newStatus = this.userData.isActive ? 0 : 1

      axios
        .post(
          `${this.baseUrl}/seller/profile`,
          {
            isActive: newStatus,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((response) => {
          if (response.data.status === 'success') {
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
          } else {
            this.userData.isActive = !this.userData.isActive
            Swal.fire({
              title: `<h3 class="text-lg font-bold">Gagal</h3>`,
              text: response.data.message || 'Gagal mengubah status akun',
              icon: 'error',
              confirmButtonText: 'OK',
              buttonsStyling: false,
              customClass: {
                confirmButton:
                  'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6',
              },
            })
          }
        })
        .catch((error) => {
          this.userData.isActive = !this.userData.isActive
          Swal.fire({
            title: `<h3 class="text-lg font-bold">Gagal</h3>`,
            text: error.response?.data?.message || 'Terjadi kesalahan saat mengubah status',
            icon: 'error',
            confirmButtonText: 'OK',
            buttonsStyling: false,
            customClass: {
              confirmButton:
                'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6',
            },
          })
        })
        .finally(() => {
          this.loading = false
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

          const file = fileInput.files[0]
          if (file.size > 2 * 1024 * 1024) {
            Swal.showValidationMessage('Ukuran file maksimal 2MB')
            return false
          }

          const formData = new FormData()
          formData.append('photo', file)

          return this.uploadProfilePicture(formData)
        },
      })
    },
    uploadProfilePicture(formData) {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$router.push('/login')
        return
      }

      return axios
        .post(`${this.baseUrl}/seller/profile/photo`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          if (response.data.status === 'success') {
            if (response.data.data) {
              this.userData.photo_url = response.data.data
            }
            window.location.reload()
            return true
          } else {
            throw new Error(response.data.message || 'Gagal mengunggah foto')
          }
        })
        .catch((error) => {
          Swal.showValidationMessage(
            error.response?.data?.message || 'Gagal mengunggah foto. Silakan coba lagi.',
          )
          return false
        })
    },
    openEditModal() {
      Swal.fire({
        title: `<h3 class="text-lg font-bold">Edit Profil</h3>`,
        html: `
          <form id="editProfileForm" class="text-left">
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="name">
                Nama
              </label>
              <input id="name" type="text" class="w-full text-sm p-2 border border-gray-300 rounded-lg" value="${this.userData.name || ''}">
            </div>
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="phone">
                Nomor Telepon
              </label>
              <input id="phone" type="text" class="w-full text-sm p-2 border border-gray-300 rounded-lg" value="${this.userData.no_telp || ''}">
            </div>
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="email">
                Email
              </label>
              <input id="email" type="email" class="w-full text-sm p-2 border border-gray-300 rounded-lg" value="${this.userData.email || ''}">
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
          const name = document.getElementById('name').value
          const phone = document.getElementById('phone').value
          const email = document.getElementById('email').value

          if (!name) {
            Swal.showValidationMessage('Nama tidak boleh kosong')
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

          const updatedData = {
            name: name,
            no_telp: phone,
            email: email,
          }

          return this.updateProfile(updatedData)
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
    updateProfile(data) {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$router.push('/login')
        return
      }

      return axios
        .post(`${this.baseUrl}/seller/profile`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.status === 'success') {
            this.userData = {
              ...this.userData,
              ...data,
            }
            return true
          } else {
            throw new Error(response.data.message || 'Gagal memperbarui profil')
          }
        })
        .catch((error) => {
          Swal.showValidationMessage(
            error.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.',
          )
          return false
        })
    },
    openEditAddressModal() {
      this.showEditAddressModal = true
    },
    closeEditAddressModal() {
      this.showEditAddressModal = false
    },
    updateAddress(updatedAddress) {
      this.userData.address = {
        ...this.userData.address,
        ...updatedAddress,
      }
      this.closeEditAddressModal()
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

          const passwordData = {
            currentPassword: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword,
          }

          return this.changePassword(passwordData)
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
    changePassword(data) {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$router.push('/login')
        return
      }

      return axios
        .post(`${this.baseUrl}/seller/reset_password`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.status === 'success') {
            return true
          } else {
            throw new Error(response.data.message || 'Gagal mengubah password')
          }
        })
        .catch((error) => {
          Swal.showValidationMessage(
            error.response?.data?.message || 'Gagal mengubah password. Silakan coba lagi.',
          )
          return false
        })
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
          const token = localStorage.getItem('token')
          if (!token) {
            this.$router.push('/login')
            return
          }

          axios
            .post(
              `${this.baseUrl}/seller/logout`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )
            .then((response) => {
              if (response.data.status === 'success') {
                localStorage.removeItem('token')
                this.$router.push('/login')
              } else {
                Swal.fire({
                  title: `<h3 class="text-lg font-bold">Gagal</h3>`,
                  text: response.data.message || 'Gagal melakukan logout',
                  icon: 'error',
                  confirmButtonText: 'OK',
                  buttonsStyling: false,
                  customClass: {
                    confirmButton:
                      'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6',
                  },
                })
              }
            })
            .catch((error) => {
              console.error('Logout error:', error)
              localStorage.removeItem('token')
              this.$router.push('/login')
            })
        }
      })
    },
  },
}
</script>

<style scoped>
/* Custom styles if needed */
</style>

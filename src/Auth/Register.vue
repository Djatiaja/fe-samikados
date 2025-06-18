<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <AuthHeader title="SAMIKADOS" subtitle="REGISTER" />

    <main
      class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center flex-grow"
    >
      <section class="w-full lg:w-fit mb-8 lg:mb-0 hidden lg:flex">
        <figure>
          <img src="/image/Transparent.png" alt="Cart icon image" class="w-full max-w-md" />
        </figure>
      </section>

      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">REGISTER</h2>

        <form @submit.prevent="submitForm">
          <!-- Step 1 -->
          <div v-if="step === 1">
            <div class="mb-4">
              <input
                v-model="form.username"
                class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Username atau kosongkan untuk generate otomatis"
                type="text"
              />
            </div>

            <div class="mb-4">
              <input
                v-model="form.name"
                class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Nama Lengkap"
                type="text"
              />
              <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
            </div>

            <div class="mb-4">
              <input
                v-model="form.no_telpon"
                class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="No. Telp"
                type="text"
              />
              <small v-if="errors.no_telpon" class="text-red-500">{{ errors.no_telpon }}</small>
            </div>

            <button
              type="button"
              @click="proceedToNextStep"
              class="w-full bg-red-600 text-white p-3 rounded-lg"
            >
              Next
            </button>
          </div>

          <!-- Step 2 -->
          <div v-if="step === 2">
            <div class="mb-4">
              <textarea
                v-model="form.address"
                class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Detail Alamat (Patokan, Ciri-ciri)"
                rows="3"
              ></textarea>
              <small v-if="errors.address" class="text-red-500">{{ errors.address }}</small>
            </div>

            <!-- Location Search -->
            <div class="mb-4 relative">
              <div class="flex">
                <input
                  v-model="locationSearch"
                  class="flex-1 p-3 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Cari alamat (contoh: sleman)"
                  type="text"
                />
                <button
                  type="button"
                  @click="searchLocation"
                  :disabled="isLoadingLocation"
                  class="bg-red-600 text-white px-4 py-3 rounded-r-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <i v-if="isLoadingLocation" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-search"></i>
                </button>
              </div>

              <!-- Display selected location -->
              <div
                v-if="selectedLocation"
                class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div class="flex items-center text-green-700">
                  <i class="fas fa-check-circle mr-2"></i>
                  <span class="font-medium">Alamat dipilih:</span>
                </div>
                <div class="text-green-600 mt-1">
                  {{ formatLocationDisplay(selectedLocation) }}
                </div>
              </div>

              <small v-if="errors.label" class="text-red-500">{{ errors.label }}</small>
              <small v-if="locationError" class="text-red-500">{{ locationError }}</small>

              <!-- Dropdown -->
              <div
                v-if="showLocationDropdown"
                class="mt-2 bg-white shadow-lg rounded-md absolute w-full z-50 text-black max-h-64 overflow-y-auto"
              >
                <div v-if="locations.length === 0" class="p-4 text-gray-500 text-center">
                  Tidak ada alamat yang ditemukan
                </div>

                <template v-else>
                  <!-- Current selection -->
                  <div v-if="selectedLocation" class="p-4 border-b cursor-pointer bg-gray-100">
                    <div class="flex items-center text-red-600">
                      <i class="fas fa-map-marker-alt mr-2"></i>
                      <span class="font-semibold">Alamat terpilih</span>
                    </div>
                    <div class="text-red-600 mt-1">
                      {{ formatLocationDisplay(selectedLocation) }}
                    </div>
                  </div>

                  <!-- Location results -->
                  <div class="p-4">
                    <div class="text-gray-500 text-sm mb-2">HASIL PENCARIAN</div>
                    <div
                      v-for="location in locations"
                      :key="location.id"
                      class="flex items-center text-gray-700 py-2 cursor-pointer hover:bg-gray-100"
                      @click="selectLocation(location)"
                    >
                      <i class="fas fa-map-marker-alt mr-2"></i>
                      <span>{{ formatLocationDisplay(location) }}</span>
                    </div>
                  </div>
                </template>

                <div class="p-3 text-center border-t">
                  <button
                    type="button"
                    @click="showLocationDropdown = false"
                    class="text-gray-500 hover:text-gray-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <textarea
                v-model="form.description"
                class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Deskripsi"
                rows="3"
              ></textarea>
              <small v-if="errors.description" class="text-red-500">{{ errors.description }}</small>
            </div>

            <button
              type="button"
              @click="proceedToNextStep"
              class="w-full bg-red-600 text-white p-3 rounded-lg"
            >
              Next
            </button>
            <button
              type="button"
              @click="step = 1"
              class="text-gray-600 hover:underline mt-2 block"
            >
              Back
            </button>
          </div>

          <!-- Step 3 -->
          <div v-if="step === 3">
            <div class="mb-4">
              <input
                v-model="form.email"
                class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Email"
                type="email"
              />
              <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
            </div>

            <div class="mb-4">
              <input
                v-model="form.password"
                class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Password"
                type="password"
              />
              <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
            </div>

            <div class="mb-4">
              <input
                v-model="form.password_confirmation"
                class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Konfirmasi Password"
                type="password"
              />
              <small v-if="errors.password_confirmation" class="text-red-500">
                {{ errors.password_confirmation }}
              </small>
            </div>

            <button type="submit" class="w-full bg-red-600 text-white p-3 rounded-lg">
              Register
            </button>
            <button
              type="button"
              @click="step = 2"
              class="text-gray-600 hover:underline mt-2 block"
            >
              Back
            </button>
          </div>
        </form>
      </section>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import AuthHeader from '@/components/AuthHeader.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import axios from 'axios'

export default {
  components: {
    AuthHeader,
    AuthFooter,
  },
  data() {
    return {
      step: 1,
      isLoading: false,
      form: {
        username: '',
        name: '',
        no_telpon: '',
        address: '',
        description: '',
        email: '',
        password: '',
        password_confirmation: '',
        label: '',
      },
      errors: {},
      // Location search related
      locationSearch: '',
      locations: [],
      selectedLocation: null,
      showLocationDropdown: false,
      isLoadingLocation: false,
      locationError: '',
    }
  },
  methods: {
    validateStepOne() {
      this.errors = {}

      if (!this.form.name) {
        this.errors.name = 'Nama wajib diisi'
      }

      if (!this.form.no_telpon) {
        this.errors.no_telpon = 'Nomor telepon wajib diisi'
      } else if (!/^\d+$/.test(this.form.no_telpon)) {
        this.errors.no_telpon = 'Nomor telepon hanya boleh angka'
      } else if (this.form.no_telpon.length < 10) {
        this.errors.no_telpon = 'Nomor telepon minimal 10 digit'
      }

      return Object.keys(this.errors).length === 0
    },

    validateStepTwo() {
      this.errors = {}

      if (!this.form.address) {
        this.errors.address = 'Detail alamat wajib diisi'
      }

      if (!this.form.label) {
        this.errors.label = 'Alamat wajib dipilih dari hasil pencarian'
      }

      if (this.form.description && this.form.description.length > 255) {
        this.errors.description = 'Deskripsi tidak boleh lebih dari 255 karakter'
      }

      return Object.keys(this.errors).length === 0
    },

    validateStepThree() {
      this.errors = {}

      if (!this.form.email || !this.form.email.includes('@')) {
        this.errors.email = 'Email tidak valid'
      }

      if (!this.form.password || this.form.password.length < 8) {
        this.errors.password = 'Password minimal 8 karakter'
      }

      if (this.form.password !== this.form.password_confirmation) {
        this.errors.password_confirmation = 'Password tidak cocok'
      }

      return Object.keys(this.errors).length === 0
    },

    proceedToNextStep() {
      if (this.step === 1 && this.validateStepOne()) {
        this.step = 2
      } else if (this.step === 2 && this.validateStepTwo()) {
        this.step = 3
      }
    },

    async searchLocation() {
      if (!this.locationSearch.trim()) {
        this.locationError = 'Masukkan kata kunci pencarian'
        return
      }

      this.isLoadingLocation = true
      this.locationError = ''

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/rajaongkir/search/${this.locationSearch.trim()}`,
        )

        if (response.data.status === 'success' && response.data.data.data) {
          this.locations = response.data.data.data
          this.showLocationDropdown = true
        } else {
          this.locations = []
          this.locationError = 'Tidak ada hasil pencarian'
        }
      } catch (error) {
        this.locationError = 'Gagal mencari alamat. Silakan coba lagi.'
        this.locations = []
        console.error('Location search error:', error)
      } finally {
        this.isLoadingLocation = false
      }
    },

    selectLocation(location) {
      this.selectedLocation = location
      this.form.label = location.label // Send full label to API
      this.showLocationDropdown = false
      this.locationError = ''

      // Clear the errors when location is selected
      if (this.errors.label) {
        delete this.errors.label
      }
    },

    formatLocationDisplay(location) {
      // Format: SUBDISTRICT, DISTRICT, CITY, ZIP_CODE
      return `${location.subdistrict_name}, ${location.district_name}, ${location.city_name}, ${location.zip_code}`
    },

    async submitForm() {
      if (this.step === 3 && this.validateStepThree()) {
        this.isLoading = true

        try {
          const payload = {
            username: this.form.username.trim() === '' ? null : this.form.username,
            name: this.form.name,
            no_telp: this.form.no_telpon,
            email: this.form.email.length > 50 ? this.form.email.substring(0, 50) : this.form.email,
            password: this.form.password,
            password_confirmation: this.form.password_confirmation,
            address: this.form.address,
            description: this.form.description,
            label: this.form.label,
          }

          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
            payload,
          )

          if (response.data.status === 'success') {
            Swal.fire({
              title: 'Registrasi Berhasil!',
              text: 'Akun Anda telah terdaftar. Silakan login.',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {
              this.$router.push('/login')
            })
          }
        } catch (error) {
          if (error.response && error.response.data) {
            const errorData = error.response.data

            if (errorData.data && errorData.data.email) {
              Swal.fire({
                title: 'Registrasi Gagal!',
                text: 'Email telah digunakan. Mohon gunakan email lain.',
                icon: 'error',
                confirmButtonText: 'OK',
              })
            } else if (errorData.data && errorData.data.username) {
              Swal.fire({
                title: 'Registrasi Gagal!',
                text: 'Username telah digunakan. Mohon gunakan username lain.',
                icon: 'error',
                confirmButtonText: 'OK',
              })
            } else {
              Swal.fire({
                title: 'Registrasi Gagal!',
                text: 'Terjadi kesalahan saat registrasi. Coba lagi.',
                icon: 'error',
                confirmButtonText: 'OK',
              })
            }
          } else {
            Swal.fire({
              title: 'Registrasi Gagal!',
              text: 'Terjadi kesalahan saat registrasi. Coba lagi.',
              icon: 'error',
              confirmButtonText: 'OK',
            })
          }
        } finally {
          this.isLoading = false
        }
      }
    },
  },

  // Close dropdown when clicking outside
  mounted() {
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showLocationDropdown = false
      }
    })
  },
}
</script>

<style scoped>
/* Add FontAwesome CDN in your index.html or main template */
/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"> */
</style>

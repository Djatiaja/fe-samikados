<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <AuthHeader title="SAMIKADOS" subtitle="LOGIN" />

    <!-- Main Content -->
    <main
      class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center lg:justify-center flex-grow"
    >
      <!-- Image Section -->
      <section class="w-full lg:w-fit mb-8 lg:mb-0 hidden lg:flex">
        <figure>
          <img src="/image/Transparent.png" alt="Cart icon image" class="w-full max-w-md" />
        </figure>
      </section>

      <!-- Password Reset Form -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">ATUR PASSWORD BARU</h2>
        <!-- New Password Input -->
        <p class="text-sm text-gray-500">Masukkan Password Baru</p>
        <div class="mb-4 relative">
          <input
            v-model="newPassword"
            :type="showPassword ? 'text' : 'password'"
            class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-10"
            placeholder="Password"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute inset-y-0 right-3 flex items-center"
          >
            <i :class="showPassword ? 'far fa-eye-slash' : 'far fa-eye'" class="text-gray-500"></i>
          </button>
        </div>

        <!-- Confirm Password Input -->
        <p class="text-sm text-gray-500">Konfirmasi Password Baru</p>
        <div class="mb-4 relative">
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Konfirmasi Password"
          />
        </div>

        <p class="text-xs text-gray-500 mb-4">
          Password terdiri dari kombinasi huruf kecil, huruf besar, simbol, dan angka!
        </p>

        <!-- Submit Button -->
        <AuthMainButton text="Berikutnya" @click="openConfirmPasswordModal" />
      </section>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import AuthFooter from '@/components/AuthFooter.vue'
import AuthHeader from '@/components/AuthHeader.vue'
import AuthMainButton from '@/components/AuthMainButton.vue'
import axios from 'axios'
export default {
  components: { AuthFooter, AuthHeader, AuthMainButton },
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      showPassword: false, // For toggling password visibility
    }
  },
  methods: {
    // Toggles password visibility
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },

    // Opens the confirmation modal
    openConfirmPasswordModal() {
      if (!this.newPassword || !this.confirmPassword) {
        Swal.fire('Error', 'Mohon isi semua kolom!', 'error')
        return
      }

      if (this.newPassword !== this.confirmPassword) {
        Swal.fire('Error', 'Password tidak cocok!', 'error')
        return
      }

      // Show confirmation modal using the custom script
      this.confirmChangePassword()
    },

    // The function for showing the confirmation modal
    confirmChangePassword() {
      Swal.fire({
        title: "<span class='text-xl font-bold'>Konfirmasi Ganti Password</span>",
        html: "<p class='text-lg'>Apakah Anda yakin ingin mengganti password?</p>",
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
          if (this.newPassword !== this.confirmPassword) {
            Swal.fire({
              title: 'Error',
              text: 'Password dan konfirmasi password tidak cocok!',
              icon: 'error',
              confirmButtonText: 'Tutup',
              buttonsStyling: false,
              customClass: {
                confirmButton: 'bg-red-600 hover:bg-red-600 text-white py-2 w-28 rounded-md',
              },
            })
            return
          }
          const token = localStorage.getItem('resetToken')
          const email = localStorage.getItem('userEmail')
          axios
            .post(`http://127.0.0.1:8000/api/auth/reset-password`, {
              token: token,
              email: email,
              password: this.newPassword,
              password_confirmation: this.confirmPassword,
            })
            .then((response) => {
              Swal.fire({
                title: 'Berhasil',
                text: 'Password berhasil direset!',
                icon: 'success',
                confirmButtonText: 'OK',
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'bg-red-600 hover:bg-red-600 text-white py-2 w-28 rounded-md',
                },
              }).then(() => {
                this.$router.push('/login')
              })
            })
            .catch((error) => {
              const errorMessage = error.response?.data?.message || 'Gagal mereset password'
              Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Tutup',
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'bg-red-600 hover:bg-red-600 text-white py-2 w-28 rounded-md',
                },
              })
            })
          this.showAlert()
        }
      })
    },

    // Function for showing the success alert modal
    showAlert() {
      Swal.fire({
        title: "<span class='text-lg font-bold'>Password Berhasil Diubah</span>",
        icon: 'success',
        confirmButtonText: 'Tutup',
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

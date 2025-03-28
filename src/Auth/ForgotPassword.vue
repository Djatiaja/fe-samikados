<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <!-- Header -->
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

      <!-- Reset Password Form -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">RESET PASSWORD</h2>
        <form @submit.prevent="goToOtpPage">
          <!-- Email / Phone Input -->
          <div class="mb-4">
            <label for="reset" class="sr-only">Email</label>
            <input
              id="reset"
              v-model="userInput"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Email"
              type="text"
              required
            />
          </div>

          <!-- Submit Button -->
          <AuthMainButton text="Berikutnya" />
        </form>
      </section>
    </main>

    <!-- Footer -->
    <AuthFooter />
  </div>
</template>

<script>
import AuthHeader from '@/components/AuthHeader.vue'
import AuthMainButton from '@/components/AuthMainButton.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import axios from 'axios'
import Swal from 'sweetalert2'
export default {
  components: { AuthHeader, AuthMainButton, AuthFooter },
  data() {
    return {
      userInput: '',
    }
  },
  methods: {
    async goToOtpPage() {
      if (this.userInput.trim() !== '') {
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/auth/sendOtp', {
            email: this.userInput,
          })

          if (response.status === 200) {
            Swal.fire({
              title: 'Berhasil!',
              text: 'OTP berhasil dikirim.',
              icon: 'success',
              confirmButtonText: 'OK',
            })
            localStorage.setItem('resetEmail', this.userInput)
            this.$router.push('/otp-password')
          } else {
            console.error('Error:', response.data.message || 'Gagal mengirim OTP')
            Swal.fire({
              title: 'Kesalahan',
              text: response.data.message || 'Gagal mengirim OTP',
              icon: 'error',
              confirmButtonText: 'OK',
            })
          }
        } catch (error) {
          console.error('Error:', error.response?.data?.message || error.message)
          Swal.fire({
            title: 'Kesalahan',
            text:
              error.response?.data?.message ||
              'Terjadi kesalahan saat mengirim OTP. Silakan coba lagi.',
            icon: 'error',
            confirmButtonText: 'OK',
          })
        }
      }
    },
  },
}
</script>

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

      <!-- OTP Form -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">MASUKKAN KODE OTP</h2>
        <p class="mb-4 text-sm text-gray-600">Kode OTP telah dikirim pada email Anda</p>

        <!-- OTP Input -->
        <div class="flex justify-center space-x-4 mb-4">
          <input
            v-for="(otp, index) in otpCode"
            :key="index"
            :ref="`otp${index}`"
            v-model="otpCode[index]"
            class="w-12 text-center p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            type="text"
            maxlength="1"
            @input="handleInput(index, $event)"
            @keyup.backspace="moveBack(index, $event)"
            @paste="handlePaste"
          />
        </div>

        <p class="text-xs text-gray-500 text-center mb-4">
          Mohon tunggu 35 detik untuk mengirim ulang.
        </p>

        <!-- Submit Button -->
        <AuthMainButton
          :text="isSubmitting ? 'Memproses...' : 'Berikutnya'"
          :disabled="isSubmitting"
          @click="submitOtp"
        />
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
  components: {
    AuthHeader,
    AuthMainButton,
    AuthFooter,
  },
  data() {
    return {
      otpCode: ['', '', '', ''],
      isSubmitting: false,
      submissionTimeout: null,
    }
  },
  methods: {
    handlePaste(event) {
      // Prevent default paste behavior
      event.preventDefault()

      // Get pasted text
      const pastedText = event.clipboardData.getData('text').trim()

      // Check if pasted text is a valid 4-digit code
      if (/^\d{4}$/.test(pastedText)) {
        // Fill OTP inputs with pasted code
        this.otpCode = pastedText.split('').map((digit) => digit)

        // Focus on the last input after pasting
        this.$nextTick(() => {
          const lastInput = this.$refs[`otp${this.otpCode.length - 1}`]
          if (lastInput && lastInput.length > 0) {
            lastInput[0].focus()
          }
        })
      }
    },
    handleInput(index, event) {
      // Ensure only numeric input
      const value = event.target.value.replace(/[^\d]/g, '')
      this.$set(this.otpCode, index, value)

      // Move focus if input is filled and not the last input
      if (value && index < this.otpCode.length - 1) {
        const nextInput = this.$refs[`otp${index + 1}`]
        if (nextInput && nextInput.length > 0) {
          nextInput[0].focus()
        }
      }
    },
    moveBack(index, event) {
      // Move focus back if current input is empty
      if (!event.target.value && index > 0) {
        const prevInput = this.$refs[`otp${index - 1}`]
        if (prevInput && prevInput.length > 0) {
          prevInput[0].focus()
        }
      }
    },
    submitOtp() {
      // Prevent multiple submissions
      if (this.isSubmitting) {
        console.warn('OTP submission already in progress')
        return
      }

      const email = localStorage.getItem('resetEmail')
      const otp = this.otpCode.map((code) => code.trim()).join('')

      // Validate OTP length
      if (otp.length !== 4) {
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: 'Masukkan kode OTP dengan benar!',
        })
        return
      }

      // Set submission state
      this.isSubmitting = true

      // Set a timeout to reset submission state if request takes too long
      this.submissionTimeout = setTimeout(() => {
        this.isSubmitting = false
        Swal.fire({
          icon: 'error',
          title: 'Timeout',
          text: 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.',
        })
      }, 15000) // 15 seconds timeout

      axios
        .post(`${import.meta.env.VITE_API_BASE_URL}/auth/verifyOtp`, { email: email, otp: otp })
        .then((response) => {
          // Clear timeout
          clearTimeout(this.submissionTimeout)

          if (response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Kode OTP berhasil diverifikasi!',
            }).then(() => {
              const { token, email } = response.data.data
              localStorage.setItem('resetToken', token)
              localStorage.setItem('userEmail', email)

              localStorage.removeItem('resetEmail')
              this.$router.push('/reset-password')
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: response.data.message || 'Kode OTP tidak valid!',
            })
          }
        })
        .catch((error) => {
          // Clear timeout
          clearTimeout(this.submissionTimeout)

          console.error('Error during OTP verification:', error)
          Swal.fire({
            icon: 'error',
            title: 'Invalid OTP',
            text: 'Kode OTP tidak valid atau expired.',
          })
        })
        .finally(() => {
          // Always reset submission state
          this.isSubmitting = false
        })
    },
  },
  beforeUnmount() {
    // Clean up timeout if component is destroyed
    if (this.submissionTimeout) {
      clearTimeout(this.submissionTimeout)
    }
  },
}
</script>

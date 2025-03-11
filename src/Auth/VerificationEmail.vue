<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <!-- Header -->
    <AuthHeader title="SAMIKADOS" subtitle="REGISTER" />

    <!-- Main Content -->
    <main
      class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center lg:justify-center flex-grow"
    >
      <!-- Image Section (Hidden on mobile) -->
      <section class="w-fw-full lg:w-fit mb-8 lg:mb-0 hidden lg:flex">
        <figure>
          <img src="/image/Transparent.png" alt="Verification Image" class="w-full max-w-md" />
        </figure>
      </section>

      <!-- Verification Section -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">Verifikasi Email</h2>
        <p class="mb-4 text-sm text-gray-600">Silakan cek email Anda dan klik tautan verifikasi.</p>

        <!-- Resend Email Button -->
        <form @submit.prevent="register">
          <button
            class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg mb-4 transition duration-300 shadow-lg"
            type="submit"
          >
            Kirim Ulang Email
          </button>
        </form>

        <!-- Info Section -->
        <p class="text-xs text-gray-500 text-center">
          Tidak menerima email? Kami bisa mengirim ulang.
        </p>

        <!-- Logout Option -->
        <div class="text-center mt-4">
          <span class="text-gray-700 text-sm">Sudah Verifikasi? </span>
          <router-link class="text-red-600 hover:underline text-sm" to="/login">Log in</router-link>
        </div>
      </section>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import AuthHeader from '@/components/AuthHeader.vue'
import AuthMainButton from '@/components/AuthMainButton.vue'
import AuthFooter from '@/components/AuthFooter.vue'

export default {
  components: {
    AuthHeader,
    AuthMainButton,
    AuthFooter,
  },
  data() {
    return {
      phone: '',
      email: '',
      password: '',
    }
  },
  methods: {
    register() {
      console.log('Registering user with:', this.phone, this.email, this.password)
      this.$router.push('/verification')
    },
  },
}
</script>

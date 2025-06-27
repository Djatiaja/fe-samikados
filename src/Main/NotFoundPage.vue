<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <!-- Header -->
    <AuthHeader title="SAMIKADOS" subtitle="NOT FOUND" />

    <!-- Main Content -->
    <main
      class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center lg:justify-center flex-grow"
    >
      <!-- Image Section (Hidden on mobile) -->
      <section class="w-full lg:w-fit mb-8 lg:mb-0 hidden lg:flex">
        <figure>
          <img src="/image/notfound.png" alt="Not Found Image" class="w-full max-w-md" />
        </figure>
      </section>

      <!-- Not Found Section -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">Halaman Tidak Ditemukan</h2>
        <p class="mb-4 text-sm text-gray-600">
          Maaf, halaman yang Anda cari tidak tersedia atau Anda tidak memiliki akses.
        </p>

        <!-- Return to Homepage Button -->
        <form @submit.prevent="goHome">
          <button
            class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg mb-4 transition duration-300 shadow-lg"
            type="submit"
          >
            Kembali ke Beranda
          </button>
        </form>

        <!-- Info Section -->
        <p class="text-xs text-gray-500 text-center">
          Periksa URL atau hubungi dukungan jika masalah berlanjut.
        </p>

        <!-- Logout Option -->
        <div class="text-center mt-4">
          <router-link class="text-red-600 hover:underline text-sm" to="/"
            >Kembali ke Beranda</router-link
          >
        </div>
      </section>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import AuthHeader from '@/components/AuthHeader.vue'
import AuthFooter from '@/components/AuthFooter.vue'

export default {
  components: {
    AuthHeader,
    AuthFooter,
  },
  methods: {
    goHome() {
      console.log('Redirecting to homepage')
      this.$router.push('/')
    },
  },
}
</script>

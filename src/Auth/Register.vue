<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <!-- Header -->
    <AuthHeader title="SAMIKADOS" subtitle="REGISTER" />

    <!-- Main Content -->
    <main
      class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center flex-grow"
    >
      <!-- Image Section -->
      <section class="w-full lg:w-fit mb-8 lg:mb-0 hidden lg:flex">
        <figure>
          <img src="/image/Transparent.png" alt="Cart icon image" class="w-full max-w-md" />
        </figure>
      </section>

      <!-- Register Form -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">REGISTER</h2>

        <form @submit.prevent="nextStep">
          <!-- Step 1 -->
          <div v-if="step === 1">
            <div class="mb-4">
              <input
                v-model="form.username"
                class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Username"
                type="text"
              />
              <small v-if="errors.username" class="text-red-500">{{ errors.username }}</small>
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

            <AuthMainButton text="Next" @click="nextStep" />
          </div>

          <!-- Step 2 -->
          <div v-if="step === 2">
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
              <small v-if="errors.password_confirmation" class="text-red-500">{{
                errors.password_confirmation
              }}</small>
            </div>

            <AuthMainButton text="Register" @click="register" />
            <button @click="step = 1" class="text-gray-600 hover:underline mt-2 block">Back</button>
          </div>
        </form>
      </section>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import api from '@/api'
import Swal from 'sweetalert2'
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
      step: 1,
      form: {
        username: '',
        name: '',
        no_telpon: '',
        email: '',
        password: '',
        password_confirmation: '',
      },
      errors: {},
    }
  },
  methods: {
    nextStep() {
      this.errors = {}
      if (this.step === 1) {
        if (!this.form.username) this.errors.username = 'Username wajib diisi'
        if (!this.form.name) this.errors.name = 'Nama wajib diisi'
        if (!this.form.no_telpon.match(/^\d+$/))
          this.errors.no_telpon = 'Nomor telepon hanya boleh angka'

        if (Object.keys(this.errors).length === 0) {
          this.step = 2
        }
      }
    },
    async register() {
      this.errors = {}
      if (!this.form.email.includes('@')) this.errors.email = 'Email tidak valid'
      if (this.form.password.length < 6) this.errors.password = 'Password minimal 6 karakter'
      if (this.form.password !== this.form.password_confirmation)
        this.errors.password_confirmation = 'Password tidak cocok'

      if (Object.keys(this.errors).length > 0) return

      try {
        await api.post('/auth/register', this.form) // Pakai API global
        Swal.fire({
          title: 'Registrasi Berhasil!',
          text: 'Akun Anda telah terdaftar. Silakan login.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          this.$router.push('/login')
        })
      } catch (error) {
        Swal.fire({
          title: 'Registrasi Gagal!',
          text: 'Terjadi kesalahan saat registrasi. Coba lagi.',
          icon: 'error',
          confirmButtonText: 'OK',
        })
      }
    },
  },
}
</script>

<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <AuthHeader title="SAMIKADOS" subtitle="LOGIN" />

    <main
      class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center flex-grow"
    >
      <div class="w-full lg:w-fit mb-8 lg:mb-0 hidden lg:flex">
        <figure>
          <img src="/image/Transparent.png" alt="Cart icon image" class="w-full max-w-md" />
        </figure>
      </div>

      <div class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">LOGIN</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="phone" class="sr-only">Email / Username / No. Telp</label>
            <input
              v-model="userInput"
              id="phone"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Email / Username / No. Telp"
              type="text"
            />
          </div>

          <div class="mb-4">
            <label for="password" class="sr-only">Password</label>
            <input
              v-model="password"
              id="password"
              class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Password"
              type="password"
            />
          </div>

          <div class="flex justify-between items-center mb-4">
            <label class="flex items-center text-gray-700 text-sm lg:text-base">
              <input v-model="rememberMe" type="checkbox" class="mr-2" /> Ingat Saya
            </label>
            <router-link
              to="/forgot-password"
              class="text-xs lg:text-sm text-red-600 hover:underline"
              >Lupa Password?</router-link
            >
          </div>

          <AuthMainButton text="Masuk" />

          <div class="text-center mb-4 text-gray-700">atau</div>
          <button
            class="w-full bg-white border border-gray-400 text-gray-700 py-3 rounded-lg flex items-center justify-center hover:bg-gray-50 transition duration-300 shadow-sm"
            type="button"
            @click="signInWithGoogle"
          >
            <img src="/image/google.png" alt="Google icon" class="mr-2" /> Sign In with Google
          </button>

          <!-- Register Link -->
          <div class="text-center mt-4">
            <span class="text-gray-700">Belum Punya Akun? </span>
            <router-link class="text-red-600 hover:underline" to="/register">Register</router-link>
          </div>
        </form>
      </div>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import AuthHeader from '@/components/AuthHeader.vue'
import AuthMainButton from '@/components/AuthMainButton.vue'
import AuthFooter from '@/components/AuthFooter.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import axios from 'axios'

export default {
  components: {
    AuthHeader,
    AuthMainButton,
    AuthFooter,
  },
  setup() {
    const router = useRouter()
    const userInput = ref('')
    const password = ref('')
    const rememberMe = ref(false)

    const handleLogin = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/seller/login`,
          {
            loginParam: userInput.value,
            password: password.value,
          },
        )

        // Simpan token ke localStorage
        localStorage.setItem('token', response.data.data.token)

        // SweetAlert untuk sukses login
        Swal.fire({
          title: 'Login Berhasil!',
          text: 'Anda akan diarahkan ke dashboard...',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          router.push('/dashboard-seller')
        })
      } catch (error) {
        console.error('Login gagal:', error)

        // SweetAlert untuk error login
        Swal.fire({
          title: 'Login Gagal!',
          text: 'Periksa kembali email/username dan password Anda.',
          icon: 'error',
          confirmButtonText: 'Coba Lagi',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base',
          },
        })
      }
    }

    const signInWithGoogle = () => {
      console.log('Signing in with Google...')
      router.push('/dashboard-seller')
    }

    return { userInput, password, rememberMe, handleLogin, signInWithGoogle }
  },
}
</script>

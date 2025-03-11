<template>
    <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
      <!-- Header -->
      <AuthHeader title="SAMIKADOS" subtitle="LOGIN" />
  
      <!-- Main Content -->
      <main class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center lg:justify-center flex-grow">
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
              <label for="reset" class="sr-only">Email / No. Telp</label>
              <input id="reset" v-model="userInput" class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600" placeholder="Email / No. Telp" type="text" required/>
            </div>
  
            <!-- Submit Button -->
            <AuthMainButton text="Berikutnya" @click="goToOtpPage" />

          </form>
        </section>
      </main>
  
      <!-- Footer -->
      <AuthFooter />
    </div>
  </template>
  
  <script>
  import AuthHeader from '@/components/AuthHeader.vue';
  import AuthMainButton from '@/components/AuthMainButton.vue';
  import AuthFooter from '@/components/AuthFooter.vue';
  export default {
    components: { AuthHeader, AuthMainButton, AuthFooter },
    data() {
      return {
        userInput: "",
      };
    },
    methods: {
      goToOtpPage() {
        if (this.userInput.trim() !== "") {
          this.$router.push("/otp-password");
        }
      },
    },
  };
  </script>
  
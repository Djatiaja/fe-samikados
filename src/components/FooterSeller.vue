<template>
  <footer class="bg-gradient-to-r from-red-600 to-black p-4 text-white text-center w-full mt-auto z-40">
    <p>&copy; {{ currentYear }} Samikados. All Rights Reserved.</p>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      currentYear: new Date().getFullYear()
    };
  }
};
</script>

<style scoped>
footer {
  position: relative;
}
</style>

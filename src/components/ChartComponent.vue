<template>
    <div class="chart-container" style="position: relative; height: 400px; width: 100%;">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import { Chart } from "chart.js";  // Pastikan Chart.js sudah diinstal dan diimpor dengan benar
  
  export default {
    props: {
      chartData: {
        type: Object,
        required: true,
      },
      chartOptions: {
        type: Object,
        required: true,
      }
    },
    mounted() {
      this.renderChart();  // Render chart setelah komponen dimuat
    },
    beforeUnmount() {
      if (this.chartInstance) {
        this.chartInstance.destroy();  // Hapus chart sebelum komponen di-unmount
      }
    },
    methods: {
      renderChart() {
        const ctx = this.$refs.chartCanvas.getContext("2d");
        this.chartInstance = new Chart(ctx, {
          type: "line",  
          data: this.chartData, 
          options: this.chartOptions,
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .chart-container {
    max-width: 100%;
  }
  </style>
  
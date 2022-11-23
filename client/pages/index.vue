<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gray-300"
  >
    <div
      class="flex flex-col bg-white shadow-md px-4 sm:px-6 md:px-8 lg:px-10 py-8 rounded-md w-full max-w-md"
    >
      <div
        class="font-medium self-center text-xl sm:text-2xl uppercase text-gray-800"
      >
        Pencatatan sistem parkir
      </div>

      <div class="mt-6">
        <form method="POST" @submit.prevent="onSubmit()">
          <div class="flex flex-col mb-3">
            <label
              for="email"
              class="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
              >Plat Nomor:</label
            >
            <div class="relative">
              <input
                id="plat"
                v-model="plat"
                type="text"
                name="plat"
                class="text-sm sm:text-base placeholder-gray-500 px-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400 uppercase"
                placeholder="Plat Nomor"
                required
              />
            </div>
          </div>

          <div class="flex flex-col mb-3">
            <label
              for="email"
              class="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
              >Tipe:</label
            >
            <div class="relative">
              <select
                id="tipe"
                v-model="tipe"
                class="text-sm sm:text-base placeholder-gray-500 px-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                required
              >
                <option selected>Tipe</option>
                <option value="mobil">Mobil</option>
                <option value="motor">Motor</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col mb-3">
            <label
              for="email"
              class="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
              >Masuk:</label
            >
            <div class="relative">
              <input
                id="masuk"
                v-model="masuk"
                type="datetime-local"
                name="masuk"
                class="text-sm sm:text-base placeholder-gray-500 px-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                required
              />
            </div>
          </div>

          <div class="flex flex-col mb-3">
            <label
              for="email"
              class="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
              >Keluar:</label
            >
            <div class="relative">
              <input
                id="keluar"
                v-model="keluar"
                type="datetime-local"
                name="keluar"
                class="text-sm sm:text-base placeholder-gray-500 px-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                required
              />
            </div>
          </div>

          <div class="flex flex-col mb-3">
            <label
              for="email"
              class="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
              >Harga:</label
            >
            <div class="relative">
              <input
                id="text"
                :value="harga"
                type="text"
                name="text"
                class="text-sm sm:text-base placeholder-gray-500 px-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                disabled
              />
            </div>
          </div>

          <div class="flex w-full">
            <button
              type="submit"
              class="flex items-center justify-center focus:outline-none text-white text-sm sm:text-base bg-blue-600 hover:bg-blue-700 rounded py-2 w-full transition duration-150 ease-in"
            >
              <span class="mr-2 uppercase">Submit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      plat: '',
      tipe: '',
      masuk: null,
      keluar: null,
      error:null
    }
  },
  computed: {
    harga() {
      let harga = 0;

      const diff = this.$moment(this.keluar).unix() - this.$moment(this.masuk).unix();
      const diffHour = Math.ceil(diff / 3600);

      if (this.tipe === 'mobil') {
        if (diffHour > 16) {
          harga += 80000 * Math.floor(diffHour / 16) + 5000 * (diffHour % 24);
        } else {
          harga += 5000 * (diffHour % 16);
        }
      } else if (this.tipe === 'motor') {
        if (diffHour > 16) {
          harga += 40000 * Math.floor(diffHour / 16) + 2000 * (diffHour % 24);
        } else {
          harga += 2000 * (diffHour % 16);
        }
      }

      return harga || 0
    },
    form() {
      return {
        plat: this.plat.toUpperCase(),
        tipe: this.tipe,
        masuk:this.masuk,
        keluar: this.keluar
      }
    }
  },
  methods: {
    async onSubmit() {
      try {
        await this.$axios.$post('http://localhost:3001/api/parks', this.form)
        this.onReset()
      } catch (error) {
        this.error = error
      }
    },
    onReset() {
      this.plat= ''
      this.tipe= ''
      this.masuk= null
      this.keluar= null
    }
  }
}
</script>

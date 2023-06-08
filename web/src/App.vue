<template>
  <HeaderMenu v-if="$route.name !== 'Login' && $route.name !== 'Register'" />
  <router-view v-if="isRouterAlive" />
</template>
<script>
import HeaderMenu from './components/layouts/HeaderMenu.vue';

export default {
  name: 'App',
  provide() {
    return {
      reload: this.reload
    }
  },
  data() {
    return {
      isRouterAlive: true,
    }
  },
  components: {
    HeaderMenu,
  },
  computed:{

  },
  methods: {
    reload() {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      });
      
    }
  }

}
</script>
<style></style>

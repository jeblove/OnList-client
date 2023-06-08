<template>
  <div>
    <!-- <HeaderMenu></HeaderMenu> -->

    <router-view></router-view>

    
    </div>
</template>

<script>
import HeaderMenu from '../components/layouts/HeaderMenu.vue';
export default {
  components: {
    HeaderMenu,
  }
}
</script>

<style>

</style>
<template>
  <div>
    <top-navigation/>
    <router-view/>
  </div>
</template>
<script>
import TopNavigation from "@/components/TopNavigation.vue";

export default {
  name: "App",
  components: {TopNavigation},
}
</script>


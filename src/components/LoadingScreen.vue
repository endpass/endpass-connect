<template>
  <div class="loading-screen">
    <div class="loading-screen__spinner">
      <Spinner />
    </div>
  </div>  
</template>

<script>
  import Spinner from '@/components/Spinner'

  export default {
    name: 'LoadingScreen',

    components: {
      Spinner,
    },
  };
</script>

<style lang="postcss">
.loading-screen {
  position: absolute; 
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.loading-screen__spinner {
  flex: 0 0 auto;
}
</style>
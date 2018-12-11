<template>
  <pre class="code">
    <slot />
  </pre>  
</template>

<style lang="postcss">
  .code {
    padding: 20px;
    background-color: #dadada;
    overflow: auto;
    whitespace: nowrap;
  }
</style>
<template>
  <!-- TODO: Min width -->
  <div class="card lg:card-side lg:w-[80vw] bg-base-300 shadow-xl mt-4">
    <figure>
      <img :src="props.image.src" :alt="props.image.alt" />
    </figure>
    <div class="card-body">
      <h2 class="card-title">{{ props.title }}</h2>
      <p>{{ props.summary }}</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary">閱讀更多</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  image: {
    type: Object,
    default: () => ({
      src: 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp',
      alt: 'test',
    }),
  },
  title: {
    type: String,
    default: 'title',
  },
  summary: {
    type: String,
    default: 'summary',
  },
});
</script>

<style scoped></style>

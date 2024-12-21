<template>
  <div class="article-wrapper">
    <div class="cover-wrapper w-full h-96 bg-red-300">
      <div class="contact-us">
        <h2 class="zh">
          主題專欄
        </h2>
        <h3 class="eng">
          TOPIC
        </h3>
      </div>
    </div>

    <TopicCard />

    <div class="join mt-4">
      <button class="join-item btn btn-md">
        1
      </button>
      <button class="join-item btn btn-md btn-active">
        2
      </button>
      <button class="join-item btn btn-md">
        3
      </button>
      <button class="join-item btn btn-md">
        4
      </button>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.article-wrapper {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.cover-wrapper {
  display: flex;
  justify-content: right;
  align-items: flex-end;
  background-image: url('/image/contact_us_cover.webp');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center bottom;
}
.contact-us {
  width: 90dvw;
  font-size: 2rem;
  color: white;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
  margin-bottom: 3rem;
}
.contact-us .eng {
  font-size: 1.5rem;
}
</style>

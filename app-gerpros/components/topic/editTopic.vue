<template>
  <div class="w-full flex flex-col gap-4">
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">標題</span>
      </div>
      <input
          v-model="title"
          type="text"
          placeholder="Type here"
          class="input input-bordered w-full"
      >
    </label>
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">封面圖</span>
      </div>
      <img
          class="max-h-[300px] w-auto object-contain mb-4"
          :src="coverImageUrl"
          alt=""
      >
      <input
          type="file"
          class="file-input file-input-bordered file-input-sm w-full max-w-xs"
          @change="handleCoverChange"
      >
    </label>
    <label
        class="form-control w-full"
        @blur="hideDropdown"
        @focus="showDropdown"
    >
      <div class="label">
        <span class="label-text">標籤</span>
      </div>
      <div class="flex gap-2 items-center">
        <div
            v-for="tag in tags"
            :key="tag"
            class="badge badge-info gap-2 cursor-pointer"
            @click="deleteTag(tag)"
        >
          <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block h-4 w-4 stroke-current"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {{ tag }}
        </div>
        <div class="relative">
          <input
              v-model="tagInput"
              tabindex="0"
              role="button"
              type="text"
              placeholder="Type here"
              class="input input-bordered w-full w-xs"
              @focus="showDropdown"
              @click="showDropdown"
              @blur="hideDropdown"
              @keydown.enter="addTag($event.target.value)"
          >
          <ul
              v-show="isDropdownVisible"
              v-if="!!tagListOptions.length"
              tabindex="0"
              class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow absolute top-15 left-0"
          >
            <li
                v-for="tagOpt in tagListOptions"
                :key="tagOpt"
                @click="addTag(tagOpt)"
            >
              <a>{{ tagOpt }}</a>
            </li>
          </ul>
        </div>
      </div>
    </label>
    <label class="form-control">
      <div class="label">
        <span class="label-text">摘要</span>
      </div>
      <textarea
          v-model="description"
          class="textarea textarea-bordered h-24"
          placeholder="摘要"
      />
    </label>
    <div class="w-[85vw] flex flex-col gap-4">
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">內容</span>
        </div>
      </label>
      <ClientOnly>
        <QuillEditor
            v-model:content="content"
            content-type="html"
            :toolbar="[
            [{ header: 1 }, { header: 2 }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
            ['link', 'image'],
          ]"
        />
      </ClientOnly>
    </div>
    <button class="btn btn-success mb-4" @click="submit">更新</button>
    <div v-show="errorMessages" class="text-red-500">{{ errorMessages }}</div>
    <ToastMessage/>
  </div>
</template>

<script setup>
import ToastMessage from '~/components/ToastMessages.vue';

const {showToast} = useToast();

const route = useRoute();
const id = computed(() => route.params.id);
const title = ref('');
const tags = ref([]);
const tagInput = ref('');
const description = ref('');
const coverImageUrl = ref('');
const coverImageFile = ref({});
const content = ref('');
const isDropdownVisible = ref(false);
const tagList = ref([]);
const props = defineProps({
  topic: {
    type: Object,
    default: () => {
    },
  },
});

const tagListOptions = computed(() => {
  return tagList.value.filter((tag) => !tags.value.includes(tag));
});

function handleCoverChange(event) {
  const selectedFile = event.target.files[0];
  if (!selectedFile) {
    coverImageFile.value = null;
    coverImageUrl.value = props.topic.coverImage;
    return;
  }
  coverImageFile.value = selectedFile;
  coverImageUrl.value = URL.createObjectURL(selectedFile);
}

function showDropdown() {
  isDropdownVisible.value = true;
}

function hideDropdown() {
  setTimeout(() => {
    isDropdownVisible.value = false;
  }, 300);
}

function addTag(tag) {
  tagInput.value = '';
  if (tags.value.includes(tag)) return;
  tags.value.push(tag);
}

function deleteTag(tag) {
  tags.value = tags.value.filter((t) => t !== tag);
}

const errorMessages = ref('');
const successMessage = ref('');

async function submit() {
  const {formatHtml, fileStorageInfo} = await getFormatContent();
  if (coverImageFile.value instanceof File) {
    const coverImage = await uploadImage(coverImageFile.value);
    coverImageUrl.value = coverImage.url;
  } else {
    coverImageUrl.value = props.topic.coverImage;
  }
  const payload = {
    id: id.value,
    title: title.value,
    tags: [...tags.value],
    coverImage: coverImageUrl.value,
    content: formatHtml,
    description: description.value,
    fileStorageInfo,
  };

  let response;
  try {
    response = await useApiFetch(`/Posts/${id.value}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    successMessage.value = '更新成功';

    showToast('success', '產品更新成功！');
  } catch (error) {
    // 確保錯誤處理邏輯的安全性
    if (error.data) {
      const errorResponse = error.data;
      const title = errorResponse.title || 'Unknown error occurred.';
      showToast('error', '產品更新失敗！');
      errorMessages.value = title;
    } else {
      // 處理非 API 錯誤
      showToast('error', '無法與伺服器通信！');
      errorMessages.value = '無法與伺服器通信，請稍後再試。';
    }
  }


}

async function getFormatContent() {
  const base64Images = extractBase64Images(content.value);
  if (!base64Images.length) {
    return {formatHtml: content.value, fileStorageInfo: []};
  }
  const {urls, fileStorageInfo} = await uploadImages(base64Images);
  const formatHtml = replaceBase64ImagesToUrls(
      content.value,
      base64Images,
      urls,
  );
  return {formatHtml, fileStorageInfo};
}

function extractBase64Images(htmlContent) {
  const base64Images = [];
  const regex = /<img[^>]+src\s*=\s*"(data:image\/[^;]+;base64,[^"]+)"/g;
  let match;

  while ((match = regex.exec(htmlContent)) !== null) {
    base64Images.push(match[1]);
  }

  return base64Images;
}

async function uploadImages(base64Images) {
  const uploadPromises = base64Images.map(async (base64Image) => {
    const blobImage = await base64ToBlob(base64Image);
    const data = await uploadImage(blobImage);
    return {
      url: data.url,
      fileStorageInfo: data.fileStorageInfo,
    };
  });

  const results = await Promise.all(uploadPromises);

  const urls = results.map((result) => result.url);
  const fileStorageInfo = results.map((result) => result.fileStorageInfo);

  return {urls, fileStorageInfo};
}

async function uploadImage(image) {
  const formData = new FormData();
  formData.append('file', image);

  try {
    return await useApiFetch('/Posts/image-upload', {
      method: 'POST',
      body: formData,
    })
  } catch (error) {
    const apiError = error.response.data;
    const title = apiError.title || 'Unknown error occurred.';
    throw new Error(title);
  }
}

async function base64ToBlob(base64Image) {
  const response = await fetch(base64Image);
  return await response.blob();
}

function replaceBase64ImagesToUrls(htmlContent, base64Images, urls) {
  let newHtmlContent = htmlContent;

  base64Images.forEach((base64Image, index) => {
    newHtmlContent = newHtmlContent.replace(base64Image, urls[index]);
  });

  return newHtmlContent;
}

watchEffect(() => {
  title.value = props.topic.title;
  tags.value = props.topic.tags;
  description.value = props.topic.description;
  coverImageUrl.value = props.topic.coverImage;
  content.value = props.topic.content;
});

onMounted(async () => {
  await fetchTagList();
});

async function fetchTagList() {
  try {
    const data = await useApiFetch('Posts/tags');
    tagList.value = data;
  } catch (error) {
    console.error(error);
  }
}
</script>

<style scoped></style>

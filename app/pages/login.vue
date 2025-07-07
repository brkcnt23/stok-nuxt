<script setup lang="ts">
import { object, string, type InferType } from 'yup'
import type { FormSubmitEvent } from '@nuxt/ui'

// Import i18n
const { t, locale } = useI18n()

const auth = useAuth();
const toast = useToast();
const isLoading = ref(false);

// SEO metadata - i18n uyumlu
const seoTitle = computed(() => locale.value === 'tr' 
  ? 'Giriş Yap - ASMA GERME'
  : 'Login - ASMA GERME')

useSeoMeta({
    title: seoTitle
});

// Form validation schema
const schema = object({
    username: string().required('Username is required'),
    password: string().required('Password is required')
});

type Schema = InferType<typeof schema>

// Form state - default değerleri garanti altına alıyoruz
const state = reactive({
    username: '',
    password: ''
});

// Eğer kullanıcı zaten giriş yapmışsa, panel sayfasına yönlendir
// Bu kontrol, reactive değişkenler tanımlandıktan sonra yapılmalı
if (auth.isAuthenticated.value) {
    navigateTo('/panel');
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    const { username, password } = event.data;

    isLoading.value = true;

    try {
        const success = await auth.login(username, password);

        if (success) {
            toast.add({
                title: t('login.success'),
                description: t('login.success_message'),
                color: 'success'
            });
            navigateTo('/panel');
        } else {
            toast.add({
                title: t('login.error'),
                description: auth.error.value || t('login.login_failed'),
                color: 'error'
            });
        }
    } catch (error) {
        toast.add({
            title: t('login.error'),
            description: t('login.generic_error'),
            color: 'error'
        });
        console.error(error);
    } finally {
        isLoading.value = false;
    }
}

</script>

<template>
    <UContainer class="flex items-center justify-center text-center h-screen">
        <UPageCard :title="t('login.welcome')" :description="t('login.description')" icon="i-lucide-user"
            :ui="{ leadingIcon: 'size-20' }" spotlight class="-top-10 min-w-xs">


            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField :label="t('login.username')" name="username" class="w-full">
                    <UInput v-model="state.username" :placeholder="locale === 'tr' ? 'Kullanıcı adınızı girin' : 'Enter your username'" class="w-full" />
                </UFormField>

                <UFormField :label="t('login.password')" name="password" class="w-full">
                    <UInput v-model="state.password" type="password" :placeholder="locale === 'tr' ? 'Şifrenizi girin' : 'Enter your password'" class="w-full" />
                </UFormField>

                <div class="flex justify-end pt-4">
                    <UButton block type="submit" :loading="isLoading">{{ t('login.login_button') }}</UButton>
                </div>
            </UForm>
        </UPageCard>
    </UContainer>
</template>

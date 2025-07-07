<template>
    <div class="fixed bottom-8 right-5 z-50 flex flex-col-reverse gap-3 items-end">
        <UTooltip text="Bizi Arayın" :popper="{ placement: 'left' }" class="social-tooltip phone-tooltip">
            <UButton icon="i-lucide-phone" color="info" variant="subtle" size="xl" square
                class="social-button phone-button" aria-label="Telefon ile ara"
                @click="callPhone" />
        </UTooltip>
        <UTooltip text="Instagram'da Takip Edin" :popper="{ placement: 'left' }" class="social-tooltip instagram-tooltip">
            <UButton icon="i-lucide-instagram" color="error" variant="subtle" size="xl" square
                class="social-button instagram-button" aria-label="Instagram sayfamızı ziyaret et"
                @click="openInstagram" />
        </UTooltip>
        <UTooltip text="WhatsApp ile Mesaj Gönderin" :popper="{ placement: 'left' }" class="social-tooltip whatsapp-tooltip">
            <UButton icon="i-simple-icons-whatsapp" color="success" variant="subtle" size="xl" square
                class="social-button whatsapp-button" aria-label="WhatsApp ile mesaj gönder"
                @click="openWhatsApp" />
        </UTooltip>
    </div>
</template>

<script setup>
const phoneNumber = '905497222100';
const whatsappMessage = encodeURIComponent('Merhaba, ASMA GERME web sitesinden yazıyorum.');
const instagramUsername = 'asmagerme';

const openWhatsApp = () => {
    if (process.client) {
        window.open(`https://wa.me/${phoneNumber}?text=${whatsappMessage}`, '_blank');
    }
};

const openInstagram = () => {
    if (process.client) {
        window.open(`https://instagram.com/${instagramUsername}`, '_blank');
    }
};

const callPhone = () => {
    if (process.client) {
        window.location.href = `tel:+${phoneNumber}`;
    }
};
</script>

<style scoped>
/* Sosyal butonlar için profesyonel stillemeler */
.social-button {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

/* Butonlara parlaklık efekti ekle */
.social-button::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -60%;
    width: 200%;
    height: 200%;
    opacity: 0;
    transform: rotate(30deg);
    background: rgba(255, 255, 255, 0.13);
    background: linear-gradient(
        to right, 
        rgba(255, 255, 255, 0.13) 0%,
        rgba(255, 255, 255, 0.13) 77%,
        rgba(255, 255, 255, 0.5) 92%,
        rgba(255, 255, 255, 0.0) 100%
    );
}

/* Hover animasyonu */
.social-button:hover::after {
    opacity: 1;
    top: -30%;
    left: -30%;
    transition-property: left, top, opacity;
    transition-duration: 0.7s, 0.7s, 0.15s;
    transition-timing-function: ease;
}

/* Buton büyütme efekti */
.social-button:hover {
    transform: scale(1.1);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
}

/* Buton renk özellikleri */
.whatsapp-button {
    box-shadow: 0 6px 15px -2px rgba(0, 200, 83, 0.4);
}

.instagram-button {
    box-shadow: 0 6px 15px -2px rgba(225, 48, 108, 0.4);
}

.phone-button {
    box-shadow: 0 6px 15px -2px rgba(59, 130, 246, 0.4);
}

/* Tooltip stillemesi */
:deep(.social-tooltip .u-tooltip) {
    font-weight: 500;
    padding: 0.5rem 1rem !important;
    border-radius: 9999px !important;
}

:deep(.whatsapp-tooltip .u-tooltip) {
    background-color: rgba(0, 200, 83, 0.9) !important;
}

:deep(.instagram-tooltip .u-tooltip) {
    background-color: rgba(225, 48, 108, 0.9) !important;
}

:deep(.phone-tooltip .u-tooltip) {
    background-color: rgba(59, 130, 246, 0.9) !important;
}

/* Mobil cihazlar için daha küçük butonlar */
@media (max-width: 640px) {
    .fixed.bottom-8.right-5 {
        bottom: 1rem;
        right: 1rem;
    }
    
    /* Mobilde butonları daha sık yerleştir */
    .fixed.bottom-8.right-5 {
        gap: 0.5rem;
    }
    
    /* Mobil cihazlarda daha küçük gölgeler */
    .social-button {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
}
</style>

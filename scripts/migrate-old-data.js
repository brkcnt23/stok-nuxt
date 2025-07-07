/**
 * Eski MySQL verilerini yeni i18n destekli Nuxt sistemine migrate etme scripti
 * Kullanım: node scripts/migrate-old-data.js
 */

// Eski sistem verilerini Nuxt Blog formatına dönüştürme (i18n uyumlu)
const oldBlogData = [
  {
    id: 6,
    i18n: {
      tr: {
        title: "AÇILIR-KAPANIR ŞEMSİYE",
        description: "Açılır-Kapanır Şemsiye ve Asma Germe Sistemleri, formu, deseni ve özenli işçiliğiyle mimaride estetik bir unsur olmanın yanı sıra, hidrolik tabanlı tasarımı ve pratik fonksiyonelliğiyle öne çıkmaktadır.",
        content: `<p>Açılır-Kapanır Şemsiye ve Asma Germe Sistemleri, formu, deseni ve özenli işçiliğiyle mimaride estetik bir unsur olmanın yanı sıra, hidrolik tabanlı tasarımı ve pratik fonksiyonelliğiyle öne çıkmaktadır. Sistemin birleşim noktaları, açılıp kapanma hareketini en verimli şekilde gerçekleştirebilmek için germe sistemi prensipleriyle uyumlu mekanik toleranslar ve hassas mühendislik detaylarıyla optimize edilmiştir.</p>

<p>Asma germe teknolojisiyle entegre edilen bu yapılar, membran malzemenin esnekliği ve dayanıklılığı sayesinde hem yağmur hem de güneş gibi zorlu hava koşullarına karşı üstün koruma sağlar. Modüllerin ayarlanabilir yükseklik özelliği, kullanıcılara ihtiyaca göre özelleştirilmiş bir kullanım imkânı sunarken, özel otomasyon yazılımı ile tüm germe sistemi senkronize edilebilir veya modüller tek tek kontrol edilebilir.</p>

<p>Kullanılan membran örtü, asma germe mühendisliğinin gerektirdiği açılıp kapanma testlerinden başarıyla geçmiş olup, katlanma sırasında deformasyon veya yırtılma riskini en aza indirecek şekilde tasarlanmıştır. Ayrıca, germe sistemi bileşenleri paslanmaz çelik ve UV dirençli malzemelerle üretildiğinden, periyodik bakımla birlikte onlarca yıl sorunsuz kullanım garantisi sağlar.</p>`,
        tags: ['Açılır-Kapanır Şemsiye', 'Asma Germe', 'Hidrolik Sistem', 'Membran Teknolojisi']
      },
      en: {
        title: "RETRACTABLE UMBRELLA SYSTEMS",
        description: "Retractable Umbrella and Tensioned Membrane Systems stand out with their form, design, and meticulous craftsmanship as an aesthetic element in architecture, as well as their hydraulic-based design and practical functionality.",
        content: `<p>Retractable Umbrella and Tensioned Membrane Systems stand out with their form, design, and meticulous craftsmanship as an aesthetic element in architecture, as well as their hydraulic-based design and practical functionality. The system's connection points are optimized with mechanical tolerances and precise engineering details compatible with tension system principles to achieve the most efficient opening and closing movement.</p>

<p>These structures, integrated with tensioned membrane technology, provide superior protection against harsh weather conditions such as rain and sun thanks to the flexibility and durability of the membrane material. The adjustable height feature of the modules offers users customized usage options according to their needs, while the entire tension system can be synchronized with special automation software or modules can be controlled individually.</p>

<p>The membrane covering used has successfully passed the opening and closing tests required by tensioned membrane engineering and is designed to minimize the risk of deformation or tearing during folding. Additionally, since the tension system components are manufactured with stainless steel and UV-resistant materials, they guarantee trouble-free use for decades with periodic maintenance.</p>`,
        tags: ['Retractable Umbrella', 'Tensioned Membrane', 'Hydraulic System', 'Membrane Technology']
      }
    },
    slug: "acilir-kapanir-semsiye-sistemleri",
    category: "acilir-kapanir",
    tags: ['Outdoor Systems', 'Weather Protection'],
    coverImage: "https://picsum.photos/1200/630?random=1",
    isPublished: true
  },
  {
    id: 7,
    i18n: {
      tr: {
        title: "AKUSTİK PERFORMANS VE MİMARİ ÇÖZÜMLER",
        description: "Akustik performans, insanların birbirini rahatlıkla duyabildiği toplantı salonları, konferans alanları gibi mekânlarda olduğu kadar, kakofoni ve gürültü kirliliğinin önlenmesi gereken tüm ortamlarda kritik bir mimari gerekliliktir.",
        content: `<p>Akustik performans, insanların birbirini rahatlıkla duyabildiği <strong>toplantı salonları</strong>, <strong>konferans alanları</strong> gibi mekânlarda olduğu kadar, <strong>kakofoni</strong> (ses karmaşası) ve <strong>gürültü kirliliğinin</strong> önlenmesi gereken tüm ortamlarda kritik bir mimari gerekliliktir.</p>

<p>Firmamız, <strong>asma germe gergi sistemlerindeki</strong> mühendislik tecrübesi, malzeme bilgisi ve detay odaklı yaklaşımını, akustik problemlere yönelik çözümlerle birleştirmektedir. Bu kapsamda:</p>

<ul>
<li><strong>Akustik tekstil örtüler</strong>: Ses yutma katsayısı yüksek, özel dokuma membran veya kumaşlarla tasarlanmış sistemler</li>
<li><strong>Hibrit çözümler</strong>: Geleneksel malzemeler (keçe, taşyünü, akustik sünger) ile asma germe sistemlerinin entegrasyonu</li>
<li><strong>Parametrik tasarım</strong>: Ortamın ihtiyacına göre hesaplanan reverberasyon süresi, ses dağılımı ve yankı kontrolü gibi parametreler dikkate alınarak projelendirme</li>
</ul>

<p>Özellikle olimpik yüzme havuzları gibi yüksek yankı riski taşıyan ortamlarda, tavana entegre edilen asma germe membranlar veya akustik paneller ile ses yansımaları minimize edilir.</p>`,
        tags: ['Akustik Çözümler', 'Ses Yalıtımı', 'Mimari Akustik', 'Reverberasyon Kontrolü']
      },
      en: {
        title: "ACOUSTIC PERFORMANCE AND ARCHITECTURAL SOLUTIONS",
        description: "Acoustic performance is a critical architectural requirement not only in meeting halls and conference areas where people can comfortably hear each other, but also in all environments where cacophony and noise pollution need to be prevented.",
        content: `<p>Acoustic performance is a critical architectural requirement not only in <strong>meeting halls</strong> and <strong>conference areas</strong> where people can comfortably hear each other, but also in all environments where <strong>cacophony</strong> (sound confusion) and <strong>noise pollution</strong> need to be prevented.</p>

<p>Our company combines its engineering experience, material knowledge, and detail-oriented approach in <strong>tensioned membrane systems</strong> with solutions for acoustic problems. In this context:</p>

<ul>
<li><strong>Acoustic textile covers</strong>: Systems designed with high sound absorption coefficient, special woven membrane or fabrics</li>
<li><strong>Hybrid solutions</strong>: Integration of traditional materials (felt, rockwool, acoustic foam) with tensioned membrane systems</li>
<li><strong>Parametric design</strong>: Project planning considering parameters such as reverberation time, sound distribution, and echo control calculated according to the environment's needs</li>
</ul>

<p>Especially in environments with high echo risk such as Olympic swimming pools, sound reflections are minimized with tensioned membrane membranes or acoustic panels integrated into the ceiling.</p>`,
        tags: ['Acoustic Solutions', 'Sound Insulation', 'Architectural Acoustics', 'Reverberation Control']
      }
    },
    slug: "akustik-performans-mimari-cozumler",
    category: "akustik",
    tags: ['Acoustic Engineering', 'Sound Control'],
    coverImage: "https://picsum.photos/1200/630?random=2",
    isPublished: true
  }
];

// Eski sistem ürün verileri (i18n uyumlu)
const oldProductData = [
  {
    id: 1,
    i18n: {
      tr: {
        name: "ASMA GERME SİSTEMLER",
        description: "Taşıyıcı sistemi sadece çekme kuvveti alan tekstil örtülerin (membran) ve/veya kabloların tamamen ya da kısmen kullanılması ile oluşturulan yapı sistemleridir.",
        content: `<p>Membran örtüler polyester ya da cam liflerinin dokunması ile elde edilen özel bir tür kumaştır. Bu lifleri dış etkenlere karşı korumak ve kumaşa su/hava geçirmezliği sağlamak için liflerin üzerine PVC, PTFE ya da silikon malzemeleri ile kaplama uygulanır.</p>

<p>Klasik yapı sistemlerinden farklı olarak membran malzemesinin hafif olması yapıya aktarılacak ölü yükün az olmasını sağlar. Esnek malzeme olmaları nedeni ile çok çeşitli formlar oluşturulabilme imkanı ile görsel zenginlik sunarlar.</p>`,
        tags: ['Asma Germe', 'Membran Yapı', 'PVC Kaplama', 'PTFE']
      },
      en: {
        name: "TENSIONED MEMBRANE SYSTEMS",
        description: "Building systems created by using textile covers (membranes) and/or cables that only take tensile forces as the load-bearing system, completely or partially.",
        content: `<p>Membrane covers are a special type of fabric obtained by weaving polyester or glass fibers. To protect these fibers against external influences and provide water/air impermeability to the fabric, coatings with PVC, PTFE or silicone materials are applied on the fibers.</p>

<p>Unlike classical building systems, the lightness of the membrane material ensures that the dead load to be transferred to the structure is low. Due to their flexible nature, they offer visual richness with the possibility of creating various forms.</p>`,
        tags: ['Tensioned Membrane', 'Membrane Structure', 'PVC Coating', 'PTFE']
      }
    },
    category: "asma-germe",
    slug: "asma-germe-sistemler"
  },
  {
    id: 2,
    i18n: {
      tr: {
        name: "ETFE SİSTEMLER",
        description: "Transparan çatı ve cephe uygulamaları için geliştirilmiş, hafif, dayanıklı ve enerji verimli yapı malzemesi sistemleri.",
        content: `<h2>ETFE SİSTEMLER</h2><p>Son yıllarda, yapı malzemeleri sektöründe sürdürülebilirlik, enerji verimliliği ve estetik tasarım gibi trendler öne çıkmaya başlamıştır. ETFE, tamamen geri dönüştürülebilir olması ve uzun ömrü sayesinde bu ihtiyacı karşılamaktadır.</p>`,
        tags: ['ETFE', 'Transparan Çatı', 'Enerji Verimliliği', 'Sürdürülebilir Yapı']
      },
      en: {
        name: "ETFE SYSTEMS",
        description: "Light, durable and energy-efficient building material systems developed for transparent roof and facade applications.",
        content: `<h2>ETFE SYSTEMS</h2><p>In recent years, trends such as sustainability, energy efficiency and aesthetic design have started to come to the fore in the building materials sector. ETFE meets this need thanks to its complete recyclability and long life.</p>`,
        tags: ['ETFE', 'Transparent Roof', 'Energy Efficiency', 'Sustainable Building']
      }
    },
    category: "etfe",
    slug: "etfe-sistemler"
  }
];

// Yeni blog oluşturma fonksiyonu (örnek API kullanımı)
async function createBlogFromOldData(blogData) {
  try {
    const response = await fetch('/api/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authentication header'ı gerekebilir
      },
      body: JSON.stringify(blogData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Blog oluşturuldu:', result.i18n.tr.title);
    return result;
  } catch (error) {
    console.error('❌ Blog oluşturulurken hata:', error);
    throw error;
  }
}

// Migration işlemi
async function migrateOldBlogs() {
  console.log('🚀 Eski blog verilerini i18n destekli sisteme migrate ediliyor...');
  
  for (const oldBlog of oldBlogData) {
    try {
      await createBlogFromOldData(oldBlog);
    } catch (error) {
      console.error(`❌ Blog migrate edilemedi: ${oldBlog.i18n.tr.title}`, error);
    }
  }
  
  console.log('✅ Blog migration tamamlandı!');
}

console.log('🔄 Eski sistem verileri i18n uyumlu hale getirildi.');
console.log(`📊 Blog yazıları: ${oldBlogData.length}`);
console.log(`📦 Ürünler: ${oldProductData.length}`);
console.log('\n� i18n Blog Yapısı:');
console.log('- Her blog için Türkçe (tr) ve İngilizce (en) içerik');
console.log('- Ortak slug ve kategori sistemi');
console.log('- Dil bazlı etiketleme');

// Veriler manuel olarak yeni sisteme entegre edilmeye hazır
// ya da API üzerinden otomatik olarak import edilebilir
module.exports = {
  oldBlogData,
  oldProductData,
  migrateOldBlogs
};

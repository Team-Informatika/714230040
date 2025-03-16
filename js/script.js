document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll('.card-thumbnail');
    const pdfCache = new Map(); // Cache untuk menyimpan hasil render PDF

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const pdfUrl = card.getAttribute('data-pdf');

                if (pdfUrl && !pdfCache.has(pdfUrl)) {
                    loadPDFBackground(pdfUrl, card, pdfCache);
                } else if (pdfCache.has(pdfUrl)) {
                    // Gunakan hasil yang sudah di-cache
                    card.style.backgroundImage = `url(${pdfCache.get(pdfUrl)})`;
                }
            }
        });
    }, { rootMargin: "100px" }); // Load lebih awal sebelum elemen benar-benar masuk viewport

    cards.forEach(card => observer.observe(card));
});

function loadPDFBackground(pdfUrl, cardElement, cache) {
    pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
        pdf.getPage(1).then(page => {
            const scale = 1.5; // Skala lebih rendah untuk efisiensi performa
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = { canvasContext: context, viewport };
            page.render(renderContext).promise.then(() => {
                const imgData = canvas.toDataURL('image/png');
                cache.set(pdfUrl, imgData); // Simpan hasil ke cache
                cardElement.style.backgroundImage = `url(${imgData})`;
                cardElement.style.backgroundSize = 'cover';
                cardElement.style.objectFit = 'cover';
                cardElement.style.height = '100%';
            });
        }).catch(error => console.error('Gagal mengambil halaman:', error));
    }).catch(error => console.error('Gagal memuat PDF:', error));
}

document.querySelectorAll('.card-thumbnail').forEach(thumbnail => {
    const video = thumbnail.querySelector('.thumbnail-video');

    thumbnail.addEventListener('mouseenter', () => {
        video.play();
    });

    thumbnail.addEventListener('mouseleave', () => {
        video.pause();
    });
});

// Bakı vaxtını ISO formatında qaytaran funksiya
function getAzTime() {
    try {
        const now = new Date();
        // UTC vaxtı
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        // Bakı vaxtı (UTC+4)
        return new Date(utc + 4 * 3600000).toISOString();
    } catch (e) {
        console.error("getAzTime error:", e);
        return new Date().toISOString();
    }
}

// SKAN FUNKSİYASI (BUG-SIZ)
async function uploadFile(inputElement) {

    // Fayl seçilməyibsə çıx
    if (!inputElement || !inputElement.files || !inputElement.files[0]) return;

    const file = inputElement.files[0];
    const modal = document.getElementById("scanModal");
    const resultDiv = document.getElementById("scanResult");

    // Modalı göstər
    if (modal) modal.classList.remove("hidden");

    // FormData düzgün hazırlanır
    const formData = new FormData();
    formData.append("file", file);

    try {
        // Serverə göndər
        const response = await fetch("/api/scan-receipt", {
            method: "POST",
            body: formData, // MÜTLƏQ: Content-Type AJAX-da əl ilə verilməməlidir!
            headers: {
                "X-Client-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
                "X-Client-Date": getAzTime()
            }
        });

        if (!response.ok) {
            alert("Server xətası: " + response.status);
            console.error("SERVER ERROR:", response.status);
            return;
        }

        // HTML nəticəni alırıq
        const html = await response.text();

        // Səhifədə göstəririk
        if (resultDiv) {
            resultDiv.innerHTML = html;
            // HTMX varsa yeni gələn HTML-i aktiv edir
            if (window.htmx) htmx.process(resultDiv);
        }

    } catch (error) {
        console.error("Upload Error:", error);
        alert("Xəta: İnternet bağlantısı və ya server çalışmır");
    } finally {
        // Inputu təmizlə — eyni fayl yenidən seçilə bilsin
        inputElement.value = "";

        // Modalı bağla
        if (modal) modal.classList.add("hidden");
    }
}

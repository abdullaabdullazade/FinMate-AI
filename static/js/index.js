// Index Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("categoryChart");
    if (!ctx) return;

    // Get data from data attributes or global variables
    const chartLabels = window.chartLabels || [];
    const chartValues = window.chartValues || [];
    
    if (!chartLabels.length || !chartValues.length) return;

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartValues,
                backgroundColor: ["#60a5fa","#22d3ee","#c084fc","#34d399","#fca5a5","#facc15"],
                borderWidth: 0
            }]
        },
        options: {
            plugins: { 
                legend: { 
                    display: true, 
                    position: "bottom", 
                    labels: { color: "#e5e7eb" } 
                } 
            },
            cutout: "70%"
        }
    });
});


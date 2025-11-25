import matplotlib.pyplot as plt

# Create a figure for the solution
fig, ax = plt.subplots(figsize=(10, 8))
ax.axis('off')

# Title
ax.text(0.05, 0.95, "Məsələnin Həlli:", fontsize=18, fontweight='bold', color='darkblue')

# Step 1: The problem
ax.text(0.05, 0.88, r"Verilib: $n^{10} - 3n^6 + 8$", fontsize=16)
ax.text(0.05, 0.83, "Məqsəd: Bu ifadəni n say sistemində müsbət əmsallı", fontsize=12, style='italic')
ax.text(0.05, 0.80, "çoxhədli şəklinə gətirmək.", fontsize=12, style='italic')

# Step 2: Breaking down n^10
ax.text(0.05, 0.73, r"1. $n^{10}$ həddini parçalayaq (borc almaq üçün):", fontsize=14)
ax.text(0.1, 0.66, r"$n^{10} = n \cdot n^9 = (n-1)n^9 + n^9$", fontsize=14)
ax.text(0.1, 0.59, r"davamı: $n^9 = (n-1)n^8 + n^8 ...$", fontsize=12, color='gray')
ax.text(0.1, 0.52, r"Yekun açılış: $n^{10} = (n-1)n^9 + (n-1)n^8 + (n-1)n^7 + n \cdot n^6$", fontsize=14)

# Step 3: Substitution
ax.text(0.05, 0.45, r"2. İfadədə yerinə qoyaq:", fontsize=14)
ax.text(0.1, 0.38, r"$[(n-1)n^9 + (n-1)n^8 + (n-1)n^7 + n \cdot n^6] - 3n^6 + 8$", fontsize=14)
ax.text(0.1, 0.31, r"Sadələşmiş forma: $(n-1)n^9 + (n-1)n^8 + (n-1)n^7 + (n-3)n^6 + 8$", fontsize=14, fontweight='bold')

# Step 4: Sum of digits
ax.text(0.05, 0.24, r"3. Rəqəmlər cəmi = 38:", fontsize=14)
ax.text(0.1, 0.18, r"$(n-1) + (n-1) + (n-1) + (n-3) + 8 = 38$", fontsize=14)
ax.text(0.1, 0.12, r"$3(n-1) + n + 5 = 38$", fontsize=14)
ax.text(0.1, 0.06, r"$3n - 3 + n + 5 = 38 \Rightarrow 4n + 2 = 38 \Rightarrow 4n = 36 \Rightarrow n=9$", fontsize=16, color='red')

plt.tight_layout()
plt.savefig('math_solution.png')
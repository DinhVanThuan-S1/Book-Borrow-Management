<template>
  <div class="category-card" @click="viewCategory">
    <div class="category-icon">
      <i :class="getCategoryIcon()"></i>
    </div>

    <div class="category-info">
      <h5 class="category-title">{{ category.TenDM }}</h5>
      <p class="category-description" v-if="category.MoTa">
        {{ category.MoTa }}
      </p>
      <div class="category-stats">
        <span class="book-count">
          <i class="bi bi-book me-1"></i>
          {{ category.soLuongSach || 0 }} cuốn sách
        </span>
      </div>
    </div>

    <div class="category-arrow">
      <i class="bi bi-arrow-right"></i>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "CategoryCard",
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();

    const getCategoryIcon = () => {
      const categoryName = props.category.TenDM.toLowerCase();

      // Map category names to icons
      const iconMap = {
        "văn học": "bi bi-book",
        "khoa học": "bi bi-flask",
        "công nghệ": "bi bi-cpu",
        "kinh tế": "bi bi-graph-up",
        "tâm lý": "bi bi-heart",
        "y học": "bi bi-heart-pulse",
        "lịch sử": "bi bi-clock-history",
        "địa lý": "bi bi-globe",
        "toán học": "bi bi-calculator",
        "vật lý": "bi bi-lightning",
        "hóa học": "bi bi-moisture",
        "sinh học": "bi bi-tree",
        "tiếng anh": "bi bi-translate",
        "thể thao": "bi bi-bicycle",
        "âm nhạc": "bi bi-music-note",
        "nghệ thuật": "bi bi-palette",
        "nấu ăn": "bi bi-cup-hot",
        "du lịch": "bi bi-airplane",
        "trẻ em": "bi bi-balloon",
        "triết học": "bi bi-lightbulb",
      };

      // Find matching icon
      for (const [key, icon] of Object.entries(iconMap)) {
        if (categoryName.includes(key)) {
          return icon;
        }
      }

      // Default icon
      return "bi bi-bookmark";
    };

    const viewCategory = () => {
      router.push({
        name: "BookCatalog",
        query: { category: props.category._id },
      });
    };

    return {
      getCategoryIcon,
      viewCategory,
    };
  },
};
</script>

<style scoped>
.category-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.category-card:hover::before {
  transform: scaleX(1);
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px -12px rgba(0, 0, 0, 0.25);
}

.category-icon {
  width: 80px;
  height: 80px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: white;
  transition: all 0.3s ease;
}

.category-card:hover .category-icon {
  transform: scale(1.1);
}

.category-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.category-title {
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  color: var(--dark-color);
}

.category-description {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-stats {
  margin-top: auto;
}

.book-count {
  background: var(--light-color);
  color: var(--primary-color);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.category-arrow {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 30px;
  height: 30px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  opacity: 0;
  transition: all 0.3s ease;
}

.category-card:hover .category-arrow {
  opacity: 1;
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .category-card {
    padding: 1.5rem 1rem;
  }

  .category-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .category-title {
    font-size: 1.1rem;
  }
}
</style>

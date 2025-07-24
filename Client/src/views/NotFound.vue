<template>
  <div class="not-found-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8 text-center">
          <div class="error-content">
            <div class="error-animation">
              <div class="error-number">4</div>
              <div class="error-book">
                <i class="bi bi-book"></i>
              </div>
              <div class="error-number">4</div>
            </div>

            <h1 class="error-title">Trang không tìm thấy</h1>
            <p class="error-description">
              Rất tiếc! Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di
              chuyển. Hãy kiểm tra lại đường dẫn hoặc quay về trang chủ.
            </p>

            <div class="error-actions">
              <router-link to="/" class="btn btn-primary-gradient btn-lg me-3">
                <i class="bi bi-house me-2"></i>
                Về trang chủ
              </router-link>
              <button @click="goBack" class="btn btn-outline-primary btn-lg">
                <i class="bi bi-arrow-left me-2"></i>
                Quay lại
              </button>
            </div>

            <div class="suggestions mt-5">
              <h5>Có thể bạn quan tâm:</h5>
              <div class="suggestion-links">
                <router-link to="/sach" class="suggestion-link">
                  <i class="bi bi-search me-2"></i>
                  Tìm kiếm sách
                </router-link>
                <router-link to="/" class="suggestion-link">
                  <i class="bi bi-house me-2"></i>
                  Về trang chủ
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "NotFound",
  setup() {
    const router = useRouter();

    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1);
      } else {
        router.push("/");
      }
    };

    return {
      goBack,
    };
  },
};
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.not-found-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="books" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect fill="rgba(255,255,255,0.02)" width="20" height="20"/><path d="M2 2h16v16H2z" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(%23books)"/></svg>');
}

.error-content {
  position: relative;
  z-index: 1;
}

.error-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
  gap: 1rem;
}

.error-number {
  font-size: 8rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: bounce 2s infinite;
}

.error-book {
  font-size: 6rem;
  color: rgba(255, 255, 255, 0.9);
  animation: swing 3s ease-in-out infinite;
  transform-origin: center top;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

@keyframes swing {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-15deg);
  }
  75% {
    transform: rotate(15deg);
  }
}

.error-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.error-description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  opacity: 0.9;
}

.error-actions {
  margin-bottom: 3rem;
}

.btn {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn-outline-primary {
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
}

.btn-outline-primary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
  color: white;
}

.suggestions h5 {
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.suggestion-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.suggestion-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.suggestion-link:hover {
  color: white;
  border-color: white;
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .error-number {
    font-size: 5rem;
  }

  .error-book {
    font-size: 4rem;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-description {
    font-size: 1.1rem;
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .error-actions .btn {
    width: 100%;
  }

  .suggestion-links {
    flex-direction: column;
    align-items: center;
  }

  .suggestion-link {
    width: 100%;
    text-align: center;
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  .error-animation {
    margin-bottom: 2rem;
  }

  .error-number {
    font-size: 4rem;
  }

  .error-book {
    font-size: 3rem;
  }

  .error-title {
    font-size: 1.5rem;
  }
}
</style>

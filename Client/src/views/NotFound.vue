<template>
  <div class="not-found-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8 text-center">
          <div class="error-content">
            <h1 class="error-title">404</h1>
            <h2 class="error-subtitle">Không tìm thấy trang</h2>
            <p class="error-description">
              Trang bạn đang tìm kiếm không tồn tại.
            </p>
            
            <div class="error-actions">
              <router-link to="/" class="btn btn-primary btn-lg">
                <i class="bi bi-house me-2"></i>
                Về trang chủ
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 2rem 0;
}

.error-content {
  text-align: center;
}

.error-title {
  font-size: 6rem;
  font-weight: 900;
  color: #6c757d;
  margin-bottom: 1rem;
  line-height: 1;
}

.error-subtitle {
  font-size: 2rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
}

.error-description {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.error-actions {
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

@media (max-width: 768px) {
  .error-title {
    font-size: 4rem;
  }

  .error-subtitle {
    font-size: 1.5rem;
  }

  .error-description {
    font-size: 1rem;
  }
}
</style>

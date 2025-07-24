<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-card">
        <!-- Header -->
        <div class="auth-header">
          <router-link to="/" class="brand-link">
            <i class="bi bi-book text-primary me-2"></i>
            <span>Thư Viện Online</span>
          </router-link>
        </div>

        <!-- Content -->
        <div class="auth-content">
          <router-view />
        </div>

        <!-- Footer -->
        <div class="auth-footer">
          <p class="text-center text-muted">
            &copy; {{ new Date().getFullYear() }} Thư Viện Online. Phát triển
            bởi
            <a
              href="https://github.com/DinhVanThuan-S1"
              target="_blank"
              class="text-decoration-none"
            >
              DinhVanThuan-S1
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- Background -->
    <div class="auth-background">
      <div class="auth-pattern"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AuthLayout",
};
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: var(--gradient-primary);
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.auth-pattern {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(
      circle at 25% 25%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 75% 75%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    );
  background-size: 100px 100px;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.auth-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 450px;
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header {
  padding: 2rem 2rem 0;
  text-align: center;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  color: var(--dark-color);
  transition: all 0.3s ease;
}

.brand-link:hover {
  color: var(--primary-color);
  transform: scale(1.05);
}

.auth-content {
  padding: 2rem;
}

.auth-footer {
  padding: 1rem 2rem 2rem;
}

@media (max-width: 576px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    border-radius: 0.5rem;
  }

  .auth-header,
  .auth-content {
    padding: 1.5rem;
  }

  .auth-footer {
    padding: 1rem 1.5rem 1.5rem;
  }
}
</style>

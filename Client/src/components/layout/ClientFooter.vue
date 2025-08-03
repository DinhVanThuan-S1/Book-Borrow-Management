<template>
  <footer class="client-footer">
    <div class="container">
      <div class="row">
        <!-- About Section -->
        <div class="col-lg-4 col-md-6 mb-4">
          <h5 class="text-white mb-3">
            <i class="bi bi-book text-gradient me-2"></i>
            Thư Viện Online
          </h5>
          <p class="text-light mb-3">
            Hệ thống thư viện trực tuyến hiện đại, cung cấp kho sách phong phú 
            và dịch vụ mượn sách tiện lợi cho mọi người.
          </p>
          <div class="social-links">
            <a href="#" class="social-link me-3">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="#" class="social-link me-3">
              <i class="bi bi-twitter"></i>
            </a>
            <a href="#" class="social-link me-3">
              <i class="bi bi-instagram"></i>
            </a>
            <a href="#" class="social-link">
              <i class="bi bi-youtube"></i>
            </a>
          </div>
        </div>
        
        <!-- Quick Links -->
        <div class="col-lg-2 col-md-6 mb-4">
          <h5 class="text-white mb-3">Liên kết</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/" class="footer-link">
                <i class="bi bi-house me-2"></i>
                Trang chủ
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/sach" class="footer-link">
                <i class="bi bi-book me-2"></i>
                Danh mục sách
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="#" class="footer-link">
                <i class="bi bi-info-circle me-2"></i>
                Giới thiệu
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="#" class="footer-link">
                <i class="bi bi-envelope me-2"></i>
                Liên hệ
              </router-link>
            </li>
          </ul>
        </div>
        
        <!-- Services -->
        <div class="col-lg-3 col-md-6 mb-4">
          <h5 class="text-white mb-3">Dịch vụ</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <a href="#" class="footer-link">
                <i class="bi bi-arrow-left-right me-2"></i>
                Mượn sách online
              </a>
            </li>
            <li class="mb-2">
              <a href="#" class="footer-link">
                <i class="bi bi-search me-2"></i>
                Tìm kiếm nâng cao
              </a>
            </li>
            <li class="mb-2">
              <a href="#" class="footer-link">
                <i class="bi bi-heart me-2"></i>
                Danh sách yêu thích
              </a>
            </li>
            <li class="mb-2">
              <a href="#" class="footer-link">
                <i class="bi bi-bell me-2"></i>
                Thông báo mới
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Contact Info -->
        <div class="col-lg-3 col-md-6 mb-4">
          <h5 class="text-white mb-3">Thông tin liên hệ</h5>
          <div class="contact-info">
            <div class="contact-item mb-3">
              <i class="bi bi-geo-alt text-primary me-2"></i>
              <span>Khu 2, Xuân Khánh, Ninh Kiều, Cần Thơ</span>
            </div>
            <div class="contact-item mb-3">
              <i class="bi bi-telephone text-primary me-2"></i>
              <a href="#" class="footer-link">
                0382906852
              </a>
            </div>
            <div class="contact-item mb-3">
              <i class="bi bi-envelope text-primary me-2"></i>
              <a href="#" class="footer-link">
                dinhthuan836@gmail.com
              </a>
            </div>
            <div class="contact-item">
              <i class="bi bi-clock text-primary me-2"></i>
              <span>Thứ 2 - Thứ 7 : 08:00 - 22:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="mb-0">
              &copy; {{ currentYear }} Thư Viện online
              Được phát triển bởi 
              <a href="https://github.com/DinhVanThuan-S1" class="footer-link" target="_blank">
                DinhVanThuan-S1
              </a>
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="footer-links">
              <a href="#" class="footer-link me-3">Chính sách bảo mật</a>
              <a href="#" class="footer-link me-3">Điều khoản sử dụng</a>
              <a href="#" class="footer-link">Hỗ trợ</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'ClientFooter',
  setup() {
    const toast = useToast()
    
    const newsletterEmail = ref('')
    const isSubscribing = ref(false)
    
    const currentYear = computed(() => new Date().getFullYear())
    
    const subscribeNewsletter = async () => {
      if (!newsletterEmail.value.trim()) return
      
      isSubscribing.value = true
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        toast.success('Đăng ký nhận thông tin thành công!')
        newsletterEmail.value = ''
      } catch (error) {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
      } finally {
        isSubscribing.value = false
      }
    }
    
    return {
      newsletterEmail,
      isSubscribing,
      currentYear,
      subscribeNewsletter
    }
  }
}
</script>

<style scoped>
.client-footer {
  background: var(--dark-color);
  margin-top: auto;
}

.social-links {
  display: flex;
  gap: 0.5rem;
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.contact-item {
  display: flex;
  align-items: flex-start;
  color: #d1d5db;
  font-size: 0.9rem;
  line-height: 1.5;
}

.newsletter-form .form-control {
  border: 1px solid #374151;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: var(--border-radius) 0 0 var(--border-radius);
}

.newsletter-form .form-control::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.newsletter-form .form-control:focus {
  border-color: var(--primary-color);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: none;
  color: white;
}

.newsletter-form .btn {
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding: 1.5rem 0;
  margin-top: 2rem;
}

.footer-links a {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .newsletter-form {
    margin-bottom: 1rem;
  }
  
  .app-download {
    text-align: center;
  }
  
  .footer-links {
    text-align: center;
    margin-top: 1rem;
  }
}
</style>
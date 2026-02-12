<template>
  <div class="navigation-pc">
    <div class="sidebar">
      <div class="logo-area">
        <h1>Space</h1>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/" class="nav-item" active-class="active">
          <HomeOutlined />
          <span>Home</span>
        </router-link>
        
        <router-link to="/notes" class="nav-item" active-class="active">
          <FileTextOutlined />
          <span>Notes</span>
        </router-link>
        
        <router-link to="/todo" class="nav-item" active-class="active">
          <CheckSquareOutlined />
          <span>Tasks</span>
        </router-link>
        
        <router-link to="/s3" class="nav-item" active-class="active">
          <CloudServerOutlined />
          <span>Storage</span>
        </router-link>
      </nav>
      
      <div class="footer-area">
        <!-- Future Settings or User Profile could go here -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  HomeOutlined, 
  FileTextOutlined, 
  CheckSquareOutlined, 
  CloudServerOutlined,
  SettingOutlined
} from '@ant-design/icons-vue';
</script>

<style scoped>
.navigation-pc {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 240px;
  background: rgba(18, 18, 18, 0.95);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.logo-area {
  padding: 32px 24px;
}

.logo-area h1 {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.5px;
}

.nav-menu {
  flex: 1;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #888;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 15px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-item :deep(.anticon) {
  font-size: 18px;
}

.footer-area {
  padding: 24px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>

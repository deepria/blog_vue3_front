<template>
  <nav class="navigation-mobile">
    <router-link to="/" class="nav-item" active-class="active">
      <div class="icon-wrapper">
        <HomeOutlined />
      </div>
      <span class="label">Home</span>
    </router-link>
    
    <router-link to="/notes" class="nav-item" active-class="active">
      <div class="icon-wrapper">
        <FileTextOutlined />
      </div>
      <span class="label">Notes</span>
    </router-link>
    
    <router-link to="/todo" class="nav-item" active-class="active">
      <div class="icon-wrapper">
        <CheckSquareOutlined />
      </div>
      <span class="label">Tasks</span>
    </router-link>
    
    <router-link to="/s3" class="nav-item" active-class="active">
      <div class="icon-wrapper">
        <CloudServerOutlined />
      </div>
      <span class="label">Storage</span>
    </router-link>
  </nav>
</template>

<script setup>
import { 
  HomeOutlined, 
  FileTextOutlined, 
  CheckSquareOutlined, 
  CloudServerOutlined 
} from '@ant-design/icons-vue';
</script>

<style scoped>
.navigation-mobile {
  position: fixed;
  bottom: 24px;
  left: 24px;
  right: 24px;
  height: 64px;
  background: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 0 16px;
  max-width: 400px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  width: 56px;
  height: 56px;
}

.icon-wrapper {
  font-size: 22px;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label {
  font-size: 10px;
  margin-top: 2px;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.3s ease;
  position: absolute;
  bottom: 8px;
  font-weight: 600;
}

.nav-item.active {
  color: #fff;
}

.nav-item.active .icon-wrapper {
  transform: translateY(-8px);
}

.nav-item.active .label {
  opacity: 1;
  transform: translateY(14px);
}

/* Add a glowing dot indicator */
.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px #fff;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}
</style>

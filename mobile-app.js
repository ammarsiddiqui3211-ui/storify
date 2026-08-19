/**
 * Storify Marketplace - Mobile Native Integration & Responsive Support
 * Handles Capacitor native device features (Status bar, Hardware Back Button, Safe Area)
 * with graceful web fallbacks.
 */

(function () {
  'use strict';

  // Check if running inside Capacitor Native Container
  const isCapacitorNative = () => {
    return window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();
  };

  // Initialize Native Features
  async function initNativeApp() {
    if (!isCapacitorNative()) {
      console.log('[Storify App] Running in Web Browser mode.');
      return;
    }

    console.log('[Storify App] Running in Capacitor Native Android mode.');

    // 1. Configure Native Status Bar
    if (window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar) {
      try {
        const StatusBar = window.Capacitor.Plugins.StatusBar;
        await StatusBar.setBackgroundColor({ color: '#1a1a2e' });
        await StatusBar.setStyle({ style: 'DARK' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (err) {
        console.warn('[Storify App] StatusBar config warning:', err);
      }
    }

    // 2. Handle Android Hardware Back Button
    if (window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      const App = window.Capacitor.Plugins.App;
      App.addListener('backButton', (data) => {
        // Check if modal or search panel is open
        const searchFilterPanel = document.querySelector('.search-filter-panel.open');
        if (searchFilterPanel) {
          searchFilterPanel.classList.remove('open');
          return;
        }

        const openModal = document.querySelector('.modal[style*="display: block"], .modal.active, .drawer.open');
        if (openModal) {
          openModal.style.display = 'none';
          openModal.classList.remove('active', 'open');
          return;
        }

        // Check window navigation history
        if (window.history.length > 1 && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
          window.history.back();
        } else {
          // If on home root, minimize or exit app
          App.minimizeApp();
        }
      });
    }
  }

  // Mobile Bottom Navigation Bar Active State Sync
  function initMobileBottomNav() {
    const bottomNavItems = document.querySelectorAll('.mobile-bottom-nav-item');
    if (!bottomNavItems.length) return;

    const currentPath = window.location.pathname.toLowerCase();
    
    bottomNavItems.forEach((item) => {
      const targetPage = item.getAttribute('data-page');
      if (targetPage === 'home' && (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/'))) {
        item.classList.add('active');
      } else if (targetPage === 'seller' && currentPath.includes('seller.html')) {
        item.classList.add('active');
      } else if (targetPage === 'admin' && currentPath.includes('admin.html')) {
        item.classList.add('active');
      }
    });
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initNativeApp();
      initMobileBottomNav();
    });
  } else {
    initNativeApp();
    initMobileBottomNav();
  }
})();

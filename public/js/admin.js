/* Real Motors — Admin JS */

// Sidebar toggle
const sidebarToggle = document.getElementById('sidebarToggle');
const adminSidebar = document.getElementById('adminSidebar');
if (sidebarToggle && adminSidebar) {
  sidebarToggle.addEventListener('click', () => {
    adminSidebar.classList.toggle('open');
  });
}

// Auto-dismiss alerts
document.querySelectorAll('.admin-alert').forEach(alert => {
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-10px)';
    alert.style.transition = 'all 0.4s ease';
    setTimeout(() => alert.remove(), 400);
  }, 5000);
});

// Animate stat bars
document.querySelectorAll('.summary-bar-fill').forEach(bar => {
  const width = bar.style.width;
  bar.style.width = '0';
  setTimeout(() => { bar.style.width = width; }, 200);
});

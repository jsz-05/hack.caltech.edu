function openUpdatesModal() {
    document.getElementById('updates-modal').style.display = 'block';
  }
  
  function closeUpdatesModal() {
    document.getElementById('updates-modal').style.display = 'none';
  }
  
  // Close modal when clicking outside
  window.onclick = function(event) {
    if (event.target == document.getElementById('updates-modal')) {
      closeUpdatesModal();
    }
    if (event.target == document.getElementById('application-modal')) {
      closeModal();
    }
  }
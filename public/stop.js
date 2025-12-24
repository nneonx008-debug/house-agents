


  // Create loading screen
  const loadingScreen = document.createElement('div');
  loadingScreen.id = 'loading-screen';
  loadingScreen.innerHTML = `
    <div class="loader">
     
    </div>
  `;

  // Add styles dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    #loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #ffffff54;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.5s ease, visibility 0.5s ease;
    }
    #loading-screen.hide {
      opacity: 0;
      visibility: hidden;
    }
    .loader p {
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }
  `;
  document.head.appendChild(style);

  // Append loading screen to body
  document.body.appendChild(loadingScreen);

  // Remove loading screen after page fully loads
  window.addEventListener('load', () => {
    loadingScreen.classList.add('hide');
    // Optional: remove it from DOM after fade out
    setTimeout(() => loadingScreen.remove(), 100);
  });

document.querySelector("form").addEventListener("submit", function () {
    priceInput.value = priceInput.value.replace(/,/g, "");
});
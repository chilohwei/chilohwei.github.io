/**
 * Modern JavaScript for blog functionality
 * Enhanced for better performance and compatibility
 */

document.addEventListener("DOMContentLoaded", function () {
  // Use modern feature detection instead of user agent sniffing
  if (!hasPointerDevice() || window.innerWidth < 768) {
    return;
  }
  let beforeScrollTop = document.documentElement.scrollTop;
  let ticking = false;
  
  function updateHeader() {
    const afterScrollTop = document.documentElement.scrollTop;
    const delta = afterScrollTop - beforeScrollTop;
    const header = document.getElementById("J_header");
    
    if (header) {
      header.className = (delta > 0 && afterScrollTop > 0) ? 
        'header-menu header-menu-overflow' : 
        'header-menu';
    }
    
    beforeScrollTop = afterScrollTop;
    ticking = false;
  }
  
  document.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  const width = window.innerWidth;
  const height = 260;

  const canvas = document.getElementById('J_firework_canvas');
  if (!canvas) return;
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const points = [];
  const mouse = { x: 0, y: 9999 };

  function Point(x, y, speed, width, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.color = color;
    this.alpha = Math.random() - 0.1;
    this.speed = speed;

    this.active = true;

    this.physx = function () {
      this.y += this.speed;
      if (this.y > canvas.height) this.kill();
    };

    this.kill = function () {
      points.splice(points.indexOf(this), 1);
      this.active = false;
    };

    this.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2, true);
      ctx.fillStyle = this.color;
      ctx.lineWidth = this.width;

      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.restore();
    };
  };

  function drawFirework() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add new particles
    for (let i = 0; i < 5; i++) {
      const posX = mouse.x + Math.random() * 10;
      const posY = mouse.y + Math.random() * 10;
      points.push(new Point(posX, posY, 1 + Math.random() * 2, 5, 'white'));
    }

    // Update and draw existing particles
    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i];
      if (point.active) {
        point.draw();
        point.physx();
      } else {
        points.splice(i, 1);
      }
    }
    
    requestAnimationFrame(drawFirework);
  }

  drawFirework();

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  }, { passive: true });
  
  document.addEventListener('mouseleave', () => {
    mouse.x = 0;
    mouse.y = 9999;
  });


  // QR Code generation
  const qrTextEl = document.getElementById('J_qr_text');
  const isShowQr = qrTextEl && qrTextEl.offsetParent;
  
  if (isShowQr) {
    loadScript('https://gw.alipayobjects.com/os/k/qa/qrcode.min.js')
      .then(() => {
        if (window.QRCode) {
          const qrContainer = document.getElementById("J_qr_code");
          if (qrContainer) {
            new QRCode(qrContainer, {
              width: 128,
              height: 128,
              useSVG: true,
              text: window.location.href,
              correctLevel: QRCode.CorrectLevel.L
            });
          }
        }
      })
      .catch(console.error);
  }

  // Image zoom functionality
  const zoomImgs = document.querySelectorAll('.entry-content img');
  if (zoomImgs.length > 0) {
    loadScript("https://gw.alipayobjects.com/os/k/x5/intense.min.js")
      .then(() => {
        if (window.Intense) {
          Intense(zoomImgs);
        }
      })
      .catch(console.error);
  }
}, false);


// Modern feature detection instead of user agent sniffing
function hasPointerDevice() {
  return window.matchMedia && window.matchMedia('(pointer: fine)').matches;
}

// Modern script loading with Promise support
function loadScript(url) {
  return new Promise((resolve, reject) => {
    // Check if script already loaded
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    
    document.head.appendChild(script);
  });
}

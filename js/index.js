/**
 * Modern JavaScript for blog functionality
 * Enhanced for better performance and compatibility
 */
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

document.addEventListener("DOMContentLoaded", function () {
  // Image zoom functionality with enhanced styling
  var zoomImgs = document.querySelectorAll('.entry-content img');
  if (zoomImgs && zoomImgs.length > 0) {
    // Add image captions from alt text
    zoomImgs.forEach(function(img) {
      var alt = img.getAttribute('alt');
      var parent = img.parentElement;
      
      // Skip if already in a figure, is a link, or no alt text
      if (!alt || parent.tagName === 'FIGURE' || parent.tagName === 'A') return;
      // Skip QR code images
      if (alt.toLowerCase().includes('qr code')) return;
      
      // Create figure wrapper with caption
      var figure = document.createElement('figure');
      figure.className = 'image-figure';
      
      var figcaption = document.createElement('figcaption');
      figcaption.textContent = alt;
      
      // If parent is a P tag containing only the image, replace the P
      if (parent.tagName === 'P' && parent.childNodes.length === 1) {
        parent.parentNode.insertBefore(figure, parent);
        figure.appendChild(img);
        figure.appendChild(figcaption);
        parent.parentNode.removeChild(parent);
      } else {
        // Otherwise just wrap the image
        parent.insertBefore(figure, img);
        figure.appendChild(img);
        figure.appendChild(figcaption);
      }
    });
    
    // Re-query images after DOM manipulation
    zoomImgs = document.querySelectorAll('.entry-content img');
    
    // Initialize Lightense with dark background
    loadScript("https://gw.alipayobjects.com/os/k/s3/lightense.min.js", function () {
      Lightense && Lightense(zoomImgs, {
        background: 'rgba(0, 0, 0, 0.9)',
        padding: 40,
        offset: 40,
      });
    });
  }

  // Code block enhancements
  initCodeBlocks();

  // Link preview cards
  initLinkPreviews();

  if (!isPC()) {
    return;
  }
  var beforeScrollTop = document.documentElement.scrollTop;
  document.addEventListener("scroll", function () {
    var afterScrollTop = document.documentElement.scrollTop;
    var delta = afterScrollTop - beforeScrollTop;
    document.getElementById("J_header").setAttribute('class', (delta > 0 && afterScrollTop > 0) ? 'header-menu header-menu-overflow' : 'header-menu');
    beforeScrollTop = afterScrollTop;
  }, { passive: true });

  var width = window.innerWidth;
  var height = 260;

  var canvas = document.getElementById('J_firework_canvas');
  if (!canvas) return; // Guard against missing canvas

  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d', { alpha: true });

  var points = [];
  var isAnimating = true;

  var mouse = {
    x: 0,
    y: 9999,
  };

  // Pause animation when canvas is not visible
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        isAnimating = entry.isIntersecting;
      });
    }, { threshold: 0 });
    observer.observe(canvas);
  }

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
    if (!isAnimating) {
      requestAnimationFrame(drawFirework);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only create new points if mouse is in active area
    if (mouse.y < height) {
      for (var i = 0; i < 5; i++) {
        var posX = mouse.x + Math.random() * 10;
        var posY = mouse.y + Math.random() * 10;
        points.push(new Point(posX, posY, 1 + Math.random() * 2, 5, 'white'));
      }
    }

    for (var i in points) {
      if (points[i].active) {
        points[i].draw();
        points[i].physx();
      }
    }
    requestAnimationFrame(drawFirework);
  }

  // Check for prefers-reduced-motion
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    drawFirework();
  }

  document.onmousemove = function (e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  }
  document.onmouseout = function (e) {
    mouse.x = 0;
    mouse.y = 9999;
  }


  var qrTextEl = document.getElementById('J_qr_text');
  var isShowQr = qrTextEl && qrTextEl.offsetParent;
  isShowQr && loadScript('https://gw.alipayobjects.com/os/k/qa/qrcode.min.js', function () {
    QRCode && new QRCode(document.getElementById("J_qr_code"), {
      width: 128,
      height: 128,
      useSVG: true,
      text: window.location.href,
      correctLevel: QRCode.CorrectLevel.L
    });
  });

}, false);

function isPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone", "Windows Phone", "iPad", "iPod"];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

function loadScript(url, callback) {
  var script = document.createElement("script")
  script.type = "text/javascript";
  if (script.readyState) {
    script.onreadystatechange = function () {
      if (script.readyState == "loaded" ||
        script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    script.onload = function () {
      callback();
    };
  }
  script.src = url;
  document.body.appendChild(script);
}

// Code block enhancements: language labels and copy buttons
function initCodeBlocks() {
  // Jekyll generates: <div class="language-xxx highlighter-rouge"><div class="highlight">...</div></div>
  var wrappers = document.querySelectorAll('.highlighter-rouge');
  
  wrappers.forEach(function(wrapper) {
    var block = wrapper.querySelector('.highlight');
    if (!block) return;
    
    // Get language from wrapper class (language-xxx)
    var lang = '';
    var classes = wrapper.className.split(' ');
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].indexOf('language-') === 0) {
        lang = classes[i].replace('language-', '');
        break;
      }
    }
    
    // Create language label element (only if language exists)
    if (lang) {
      var langLabel = document.createElement('span');
      langLabel.className = 'code-lang';
      langLabel.textContent = lang;
      block.insertBefore(langLabel, block.firstChild);
    }
    
    // Trim leading/trailing empty lines from code
    var codeEl = block.querySelector('pre code');
    if (codeEl) {
      var html = codeEl.innerHTML;
      // Remove leading empty lines (including lines with only whitespace/spans)
      html = html.replace(/^(\s*<[^>]*>\s*)*\n/, '');
      // Remove trailing empty lines
      html = html.replace(/\n(\s*<[^>]*>\s*)*$/, '');
      codeEl.innerHTML = html;
    }
    
    // Enable wrap by default
    block.classList.add('wrap-enabled');
    
    // Create copy button
    var copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
    
    copyBtn.addEventListener('click', function() {
      var code = block.querySelector('pre');
      if (code) {
        var text = code.textContent || code.innerText;
        // Trim whitespace when copying
        text = text.trim();
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function() {
            showCopied(copyBtn);
          }).catch(function() {
            fallbackCopy(text, copyBtn);
          });
        } else {
          fallbackCopy(text, copyBtn);
        }
      }
    });
    
    block.appendChild(copyBtn);
  });
}

function showCopied(btn) {
  btn.textContent = 'Copied!';
  btn.classList.add('copied');
  setTimeout(function() {
    btn.textContent = 'Copy';
    btn.classList.remove('copied');
  }, 2000);
}

function fallbackCopy(text, btn) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showCopied(btn);
  } catch (e) {
    btn.textContent = 'Failed';
  }
  document.body.removeChild(textarea);
}

// Link Preview Cards: Convert standalone links to preview cards using Microlink API
function initLinkPreviews() {
  // Support multiple content containers across all pages
  var containers = document.querySelectorAll('.entry-content, .page-content, article.hentry > .entry-content');
  if (!containers.length) return;

  containers.forEach(function(content) {
    // Skip if this is a post list item (has parent with class header-href)
    if (content.closest('.header-href')) return;
    
    processLinksInContainer(content);
  });
}

function processLinksInContainer(content) {
  // Find all paragraphs that contain only a single link
  var paragraphs = content.querySelectorAll('p');
  
  paragraphs.forEach(function(p) {
    // Check if paragraph contains only a single link (and optional whitespace)
    var trimmedHTML = p.innerHTML.trim();
    var link = p.querySelector('a');
    
    if (!link) return;
    
    // Check if the paragraph only contains this link
    var linkHTML = link.outerHTML;
    if (trimmedHTML !== linkHTML) return;
    
    var url = link.href;
    var fallbackTitle = link.textContent || link.innerText;
    
    // Skip internal links and anchor links
    if (!url || url.startsWith('#') || url.startsWith('mailto:')) return;
    
    // Skip if it's a same-domain link (internal)
    try {
      var linkUrl = new URL(url);
      if (linkUrl.hostname === window.location.hostname) return;
    } catch (e) {
      return;
    }
    
    // Create placeholder card first (for instant feedback)
    var card = createLinkPreviewCard(url, fallbackTitle, null, null, null);
    p.parentNode.replaceChild(card, p);
    
    // Fetch rich preview data from Microlink API
    fetchLinkPreview(url, card, fallbackTitle);
  });
}

function fetchLinkPreview(url, card, fallbackTitle) {
  var apiUrl = 'https://api.microlink.io?url=' + encodeURIComponent(url);
  
  fetch(apiUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.status === 'success' && data.data) {
        var info = data.data;
        updateLinkPreviewCard(card, url, 
          info.title || fallbackTitle,
          info.description || '',
          info.image ? info.image.url : null,
          info.logo ? info.logo.url : null
        );
      }
    })
    .catch(function(error) {
      // Keep the fallback card on error
      console.warn('Link preview fetch failed:', error);
    });
}

function createLinkPreviewCard(url, title, description, imageUrl, logoUrl) {
  var card = document.createElement('a');
  card.href = url;
  card.className = 'link-preview';
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  
  // Extract domain info
  var domain = '';
  var favicon = '';
  try {
    var urlObj = new URL(url);
    domain = urlObj.hostname.replace('www.', '');
    favicon = logoUrl || 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=32';
    
    // Add special class for GitHub links
    if (domain === 'github.com' || domain.endsWith('.github.com')) {
      card.classList.add('link-preview-github');
    }
  } catch (e) {
    domain = url;
  }
  
  // Parse title to extract description if not provided
  var displayTitle = title;
  var displayDesc = description || '';
  
  if (!displayDesc) {
    // Common patterns: "Title - Description" or "Title: Description"
    var separators = [' - ', ': ', ' | '];
    for (var i = 0; i < separators.length; i++) {
      var idx = title.indexOf(separators[i]);
      if (idx > 0 && idx < title.length - separators[i].length) {
        displayTitle = title.substring(0, idx);
        displayDesc = title.substring(idx + separators[i].length);
        break;
      }
    }
  }
  
  // Build card HTML
  var html = '<div class="link-preview-content">';
  html += '<div class="link-preview-text">';
  html += '<div class="link-preview-title">' + escapeHtml(displayTitle) + '</div>';
  if (displayDesc) {
    html += '<div class="link-preview-description">' + escapeHtml(displayDesc) + '</div>';
  }
  html += '<div class="link-preview-meta">';
  html += '<img class="link-preview-favicon" src="' + escapeHtml(favicon) + '" alt="" onerror="this.style.display=\'none\'">';
  html += '<span class="link-preview-domain">' + escapeHtml(domain) + '</span>';
  html += '</div>';
  html += '</div>';
  
  // Add image if available
  if (imageUrl) {
    html += '<div class="link-preview-image" style="background-image: url(\'' + escapeHtml(imageUrl) + '\')"></div>';
  }
  
  html += '</div>';
  
  card.innerHTML = html;
  return card;
}

function updateLinkPreviewCard(card, url, title, description, imageUrl, logoUrl) {
  var domain = '';
  var favicon = '';
  try {
    var urlObj = new URL(url);
    domain = urlObj.hostname.replace('www.', '');
    favicon = logoUrl || 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=32';
  } catch (e) {
    domain = url;
  }
  
  // Build updated card HTML
  var html = '<div class="link-preview-content">';
  html += '<div class="link-preview-text">';
  html += '<div class="link-preview-title">' + escapeHtml(title) + '</div>';
  if (description) {
    html += '<div class="link-preview-description">' + escapeHtml(description) + '</div>';
  }
  html += '<div class="link-preview-meta">';
  html += '<img class="link-preview-favicon" src="' + escapeHtml(favicon) + '" alt="" onerror="this.style.display=\'none\'">';
  html += '<span class="link-preview-domain">' + escapeHtml(domain) + '</span>';
  html += '</div>';
  html += '</div>';
  
  // Add image if available
  if (imageUrl) {
    html += '<div class="link-preview-image" style="background-image: url(\'' + escapeHtml(imageUrl) + '\')"></div>';
  }
  
  html += '</div>';
  
  card.innerHTML = html;
}

function escapeHtml(text) {
  if (!text) return '';
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

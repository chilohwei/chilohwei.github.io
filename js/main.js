document.addEventListener("DOMContentLoaded", function () {
  // Optimize letter spacing with Heti
  if (typeof Heti !== 'undefined') {
    try {
      var heti = new Heti(".heti");
      heti.autoSpacing();
    } catch (error) {
      console.warn('Heti spacing failed:', error);
    }
  }

  // Open external links in new tab
  var links = document.links;
  for (var i = 0; i < links.length; i++) {
    if (
      links[i].hostname != window.location.hostname ||
      (links[i].href && links[i].href.indexOf("feed.xml") != -1)
    ) {
      links[i].target = "_blank";
    }
  }

  // Full screen button for embedded PPT iframes
  var fullscreenBtn = document.getElementById("fullscreenBtn");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", function () {
      var elem = document.getElementById("postIframe");
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // Prefetch links on hover for faster navigation
  var linksToPrefetch = document.querySelectorAll('.read-more, .header-href, .pagination a, .header-item a');
  var prefetchedLinks = {};
  var prefetchTimer;

  linksToPrefetch.forEach(function (link) {
    if (window.matchMedia('(hover: hover)').matches) {
      link.addEventListener('mouseenter', function () {
        clearTimeout(prefetchTimer);
        prefetchTimer = setTimeout(function () {
          if (!prefetchedLinks[link.href]) {
            var prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = link.href;
            prefetchLink.as = 'document';
            document.head.appendChild(prefetchLink);
            prefetchedLinks[link.href] = true;
          }
        }, 100);
      });
    }
  });
});

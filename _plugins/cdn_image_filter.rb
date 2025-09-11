# Enhanced image optimization filter for multiple CDN providers
# Supports WebP format, lazy loading, and responsive images
# Usage: {{ content | cdn_image_filter }}
module Jekyll
  module CDNImageFilter
    def cdn_image_filter(input)
      # Enhanced regex to capture more image attributes
      input.gsub(/<img([^>]*?)src="([^"]+)"([^>]*?)>/i) do |match|
        pre_attrs = $1
        src = $2
        post_attrs = $3
        
        # Skip if already optimized or is SVG/GIF
        next match if src.include?('x-oss-process') || src.match?(/\.(gif|svg)$/i)
        
        # Determine optimization based on CDN provider
        optimized_src = optimize_image_url(src)
        
        # Add responsive and performance attributes
        enhanced_attrs = enhance_image_attributes(pre_attrs + post_attrs)
        
        # Construct optimized img tag
        "<img#{enhanced_attrs}src=\"#{optimized_src}\">"
      end
    end

    private

    def optimize_image_url(src)
      case src
      when /^https:\/\/(cdn\.fliggy\.com|gw\.alipayobjects\.com)/
        # Alibaba Cloud OSS optimization
        "#{src}?x-oss-process=image/resize,w_1200/format,webp/quality,q_85"
      when /^https:\/\/chilohdata\.s3\.bitiful\.net/
        # S3-compatible storage optimization (add WebP if supported)
        src # Keep original for now, could add CloudFront transformations
      when /^https:\/\/(images\.unsplash\.com|cdn\.pixabay\.com)/
        # Third-party image services
        "#{src}&w=1200&q=85&fm=webp&fit=max"
      else
        src # Return original if no optimization available
      end
    end

    def enhance_image_attributes(attrs)
      # Parse existing attributes
      attr_hash = {}
      attrs.scan(/(\w+)=["']([^"']*?)["']/i) do |key, value|
        attr_hash[key.downcase] = value
      end
      
      # Add performance attributes if not present
      attr_hash['loading'] ||= 'lazy'
      attr_hash['decoding'] ||= 'async'
      
      # Add responsive behavior if width/height not specified
      unless attr_hash['width'] || attr_hash['height'] || attr_hash['style']&.include?('width')
        attr_hash['style'] = "#{attr_hash['style']}; max-width: 100%; height: auto;".strip.sub(/^;/, '')
      end
      
      # Convert back to attribute string
      attrs_str = attr_hash.map { |k, v| "#{k}=\"#{v}\"" }.join(' ')
      attrs_str.empty? ? '' : " #{attrs_str} "
    end
  end
end

Liquid::Template.register_filter(Jekyll::CDNImageFilter)

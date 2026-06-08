require 'cgi'

# Enhanced media optimization filter for selected media providers
# Supports WebP format, lazy loading, responsive images, and video optimization
# Usage: {{ content | cdn_image_filter }}
module Jekyll
  module CDNImageFilter
    CLOUDFLARE_WIDTHS = [480, 800, 1200, 1600].freeze
    DEFAULT_SIZES = '(max-width: 768px) 92vw, 760px'.freeze
    RASTER_IMAGE_EXTENSIONS = /\.(avif|jpe?g|png|webp)(?:[?#].*)?$/i.freeze
    SKIP_IMAGE_EXTENSIONS = /\.(gif|svg|ico)(?:[?#].*)?$/i.freeze
    R2_ASSET_VERSION = '20260608-2'.freeze

    def cdn_image_filter(input)
      image_index = 0

      # Optimize images
      output = input.gsub(/<img([^>]*?)src="([^"]+)"([^>]*?)>/i) do |match|
        pre_attrs = $1
        src = $2
        post_attrs = $3

        # Skip URLs already transformed upstream.
        next match if src.include?('/cdn-cgi/image/') || src.include?('x-oss-process')

        attrs = parse_attributes(pre_attrs + post_attrs)
        optimized_src = optimize_image_url(src)
        apply_responsive_image_attributes(attrs, src)
        apply_dimension_attributes(attrs, src)
        apply_loading_attributes(attrs, image_index)
        apply_r2_request_attributes(attrs, src)
        enhanced_attrs = enhance_image_attributes(attrs)
        image_index += 1

        # Construct optimized img tag
        "<img#{enhanced_attrs}src=\"#{optimized_src}\">"
      end

      # Optimize videos: add preload="metadata" to avoid downloading full file on page load
      output.gsub(/<video([^>]*)>/i) do |match|
        attrs = $1
        next match if attrs.include?('preload')
        "<video#{attrs} preload=\"metadata\">"
      end
    end

    private

    def optimize_image_url(src)
      case src
      when /^https:\/\/(cdn\.fliggy\.com|gw\.alipayobjects\.com)/
        # Alibaba Cloud OSS optimization with AVIF support
        # AVIF provides better compression than WebP
        "#{src}?x-oss-process=image/resize,w_1200/format,avif/quality,q_80"
      when /^https:\/\/files\.chiloh\.net/
        if cloudflare_resizable_image?(src)
          cloudflare_image_url(src, 1200)
        else
          append_query_param(src, 'v', R2_ASSET_VERSION)
        end
      when /^https:\/\/(images\.unsplash\.com|cdn\.pixabay\.com)/
        # Third-party image services
        # Try AVIF first, fallback to WebP in browser
        "#{src}&w=1200&q=85&fm=avif&fit=max"
      else
        src # Return original if no optimization available
      end
    end

    def cloudflare_resizable_image?(src)
      src.start_with?('https://files.chiloh.net/') && src.match?(RASTER_IMAGE_EXTENSIONS)
    end

    def cloudflare_image_url(src, width)
      raw_path = src.sub(%r{\Ahttps://files\.chiloh\.net/+}, '').split(/[?#]/, 2).first
      encoded_path = raw_path.split('/').map { |part| CGI.escape(CGI.unescape(part)).gsub('+', '%20') }.join('/')
      "https://files.chiloh.net/cdn-cgi/image/width=#{width}%2Cquality=78%2Cformat=auto/#{encoded_path}?v=#{R2_ASSET_VERSION}"
    end

    def apply_responsive_image_attributes(attrs, src)
      return unless cloudflare_resizable_image?(src)

      attrs['srcset'] = CLOUDFLARE_WIDTHS
        .map { |width| "#{cloudflare_image_url(src, width)} #{width}w" }
        .join(', ')
      attrs['sizes'] ||= DEFAULT_SIZES
    end

    def apply_dimension_attributes(attrs, src)
      return if attrs['width'] && attrs['height']

      dimensions = image_dimensions_for(src)
      return unless dimensions

      attrs['width'] ||= dimensions['width'].to_s
      attrs['height'] ||= dimensions['height'].to_s
    end

    def apply_loading_attributes(attrs, image_index)
      if image_index.zero?
        attrs['loading'] ||= 'eager'
        attrs['fetchpriority'] ||= 'high'
      else
        attrs['loading'] ||= 'lazy'
      end
      attrs['decoding'] ||= 'async'
    end

    def apply_r2_request_attributes(attrs, src)
      return unless src.start_with?('https://files.chiloh.net/')

      attrs['referrerpolicy'] ||= 'no-referrer'
    end

    def image_dimensions_for(src)
      return unless src.start_with?('https://files.chiloh.net/')

      site = @context&.registers&.fetch(:site, nil)
      dimensions = site&.data&.fetch('image_dimensions', nil)
      return unless dimensions

      key = CGI.unescape(src.sub(%r{\Ahttps://files\.chiloh\.net/+}, ''))
      dimensions[key]
    end

    def parse_attributes(attrs)
      attr_hash = {}
      attrs.scan(/([\w:-]+)=["']([^"']*?)["']/i) do |key, value|
        attr_hash[key.downcase] = value
      end

      attr_hash
    end

    def append_query_param(src, key, value)
      separator = src.include?('?') ? '&' : '?'
      "#{src}#{separator}#{key}=#{value}"
    end

    def enhance_image_attributes(attr_hash)
      # Add responsive behavior unless an explicit width style already exists.
      unless attr_hash['style']&.include?('width')
        attr_hash['style'] = "#{attr_hash['style']}; max-width: 100%; height: auto;".strip.sub(/^;/, '').strip
      end

      # Convert back to attribute string
      attrs_str = attr_hash.map { |k, v| "#{k}=\"#{v}\"" }.join(' ')
      attrs_str.empty? ? '' : " #{attrs_str} "
    end
  end
end

Liquid::Template.register_filter(Jekyll::CDNImageFilter)

require 'jekyll'

module Jekyll
  module Paginate
    module Tags

      class TagPage < Jekyll::Page
        # Attributes for Liquid templates
        ATTRIBUTES_FOR_LIQUID = %w(
          tag
          content
          dir
          name
          path
          url
        )

        # Initialize a new Page.
        #
        # site - The Site object.
        # base - The String path to the source.
        # dir  - The String path between the source and the file.
        # name - The String filename of the file.
        # tag - The String tag
        def initialize(site, base, tag)
          layout = site.config['paginate_tag_layout'] || 'tags.html'
          super(site, base, '_layouts', layout)
          process('index.html')

          # Get the tag into layout using page.tag
          @tag = tag
        end

        # Produce a tag object suitable for Liquid.
        #
        # Returns a String
        def tag
          if @tag.is_a? String
            @tag
          end
        end
      end

      class Pager < Jekyll::Paginate::Pager
        # Update paginator.previous_page_path and next_page_path to add tag path
        #
        # site            - the Jekyll::Site object
        # tag_path   - tag path, eg /tag/web/
        #
        # Returns nothing.
        def update_paginate_paths(site, tag_path)
          if @page > 1
            @previous_page_path = tag_path.sub(/(\/)+$/,'') + @previous_page_path
          end
          if @page < @total_pages
            @next_page_path = tag_path.sub(/(\/)+$/,'') + @next_page_path
          end
        end

        # Static: Return the pagination path of the page
        #
        # site     - the Jekyll::Site object
        # num_page - the pagination page number
        # paginate_path - the explicit paginate path, if provided
        #
        # Returns the pagination path as a string
        def self.paginate_path_tag(site, num_page, tag_path, paginate_path = site.config['paginate_path'])
          return nil if num_page.nil?
          return tag_path if num_page <= 1
          format = tag_path.sub(/(\/)+$/,'') + paginate_path
          format = format.sub(':num', num_page.to_s)
          ensure_leading_slash(format)
        end
      end

      # Per-tag pagination.
      # Based on jekyll-paginate.
      #
      # paginate_tag_basepath: tag base path - eg, /tag/:name/
      # paginate_path: will be concatenated with paginate_tag - eg /page/:num/
      # paginate_tag_layout: The layout name of the tag layout (default: tags.html)
      class TagPagination < Generator
        safe true

        # Generate paginated pages if necessary.
        #
        # Tags whose names differ only in case or in characters that the slug
        # function strips (e.g. "ctf" and "CTF", "WebAssembly" and "webassembly")
        # are merged onto a single page — otherwise both generate to the same
        # /tag/<slug>/ path and one silently overwrites the other, dropping the
        # posts of the losing tag from the archive.
        #
        # site - The Site.
        #
        # Returns nothing.
        def generate(site)
          return unless site.config['paginate_tag_basepath']

          tags_payload = site.site_payload['site']['tags']
          groups = {}

          tags_payload.each do |tag_name, posts|
            slug = slugify_tag(tag_name)
            next if slug.empty?
            bucket = (groups[slug] ||= { names: [], posts: [] })
            bucket[:names] << tag_name
            bucket[:posts].concat(posts)
          end

          groups.each do |slug, bucket|
            paginate_tag(site, canonical_name(bucket[:names]), slug, dedup(bucket[:posts]))
          end
        end

        # Do the blog's posts pagination per tag. Renders the index.html file into paginated
        # directories (see paginate_tag_basepath and paginate_path config) for these tags,
        # e.g.: /tags/my-tag/page2/index.html, /tags/my-tag/page3/index.html, etc.
        #
        # site      - The Site.
        # tag       - Display name to expose to the layout as `page.tag`.
        # slug      - URL slug, used to build the output directory.
        # all_posts - Ordered list of post payloads to paginate.
        #
        # Returns nothing.
        def paginate_tag(site, tag, slug, all_posts)
          # Tag base path
          tag_path = site.config['paginate_tag_basepath'].sub(':name', slug)

          # Count pages
          nb_pages = Pager.calculate_pages(all_posts, site.config['paginate'].to_i)

          # Create pages
          (1..nb_pages).each do |current_num_page|
            # Split posts into pages
            pager = Pager.new(site, current_num_page, all_posts, nb_pages)
            pager.update_paginate_paths(site, tag_path)

            # Create new page, based on tag layout
            newpage = TagPage.new(site, site.source, tag)
            newpage.pager = pager
            newpage.dir = Pager.paginate_path_tag(site, current_num_page, tag_path)
            site.pages << newpage
          end
        end

        private

        # Slugify a tag name the same way URLs are built. Must stay in sync
        # with the default Jekyll `slugify` Liquid filter used in the
        # pagination partials so generated paths and rendered links match.
        def slugify_tag(tag)
          tag.to_s.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
        end

        # Pick a canonical display name for a group of colliding tag strings.
        # Preference order: exact all-lowercase variant (matches the URL slug
        # visually), otherwise the first name encountered.
        def canonical_name(names)
          names.find { |n| n == n.downcase } || names.first
        end

        # Remove duplicate post payloads (a post tagged with both "CTF" and
        # "ctf" would otherwise appear twice on the merged page), then sort
        # newest-first to preserve archive ordering.
        def dedup(posts)
          seen = {}
          unique = posts.reject do |post|
            key = post['url'] || post.object_id
            if seen[key]
              true
            else
              seen[key] = true
              false
            end
          end
          unique.sort_by { |post| post['date'] || Time.at(0) }.reverse
        end
      end

    end
  end
end

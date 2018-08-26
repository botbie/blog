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
        # site - The Site.
        #
        # Returns nothing.
        def generate(site)
          if site.config['paginate_tag_basepath']
            for tag in site.tags.keys
              paginate_tag(site, tag)
            end
          end
        end

        # Do the blog's posts pagination per tag. Renders the index.html file into paginated
        # directories (see paginate_tag_basepath and paginate_path config) for these tags,
        # e.g.: /tags/my-tag/page2/index.html, /tags/my-tag/page3/index.html, etc.
        #
        # site     - The Site.
        # tag - The tag to paginate.
        #
        # Returns nothing.
        def paginate_tag(site, tag)
          # Retrieve posts from that specific tag.
          all_posts = site.site_payload['site']['tags'][tag]

          # Tag base path
          tag_path = site.config['paginate_tag_basepath']
          tag_path = tag_path.sub(':name', tag.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, ''))

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
      end

    end
  end
end

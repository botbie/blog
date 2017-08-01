require 'jekyll'

module Jekyll
  module Paginate
    module Tags

      # Internal requires
      autoload :TagPage, 'jekyll-paginate-tags/tag-page'
      autoload :Pager, 'jekyll-paginate-tags/pager'

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

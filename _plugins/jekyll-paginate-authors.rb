require 'jekyll'

module Jekyll
  module Paginate
    module Authors

      class AuthorPage < Jekyll::Page
        # Attributes for Liquid templates
        ATTRIBUTES_FOR_LIQUID = %w(
          author
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
        # author - The String author
        def initialize(site, base, author)
          layout = site.config['paginate_author_layout'] || 'author.html'
          super(site, base, '_layouts', layout)
          process('index.html')

          # Get the author into layout using page.author
          @author = author
        end

        # Produce a author object suitable for Liquid.
        #
        # Returns a String
        def author
          if @author.is_a? String
            @author
          end
        end
      end

      class Pager < Jekyll::Paginate::Pager
        # Update paginator.previous_page_path and next_page_path to add author path
        #
        # site            - the Jekyll::Site object
        # author_path   - author path, eg /author/web/
        #
        # Returns nothing.
        def update_paginate_paths(site, author_path)
          if @page > 1
            @previous_page_path = author_path.sub(/(\/)+$/,'') + @previous_page_path
          end
          if @page < @total_pages
            @next_page_path = author_path.sub(/(\/)+$/,'') + @next_page_path
          end
        end

        # Static: Return the pagination path of the page
        #
        # site     - the Jekyll::Site object
        # num_page - the pagination page number
        # paginate_path - the explicit paginate path, if provided
        #
        # Returns the pagination path as a string
        def self.paginate_path_author(site, num_page, author_path, paginate_path = site.config['paginate_path'])
          return nil if num_page.nil?
          return author_path if num_page <= 1
          format = author_path.sub(/(\/)+$/,'') + paginate_path
          format = format.sub(':num', num_page.to_s)
          ensure_leading_slash(format)
        end
      end

      # Per-author pagination.
      # Based on jekyll-paginate.
      #
      # paginate_author_basepath: author base path - eg, /author/:name/
      # paginate_path: will be concatenated with paginate_author - eg /page/:num/
      # paginate_author_layout: The layout name of the author layout (default: authors.html)
      class AuthorPagination < Generator
        safe true

        # Generate paginated pages if necessary.
        #
        # site - The Site.
        #
        # Returns nothing.
        def generate(site)
          if site.config['paginate_author_basepath']
            for username in site.data['authors'].keys
              author = site.data['authors'][username]
              paginate_author(site, author)
            end
          end
        end

        # Do the blog's posts pagination per author. Renders the index.html file into paginated
        # directories (see paginate_author_basepath and paginate_path config) for these authors,
        # e.g.: /authors/my-author/page2/index.html, /authors/my-author/page3/index.html, etc.
        #
        # site     - The Site.
        # author - The author to paginate.
        #
        # Returns nothing.
        def paginate_author(site, author)
          # Retrieve posts from that specific author.
          all_posts = site.site_payload['site']['posts'].select do |post|
            post['author'] == author['username']
          end

          # Author base path
          author_path = site.config['paginate_author_basepath']
          author_path = author_path.sub(':name', author['username'].downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, ''))

          # Count pages
          nb_pages = Pager.calculate_pages(all_posts, site.config['paginate'].to_i)

          # Create pages
          (1..nb_pages).each do |current_num_page|
            # Split posts into pages
            pager = Pager.new(site, current_num_page, all_posts, nb_pages)
            pager.update_paginate_paths(site, author_path)

            # Create new page, based on author layout
            newpage = AuthorPage.new(site, site.source, author['username'])
            newpage.pager = pager
            newpage.dir = Pager.paginate_path_author(site, current_num_page, author_path)
            site.pages << newpage
          end
        end
      end

    end
  end
end

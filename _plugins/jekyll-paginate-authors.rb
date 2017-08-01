require 'jekyll'

module Jekyll
  module Paginate
    module Authors

      # Internal requires
      autoload :AuthorPage, 'jekyll-paginate-author/author-page'
      autoload :Pager, 'jekyll-paginate-author/pager'

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

require 'jekyll'

module Jekyll
  module Paginate
    module Categories

      # Internal requires
      autoload :CategoryPage, 'jekyll-paginate-category/category-page'
      autoload :Pager, 'jekyll-paginate-category/pager'

      # Per-category pagination.
      # Based on jekyll-paginate.
      #
      # paginate_category_basepath: category base path - eg, /category/:name/
      # paginate_path: will be concatenated with paginate_category - eg /page/:num/
      # paginate_category_layout: The layout name of the category layout (default: categories.html)
      class CategoryPagination < Generator
        safe true

        # Generate paginated pages if necessary.
        #
        # site - The Site.
        #
        # Returns nothing.
        def generate(site)
          if site.config['paginate_category_basepath']
            for category in site.categories.keys
              paginate_category(site, category)
            end
          end
        end

        # Do the blog's posts pagination per category. Renders the index.html file into paginated
        # directories (see paginate_category_basepath and paginate_path config) for these categories,
        # e.g.: /categories/my-category/page2/index.html, /categories/my-category/page3/index.html, etc.
        #
        # site     - The Site.
        # category - The category to paginate.
        #
        # Returns nothing.
        def paginate_category(site, category)
          # Retrieve posts from that specific category.
          all_posts = site.site_payload['site']['categories'][category]

          # Category base path
          category_path = site.config['paginate_category_basepath']
          category_path = category_path.sub(':name', category.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, ''))

          # Count pages
          nb_pages = Pager.calculate_pages(all_posts, site.config['paginate'].to_i)

          # Create pages
          (1..nb_pages).each do |current_num_page|
            # Split posts into pages
            pager = Pager.new(site, current_num_page, all_posts, nb_pages)
            pager.update_paginate_paths(site, category_path)

            # Create new page, based on category layout
            newpage = CategoryPage.new(site, site.source, category)
            newpage.pager = pager
            newpage.dir = Pager.paginate_path_category(site, current_num_page, category_path)
            site.pages << newpage
          end
        end
      end

    end
  end
end

module Jekyll
  module Paginate
    module Categories

      class CategoryPage < Jekyll::Page
        # Attributes for Liquid templates
        ATTRIBUTES_FOR_LIQUID = %w(
          category
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
        # category - The String category
        def initialize(site, base, category)
          layout = site.config['paginate_category_layout'] || 'category.html'
          super(site, base, '_layouts', layout)
          process('index.html')

          # Get the category into layout using page.category
          @category = category
        end

        # Produce a category object suitable for Liquid.
        #
        # Returns a String
        def category
          if @category.is_a? String
            @category
          end
        end
      end

    end
  end
end

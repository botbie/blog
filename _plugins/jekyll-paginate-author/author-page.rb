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

    end
  end
end

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

    end
  end
end

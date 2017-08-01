module Jekyll
  module Paginate
    module Tags

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

    end
  end
end

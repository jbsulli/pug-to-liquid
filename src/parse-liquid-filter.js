"use strict";

module.exports = parseLiquidFilter;

const FILTERS = /^(join|first|last|concat|index|map|reverse|size|sort|uniq|color_to_rgb|color_to_hsl|color_extract|color_brightness|color_modify|color_lighten|color_darken|color_saturate|color_desaturate|color_mix|img_tag|script_tag|stylesheet_tag|abs|ceil|divided_by|floor|minus|plus|round|times|modulo|money_with_currency|money_without_trailing_zeros|money_without_currency|money|append|camelcase|capitalize|downcase|escape|handleize|handle|md5|sha256|hmac_sha1|hmac_sha256|newline_to_br|pluralize|prepend|remove_first|remove|replace_first|replace|slice|split|lstrip|rstrip|strip_html|strip_newlines|strip|truncatewords|truncate|upcase|url_encode|url_escape|url_param_escape|asset_url|asset_img_url|file_url|file_img_url|customer_login_link|global_asset_url|img_url|link_to_vendor|link_to_type|link_to_tag|link_to_add_tag|link_to_remove_tag|link_to|payment_type_img_url|payment_type_img_url|product_img_url|collection_img_url|shopify_asset_url|url_for_type|url_for_vendor|within|date|time_tag|default_errors|default_pagination|default|format_address|hex_to_rgba|highlight|highlight_active_tag|json|weight_with_unit|placeholder_svg_tag|format_code|delete_customer_address_link|t)(?:\s*:\s*(.*)|(.*))/;

function parseLiquidFilter(filter){
    var match = filter.data.match(FILTERS);
    
    if(!match){
        throw new Error('Invalid filter');
    }
    
    filter.name = match[1];
    
    if(match[2]){
        filter.data = match[2];
    } else {
        if(match[3]){
            throw new Error('Unexpected filter content [' + match[3] + ']');
        }
        delete filter.data;
    }
    
    if(filter.name in filters){
        filters[filter.name](filter);
        return filter;
    }
    else if(filter.data){
        //throw new Error('Unexpected filter content');
    }
    
    return filter;
}

const filters = {
    append: function(filter){
        if(!filter.data){
            throw new Error('Append filter requires a append value');
        }
    },
    prepend: function(filter){
        if(!filter.data){
            throw new Error('Prepend filter requires a prepend value');
        }
    }
};
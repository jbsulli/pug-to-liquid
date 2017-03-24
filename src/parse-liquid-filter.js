"use strict";

module.exports = parseLiquidFilter;

const FILTERS = /^(join|first|last|concat|index|map|reverse|size|sort|uniq|color_to_rgb|color_to_hsl|color_extract|color_brightness|color_modify|color_lighten|color_darken|color_saturate|color_desaturate|color_mix|img_tag|script_tag|stylesheet_tag|abs|ceil|divided_by|floor|minus|plus|round|times|modulo|money|money_with_currency|money_without_trialing_zeros|money_without_currency|append|camelcase|capitalize|downcase|escape|handle|handleize|md5|sha256|hmac_sha1|hmac_sha256|newline_to_br|pluralize|prepend|remove|remove_first|replace|replace_first|slice|split|strip|lstrip|rstrip|strip_html|strip_newlines|truncate|truncatewords|upcase|url_encode|url_escape|url_param_escape|asset_url|asset_img_url|file_url|file_img_url|customer_login_link|global_asset_url|img_url|link_to|link_to_vendor|link_to_type|link_to_tag|link_to_add_tag|link_to_remove_tag|payment_type_img_url|payment_type_img_url|product_img_url|collection_img_url|shopify_asset_url|url_for_type|url_for_vendor|within|date|time_tag|default|default_errors|default_pagination|format_address|hex_to_rgba|highlight|highlight_active_tag|json|weight_with_unit|placeholder_svg_tag)(.*)/;

function parseLiquidFilter(filter_str){
    var match = filter_str.match(FILTERS);
    
    if(!match){
        throw new Error('Invalid filter [' + filter_str + ']');
    }
    
    var filter = {
        type: match[1]
    };
    
    if(match[2]){
        filter.content = match[2];
    }
    
    if(filter.type in filters){
        return filters[filter.type](filter);
    }
    else if(filter.content){
        throw new Error('Unexpected filter content [' + filter.content + ']');
    }
    
    return filter;
}

const filters = {
    
};
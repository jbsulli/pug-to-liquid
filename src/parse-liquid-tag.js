"use strict";

module.exports = parseLiquidTag;

const LOGIC_TAG = /^((?:end)?)(if|unless|else|elsif|case|when|for|break|continue|cycle|tablerow|comment|include|form|javascript|layout|paginate|raw|schema|section|stylesheet|assign|capture|increment|decrement)(.*)/;
const LOGIC_TAG_END = /^(if|unless|case|for|tablerow|comment|form|paginate|raw|schema|stylesheet|capture)$/;

function parseLiquidTag(tag, is_logic_tag){
    var data = tag.data;
    
    if(data.charAt(0) === '-'){
        tag.trim_left = true;
        data = data.substr(1);
    }
    
    data = data.trim();
    
    if(is_logic_tag){
        var match = data.match(LOGIC_TAG);
        
        if(!match){
            throw new Error('Invalid tag');
        }
        
        tag.type = match[1] + match[2];
        data = match[3].trim();
        
        if(match[1] && !match[2].match(LOGIC_TAG_END)){
            throw new Error('Invalid tag');
        }
        
        else if(tag.type.match(LOGIC_TAG_END)){
            tag.needs_end = true;
        }
    }
        
    if(data){
        tag.data = data;
    } else {
        delete tag.data;
    }
    
    if(tag.type in tags){
        return tags[tag](tag);
    }
    
    return tag;
}

const tags = {
    
};
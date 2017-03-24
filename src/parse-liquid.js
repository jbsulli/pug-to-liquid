"use strict";

module.exports = parseLiquid;

const parseTag = require('./parse-liquid-tag.js');

const FILTER_WHITESPACE = /[\s\uFEFF\xA0]/;

function parseLiquid(liquid, filename){
    return (new ParseLiquid(liquid, filename)).parsed;
}

function ParseLiquid(liquid, filename){
    if(typeof liquid !== 'string'){
        throw new Error('Liquid must be a string');
    }
    
    this.i = 0;
    this.len = liquid.length;
    this.liquid = liquid;
    this.parsed = [];
    this.filename = filename;
    
    this.parse();
}

ParseLiquid.prototype.parse = function(){
    var logic_tag = this.liquid.indexOf('{%', this.i);
    var print_tag = this.liquid.indexOf('{{', this.i);
    var tag = true;
    var tag_tree = [];
    var looking_for, found;
    
    while(true){
    
        if(logic_tag !== -1){
            logic_tag = (logic_tag >= this.i ? logic_tag : this.liquid.indexOf('{%', this.i));
        }
        if(print_tag !== -1){
            print_tag = (print_tag >= this.i ? print_tag : this.liquid.indexOf('{{', this.i));
        }
        
        if(!~print_tag && !~logic_tag){
            this.parsePlain(this.len);
            break;
        }
        
        if(print_tag === -1 || (logic_tag > -1  && logic_tag < print_tag)){
            this.parsePlain(logic_tag);
            tag = this.parseTag('%}');
        } else {
            this.parsePlain(print_tag);
            tag = this.parseTag('}}');
        }
        
        if(tag.needs_end){
            tag_tree.push(tag);
        } else {
            if(tag.type.length > 3 && tag.type.substr(0,3) === 'end'){
                looking_for = tag.type.substr(3);
                found = tag_tree.pop();
                if(found.type !== looking_for){
                    this.parseError(new Error('Missing tag end'), found.loc.start);
                }
            }
        }
    }
    
    if(tag_tree.length){
        this.parseError(new Error('Missing tag end'), tag_tree.pop().loc.start);
    }
    
    return this.parsed;
};

ParseLiquid.prototype.parseError = function(err, start){
    err.pos = start;
    
    var lines = this.liquid.substr(0, start).split(/(?:\r\n|\r|\n)/g);
    err.line = lines.length;
    err.col = lines[lines.length - 1].length + 1;
    
    throw err;
};

ParseLiquid.prototype.parsePlain = function(to){
    if(to === this.i){
        return;
    }
    this.parsed.push(this.token('html', this.i, to, this.liquid.substring(this.i, to)));
    this.i = to;
};

ParseLiquid.prototype.parseTag = function(end){
    var possible_end = end.charAt(0);
    var start = this.i;
    var tag_data = '';
    var filters, filter_start, filter_data;
    
    this.i += 2;
    
    for(var i = this.i; i < this.len; i = (this.i > i ? this.i : (this.i = i + 1))){
        switch(this.liquid.charAt(i)){
            case '"':
            case "'":
                this.parseTagString();
                break;
                
            case '|':
                if(!filters){
                    tag_data = this.liquid.substring(start + 2, i - 1);
                    filters = [];
                } else {
                    filter_data = this.liquid.substring(filter_start, this.i - 1).trim();
                    filters.push(this.token('filter', filter_start, filter_start + filter_data.length, filter_data));
                }
                
                // strip all whitespace in front of the next filter
                this.i++;
                this.parseWhitespace();
                filter_start = this.i;
                
                break;
            case possible_end:
                
                if(i < this.len - 1 && this.liquid.substr(i, 2) === end){
                    var trim_right = (this.liquid.substr(i - 1, 1) === '-');
                    
                    // wrap up the tag_data or filter
                    if(!filters){
                        tag_data = this.liquid.substring(start + 2, i - (1 + (trim_right ? 1 : 0)));
                    } else {
                        filter_data = this.liquid.substring(filter_start, this.i - (1 + (trim_right ? 1 : 0))).trim();
                        filters.push(this.token('filter', filter_start, filter_start + filter_data.length, filter_data));
                    }
                    
                    this.i += 2;
                    try {
                        var tag = this.token('tag', start, this.i, tag_data);
                        
                        if(filters){
                            tag.filters = filters;
                        }
                        
                        if(trim_right){
                            tag.trim_right = true;
                        }
                        
                        tag = parseTag(tag, (end === '%}'));
                        this.parsed.push(tag);
                        
                        return tag;
                    } catch(err){
                        this.parseError(err, start);
                    }
                }
        }
    }
    
    this.parseError(new Error("No tag end found"), start);
};

ParseLiquid.prototype.parseTagString = function(){
    var quote = this.liquid.charAt(this.i);
    var backslashes = 0;
    
    for(var i = this.i + 1; i < this.len; i++){
        switch(this.liquid.charAt(i)){
            case '\\':
                backslashes++;
                break;
            case quote:
                if(backslashes % 2 === 0){
                    this.i = i + 1;
                    return;
                }
                /* falls through */
            default:
                backslashes = 0;
        }
    }
    
    this.parseError(new Error('No string end found'), this.i);
};

ParseLiquid.prototype.parseWhitespace = function(){
    for(; this.i < this.len; this.i++){
        if(!this.liquid.charAt(this.i).match(FILTER_WHITESPACE)){
            return;
        }
    }
};

ParseLiquid.prototype.token = function(type, start, end, data){
    /*if(!data){
        data = {};
    }
    else if(typeof data !== 'object'){*/
        data = { data:data };
    //}
    
    data.type = type;
    data.loc = { start:start, filename:this.filename, end:end };
    
    return data;
};
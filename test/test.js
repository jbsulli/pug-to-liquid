"use strict";

/* globals it, expect */

const parseLiquid = require('../src/parse-liquid.js');

it('should parse null string', () => {
    expect(parseLiquid('', 'test.js')).toMatchSnapshot();
});

it('should parse plain text', () => {
    expect(parseLiquid('hello world!', 'test.js')).toMatchSnapshot();
});

it('should require a string', () => {
    expect(() => parseLiquid()).toThrow('Liquid must be a string');
});

it('should parse a plain liquid tag', () => {
    expect(parseLiquid('Hello, {{ first_name }}!')).toMatchSnapshot();
});

it('should parse filters', () => {
    expect(parseLiquid('Hello, {{ first_name | capitalize }}!')).toMatchSnapshot();
});

it('should parse a logic tag', () => {
    expect(parseLiquid('{% assign name = first_name | capitalize %}')).toMatchSnapshot();
});

it('should parse multiple filters', () => {
    expect(parseLiquid('{% assign name = first_name | capitalize | strip %}')).toMatchSnapshot();
});

it('should handle tag ends and filter splitters in string', () => {
    expect(parseLiquid('{% assign liquid_greeting = liquid_var | prepend:"{{ " | append:" | capitalize }}" %}')).toMatchSnapshot();
});

it('should handle string escaping', () => {
    expect(parseLiquid('{% assign name = last_name | prepend:"Hello Mr \\"" | append:"\\"" %}')).toMatchSnapshot();
});

it('should parse whitespace control characters', () => {
    expect(parseLiquid(`
        {%- if test %}
            {{- test -}}
        {%- elsif -%}
            {{- "hello " | append:"world!" -}}
        {% endif -%}
    `)).toMatchSnapshot();
});

it('should throw if tag string doesn\'t close', () => {
    expect(() => parseLiquid('{{ "world" | prepend:"hello }}')).toThrow('No string end found');
});

it('should throw if tag string doesn\'t close', () => {
    expect(() => parseLiquid('{{ "world" | prepend:"hello }}"...')).toThrow('No tag end found');
});

it('should throw if the tag is unknown', () => {
    expect(() => parseLiquid('{% unknownTag %}')).toThrow('Invalid tag');
    try {
        parseLiquid('{% unknownTag %}');
    } catch(err){
        expect(err.pos).toEqual(0);
        expect(err.line).toEqual(1);
        expect(err.col).toEqual(1);
    }
});

it('should throw when missing ending tag', () => {
    expect(() => parseLiquid('{% if test %}')).toThrow('Missing tag end');
    expect(() => parseLiquid('{% for test in testing %}{% if test %}{% endfor %}')).toThrow('Missing tag end');
});
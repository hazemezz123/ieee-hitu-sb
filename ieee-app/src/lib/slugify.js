export const slugify = text => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join('-')

---
layout: page
title: About
cover: '/assets/images/covers/cover7.jpg'
current: about
---

This is an open source blog platform that is based on Jekyll and hosted by Github. Everyone are free to join us to contribute your articles.

To run this blog on your machine, just follow these steps:

1. Clone the respository:
```
$ git clone https://github.com/botbie/blog.git
```
2. Install ruby 2.x and bundler:
```
$ brew install ruby
$ gem install bundler
```
3. Install required gems:
```
$ bundle install
```
4. Run the local server:
```
bundle exec jekyll serve
```
5. Access local server at: `http://localhost:4000/`

## How to become a contributor?
Like normal open source project on Github, you should fork `https://github.com/botbie/blog`, make changes and create a Pull Request.

If you are a new contributor, you must register your profile by adding an entry in `_data/authors.yml`, example:
```
just_another_cool_contributor:
  username: just_another_cool_contributor
  avatar: /assets/images/avatars/casper.png
  cover: /assets/images/covers/casper.jpg
  name: Cool Name
  location: In the shell
  intro: >
    I'm a ghost...
```

To add a new article, create a file in `_posts` with file name follow this format: `<year>-<month>-<day>-slug-of-the-article.md`

Article is just a markdown file with some information in Front Matter to describe your post, example:
```
---
layout: post
cover: 'assets/images/covers/cover2.jpg'
title: Article Title
date: 2017-08-10
tags: [cool, blog]
author: just_another_cool_contributor
description: >
  Description here.
---

Your main content here.
```

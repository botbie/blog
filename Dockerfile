FROM ruby:2.6

WORKDIR /blog

ARG BUNDLER_VERSION

ADD Gemfile Gemfile.lock ./

RUN gem install bundler:${BUNDLER_VERSION} && bundle install -j 4

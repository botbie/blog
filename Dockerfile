FROM ruby:3.3-slim

WORKDIR /blog

# Build-essential is required for native gem extensions (e.g. ffi, eventmachine).
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential \
 && rm -rf /var/lib/apt/lists/*

ADD Gemfile Gemfile.lock ./

RUN bundle install -j 4

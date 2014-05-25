source "https://rubygems.org"

gem "rails", "~> 4.0.0"

# required by newrelic_api gem
gem "activeresource", "~> 4.0.0"

gem "sass-rails", "~> 4.0.2"
gem "bootstrap-sass", "~> 2.3.2"
gem "bootswatch-rails"

gem 'sqlite3', '~> 1.3.8'
gem 'activerecord-postgresql-adapter', '~> 0.0.1'

# on windows replace with thin gem
gem "unicorn"

gem "faraday"
gem "faraday_middleware"
gem "multi_xml"
gem "libxml-ruby"

# see app/model/sources/number/jenkins_game.rb
gem "nokogiri"

# see app/model/sources/number/new_relic.rb
gem "newrelic_api"

# assets
gem "therubyracer"
gem "uglifier"

group :test, :development do
  gem "debugger"
  gem "rspec-rails"
  gem "factory_girl_rails"
  gem "mocha", :require => false
  gem "memory_test_fix", '~> 0.2.2'
  gem "rake"
  gem "pry"
  gem "pry-rails"
  gem "pry-doc"
  gem "pry-debugger"
  gem 'hirb'
end

group :development do
  gem "better_errors"
  gem "binding_of_caller"
  gem "foreman"
end

group :production do
  gem 'rails_12factor' # remove if not deploying on heroku
end

ruby "2.0.0"

gem "td_widgets", :path => "../gems/td_widgets"

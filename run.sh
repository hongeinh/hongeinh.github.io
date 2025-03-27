# Remove Gemfile.lock to avoid cache
rm Gemfile.lock

# Build the Docker image
docker build -t portfolio .

# Run the Docker container
# Linux or MacOS
docker run -it --rm -p 4000:4000 -v $(pwd):/usr/src/app portfolio

# Windows
docker run -d --rm -p 4000:4000 -v ${PWD}:/usr/src/app portfolio
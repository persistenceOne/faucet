#!/usr/bin/make -f

DOCKER := $(shell which docker)

DOCKER_IMAGE_NAME = persistenceone/faucet
DOCKER_TAG_NAME = latest
DOCKER_CONTAINER_NAME = faucet

docker-build:
	$(DOCKER) build  -t ${DOCKER_IMAGE_NAME}:${DOCKER_TAG_NAME} .

docker-build-push: docker-build
	$(DOCKER) push ${DOCKER_IMAGE_NAME}:${DOCKER_TAG_NAME}

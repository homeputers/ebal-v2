.PHONY: up down logs build web-build web-up web-down web-logs api-build api-up api-down api-logs

up down logs build web-build web-up web-down web-logs api-build api-up api-down api-logs:
	$(MAKE) -C infra $@

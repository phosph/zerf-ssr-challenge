-include .env

pgDump:
	docker-compose -f docker-compose.yml exec -T postgres10 pg_dump -h $(POSTGRES_HOST) -U $(POSTGRES_USER) -d $(POSTGRES_DB) --schema-only --no-owner --exclude-schema=graphile_migrate > data/schema.sql

# OpenAPI Documentation

This directory contains the API contract specifications for the ClubHub backend.

## Files

- `base.yaml` — Base OpenAPI specification with shared components and responses.
- `*.yaml` — Feature-specific contract extensions (if any).

## Usage

Contracts are used to generate Swagger UI documentation and validate request/response shapes.

- Base path: `/api/v1`
- Authentication: JWT Bearer token required for protected endpoints

## Contract Generation

The OpenAPI spec is maintained manually and aligned with implemented endpoints during Polish phase (T098).

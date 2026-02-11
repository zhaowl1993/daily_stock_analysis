# -*- coding: utf-8 -*-
"""
===================================
AI Provider listing endpoint
===================================

Provides GET /api/v1/providers so the frontend can dynamically
enumerate all configured AI providers (no secrets exposed).
"""

import logging
from fastapi import APIRouter

from api.v1.schemas.providers import ProviderInfo, ProviderListResponse
from src.config import get_config

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "",
    response_model=ProviderListResponse,
    summary="List configured AI providers",
    description="Returns all AI providers that have a valid API key. No secrets are exposed.",
)
def list_providers() -> ProviderListResponse:
    """
    Return public information about every configured AI provider.

    The frontend uses this to build a dynamic model selector dropdown
    and dynamic tabs for analysis results.
    """
    config = get_config()
    providers = config.get_available_providers()

    return ProviderListResponse(
        providers=[
            ProviderInfo(
                key=p.key,
                display_name=p.display_name,
                provider_type=p.provider_type,
                model=p.model or None,
            )
            for p in providers
        ]
    )


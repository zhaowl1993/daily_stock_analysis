# -*- coding: utf-8 -*-
"""
===================================
Provider schemas
===================================

Defines the response model for the /api/v1/providers endpoint.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ProviderInfo(BaseModel):
    """Public info about a configured AI provider (no secrets exposed)."""

    key: str = Field(..., description="Unique provider key, e.g. 'gemini', 'openai', 'qwen'")
    display_name: str = Field(..., description="Human-readable display name")
    provider_type: str = Field(..., description="'gemini' or 'openai_compatible'")
    model: Optional[str] = Field(None, description="Default model name")

    class Config:
        json_schema_extra = {
            "example": {
                "key": "qwen",
                "display_name": "通义千问",
                "provider_type": "openai_compatible",
                "model": "qwen-turbo",
            }
        }


class ProviderListResponse(BaseModel):
    """Response for GET /api/v1/providers."""

    providers: List[ProviderInfo] = Field(..., description="All configured AI providers")


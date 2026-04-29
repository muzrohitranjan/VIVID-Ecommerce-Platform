from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None

class Product(ProductBase):
    id: str
    seller_id: str = "default_seller"  # Mock
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True  # For Pydantic v2


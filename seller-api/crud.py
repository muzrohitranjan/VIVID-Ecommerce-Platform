from typing import List, Optional

# Lazy import
products_collection = None

def get_products_collection():
    global products_collection
    if products_collection is None:
        try:
            from database import products_collection as pc
            products_collection = pc
        except:
            products_collection = None
    return products_collection

async def create_product(product: ProductCreate) -> str:
    pc = get_products_collection()
    if pc:
        result = await pc.insert_one(product.model_dump())
        return str(result.inserted_id)
    return "mock_" + str(hash(product.name))

async def get_products() -> List[dict]:
    pc = get_products_collection()
    if pc:
        return await pc.find().to_list(length=100)
    return []

async def get_product(product_id: str) -> Optional[dict]:
    pc = get_products_collection()
    if pc:
        return await pc.find_one({"_id": product_id})
    return None

async def update_product(product_id: str, update_data: ProductUpdate):
    pc = get_products_collection()
    if pc:
        update_dict = {k: v for k, v in update_data.model_dump(exclude_unset=True).items() if v is not None}
        if update_dict:
            await pc.update_one({"_id": product_id}, {"$set": update_dict})
        return await get_product(product_id)
    return None

async def delete_product(product_id: str):
    pc = get_products_collection()
    if pc:
        await pc.delete_one({"_id": product_id})

